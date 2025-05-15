from typing import Any, List, Dict, Any, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/stats", response_model=Dict[str, Any])
def get_admin_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    관리자 대시보드 통계 (관리자/중재자만 가능)
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 사용자 통계
    total_users = db.query(func.count(models.User.id)).scalar()
    user_roles = db.query(
        models.User.role,
        func.count(models.User.id)
    ).group_by(models.User.role).all()
    
    # 게시물 통계
    total_posts = db.query(func.count(models.Post.id)).scalar()
    hidden_posts = db.query(func.count(models.Post.id)).filter(models.Post.is_hidden == True).scalar()
    
    # 댓글 통계
    total_comments = db.query(func.count(models.Comment.id)).scalar()
    hidden_comments = db.query(func.count(models.Comment.id)).filter(models.Comment.is_hidden == True).scalar()
    
    # 신고 통계
    total_reports = db.query(func.count(models.Report.id)).scalar()
    report_status = db.query(
        models.Report.status,
        func.count(models.Report.id)
    ).group_by(models.Report.status).all()
    
    # 기관 및 카테고리 수
    total_institutions = db.query(func.count(models.Institution.id)).scalar()
    total_categories = db.query(func.count(models.Category.id)).scalar()
    
    return {
        "users": {
            "total": total_users,
            "by_role": {role: count for role, count in user_roles}
        },
        "posts": {
            "total": total_posts,
            "hidden": hidden_posts
        },
        "comments": {
            "total": total_comments,
            "hidden": hidden_comments
        },
        "reports": {
            "total": total_reports,
            "by_status": {status: count for status, count in report_status}
        },
        "institutions": total_institutions,
        "categories": total_categories
    }


@router.get("/settings", response_model=List[schemas.Setting])
def get_settings(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    시스템 설정 조회 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    settings = db.query(models.Setting).all()
    return settings


@router.put("/settings/{key_name}", response_model=schemas.Setting)
def update_setting(
    *,
    db: Session = Depends(deps.get_db),
    key_name: str,
    setting_in: schemas.SettingUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    시스템 설정 업데이트 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    setting = db.query(models.Setting).filter(models.Setting.key_name == key_name).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    setting.value = setting_in.value
    if setting_in.description is not None:
        setting.description = setting_in.description
    
    db.add(setting)
    db.commit()
    db.refresh(setting)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_setting",
        description=f"Admin {current_user.username} updated setting {setting.key_name}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return setting


@router.get("/activity-logs", response_model=List[Dict[str, Any]])
def get_activity_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    user_id: int = None,
    action_type: str = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    활동 로그 조회 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.ActivityLog, models.User.username).join(
        models.User, models.ActivityLog.user_id == models.User.id
    )
    
    # 사용자별 필터링
    if user_id:
        query = query.filter(models.ActivityLog.user_id == user_id)
    
    # 액션 타입별 필터링
    if action_type:
        query = query.filter(models.ActivityLog.action_type == action_type)
    
    # 최신순 정렬
    query = query.order_by(models.ActivityLog.created_at.desc())
    
    # 페이지네이션
    logs = query.offset(skip).limit(limit).all()
    
    # 결과 포맷팅
    result = []
    for log, username in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "username": username,
            "action_type": log.action_type,
            "description": log.description,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        })
    
    return result

@router.get("/users/{user_id}", response_model=schemas.AdminUserDetail)
def get_admin_user_detail(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    관리자용 사용자 상세 정보 조회
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 게시물, 댓글, 좋아요, 싫어요 수 계산
    post_count = db.query(func.count(models.Post.id)).filter(models.Post.user_id == user_id).scalar()
    comment_count = db.query(func.count(models.Comment.id)).filter(models.Comment.user_id == user_id).scalar()
    like_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.user_id == user_id,
        models.Reaction.type == "like"
    ).scalar()
    dislike_count = db.query(func.count(models.Reaction.id)).filter(
        models.Reaction.user_id == user_id,
        models.Reaction.type == "dislike"
    ).scalar()
    
    # 최근 활동 시간 (가장 최근 활동 로그)
    last_activity = db.query(models.ActivityLog).filter(
        models.ActivityLog.user_id == user_id
    ).order_by(models.ActivityLog.created_at.desc()).first()
    
    last_active = last_activity.created_at if last_activity else None
    
    # 결과 반환
    result = {
        **schemas.User.from_orm(user).dict(),
        "post_count": post_count,
        "comment_count": comment_count,
        "like_count": like_count,
        "dislike_count": dislike_count,
        "last_active": last_active
    }
    
    return schemas.AdminUserDetail(**result)


@router.get("/users/{user_id}/restrictions", response_model=List[schemas.Restriction])
def get_user_restriction_history(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    사용자 제재 이력 조회
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    restrictions = db.query(models.RestrictionHistory).filter(
        models.RestrictionHistory.user_id == user_id
    ).order_by(models.RestrictionHistory.created_at.desc()).all()
    
    return restrictions


@router.get("/users/{user_id}/activities", response_model=Dict[str, Any])
def get_user_activities(
    user_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    action_type: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    사용자 활동 내역 조회
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.ActivityLog).filter(models.ActivityLog.user_id == user_id)
    
    # 액션 타입별 필터링
    if action_type:
        query = query.filter(models.ActivityLog.action_type == action_type)
    
    # 총 개수 계산
    total = query.count()
    
    # 최신순 정렬
    query = query.order_by(models.ActivityLog.created_at.desc())
    
    # 페이지네이션
    activities = query.offset(skip).limit(limit).all()
    
    return {
        "activities": activities,
        "total": total
    }


@router.put("/users/{user_id}/status", response_model=schemas.User)
def update_user_status(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    status_data: schemas.UserStatusUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    사용자 상태 업데이트 (제재 등)
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 사용자 상태 업데이트
    user.status = status_data.status
    user.suspended_until = status_data.suspended_until
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 제재 이력 기록
    restriction_type = "suspend" if status_data.status == "suspended" else "unsuspend"
    restriction = models.RestrictionHistory(
        user_id=user_id,
        type=restriction_type,
        reason=status_data.reason,
        duration=status_data.duration,
        suspended_until=status_data.suspended_until,
        created_by=current_user.id
    )
    db.add(restriction)
    db.commit()
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type=f"update_user_status_{restriction_type}",
        description=f"Admin {current_user.username} {restriction_type}ed user {user.username}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return user


@router.put("/users/{user_id}/role", response_model=schemas.User)
def update_user_role(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    role_data: schemas.UserRoleUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    사용자 역할 업데이트
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 사용자 역할 업데이트
    user.role = role_data.role
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_user_role",
        description=f"Admin {current_user.username} updated user {user.username} role to {user.role}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return user

@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    관리자 대시보드 통계 (관리자/중재자만 가능)
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 사용자 통계
    total_users = db.query(func.count(models.User.id)).scalar()
    active_users = db.query(func.count(models.User.id)).filter(models.User.status == "active").scalar()
    
    # 게시물 통계
    total_posts = db.query(func.count(models.Post.id)).scalar()
    hidden_posts = db.query(func.count(models.Post.id)).filter(models.Post.is_hidden == True).scalar()
    
    # 댓글 통계
    total_comments = db.query(func.count(models.Comment.id)).scalar()
    hidden_comments = db.query(func.count(models.Comment.id)).filter(models.Comment.is_hidden == True).scalar()
    
    # 신고 통계
    total_reports = db.query(func.count(models.Report.id)).scalar()
    pending_reports = db.query(func.count(models.Report.id)).filter(models.Report.status == "pending").scalar()
    
    # 최근 활동 통계
    now = datetime.utcnow()
    last_week = now - timedelta(days=7)
    new_users = db.query(func.count(models.User.id)).filter(models.User.created_at >= last_week).scalar()
    new_posts = db.query(func.count(models.Post.id)).filter(models.Post.created_at >= last_week).scalar()
    new_comments = db.query(func.count(models.Comment.id)).filter(models.Comment.created_at >= last_week).scalar()
    
    return {
        "userCount": total_users,
        "activeUserCount": active_users,
        "postCount": total_posts,
        "hiddenPostCount": hidden_posts,
        "commentCount": total_comments,
        "hiddenCommentCount": hidden_comments,
        "reportCount": total_reports,
        "pendingReportCount": pending_reports,
        "newUserCount": new_users,
        "newPostCount": new_posts,
        "newCommentCount": new_comments
    }

@router.get("/institutions/needs-update", response_model=Dict[str, Any])
def check_institutions_need_update(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    기관 정보 업데이트 필요 여부 확인
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 설명이 없는 기관 수
    incomplete_count = db.query(func.count(models.Institution.id)).filter(
        models.Institution.description.is_(None) | (models.Institution.description == "")
    ).scalar()
    
    # 최근 업데이트되지 않은 기관 수 (예: 6개월 이상)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    outdated_count = db.query(func.count(models.Institution.id)).filter(
        models.Institution.updated_at < six_months_ago
    ).scalar()
    
    return {
        "needsUpdate": incomplete_count > 0 or outdated_count > 0,
        "incompleteCount": incomplete_count,
        "outdatedCount": outdated_count
    }