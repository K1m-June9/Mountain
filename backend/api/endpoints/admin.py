from typing import Any, List, Dict, Any, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from backend import models, schemas
from backend.api import deps
import json
from fastapi.encoders import jsonable_encoder
from backend import models, schemas
from backend.api import deps
router = APIRouter()
"""
현재 사용중인 get_optional_current_user
토큰 관련 문제 미해결로 인해 사용중.

추후 토큰문제를 해결하여 get_current_active_user로 변경해야함.
"""
# 기본 설정값 정의
DEFAULT_SETTINGS = {
    "site": {
        "siteName": "Mountain",
        "siteDescription": "커뮤니티 플랫폼",
        "primaryColor": "#4f46e5",
        "secondaryColor": "#10b981",
        "logoUrl": "/logo.png",
        "faviconUrl": "/favicon.ico",
        "footerText": "© 2023 Mountain. All rights reserved.",
        "enableDarkMode": True,
        "defaultTheme": "system"
    },
    "report": {
        "autoHideThreshold": 3,
        "defaultSanctionPeriod": 7,
        "enableAutoSanction": False,
        "notifyAdminOnReport": True,
        "sanctionReasonRequired": True
    },
    "notification": {
        "notifyUserOnSanction": True,
        "notifyUserOnReportResult": True,
        "notifyAdminOnHighPriorityReport": True,
        "enableInAppNotifications": True,
        "enableBrowserNotifications": False
    }
}

# 설정 키 접두사 정의
SETTING_PREFIXES = {
    "site": "site.",
    "report": "report.",
    "notification": "notification."
}

@router.get("/stats", response_model=Dict[str, Any])
def get_admin_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    관리자 대시보드 통계 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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


# @router.get("/settings", response_model=List[schemas.Setting])
# def get_settings(
#     db: Session = Depends(deps.get_db),
#     current_user: models.User = Depends(deps.get_optional_current_user),
# ) -> Any:
#     """
#     시스템 설정 조회 (관리자만 가능)
#     """
#     # if current_user.role != "admin":
#     #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
#     settings = db.query(models.Setting).all()
#     return settings


@router.put("/settings/{key_name}", response_model=schemas.Setting)
def update_setting(
    *,
    db: Session = Depends(deps.get_db),
    key_name: str,
    setting_in: schemas.SettingUpdate,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    시스템 설정 업데이트 (관리자만 가능)
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    활동 로그 조회 (관리자만 가능)
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    관리자용 사용자 상세 정보 조회
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 현재 존재하는 게시물 수 (숨김 여부 상관없이)
    post_count = db.query(func.count(models.Post.id)).filter(
        models.Post.user_id == user_id
    ).scalar()
    
    # 생성한 게시물 수 (ActivityLog에서 계산)
    created_post_count = db.query(func.count(models.ActivityLog.id)).filter(
        models.ActivityLog.user_id == user_id,
        models.ActivityLog.action_type == "create_post"
    ).scalar()
    
    # 삭제한 게시물 수 (ActivityLog에서 계산)
    deleted_post_count = db.query(func.count(models.ActivityLog.id)).filter(
        models.ActivityLog.user_id == user_id,
        models.ActivityLog.action_type == "delete_post"
    ).scalar()
    
    # 현재 존재하는 댓글 수 (숨김 여부 상관없이)
    comment_count = db.query(func.count(models.Comment.id)).filter(
        models.Comment.user_id == user_id
    ).scalar()
    
    # 생성한 댓글 수 (ActivityLog에서 계산)
    created_comment_count = db.query(func.count(models.ActivityLog.id)).filter(
        models.ActivityLog.user_id == user_id,
        models.ActivityLog.action_type == "create_comment"
    ).scalar()
    
    # 삭제한 댓글 수 (ActivityLog에서 계산)
    deleted_comment_count = db.query(func.count(models.ActivityLog.id)).filter(
        models.ActivityLog.user_id == user_id,
        models.ActivityLog.action_type == "delete_comment"
    ).scalar()
    
    # 좋아요, 싫어요 수
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
        "created_post_count": created_post_count,
        "deleted_post_count": deleted_post_count,
        "created_comment_count": created_comment_count,
        "deleted_comment_count": deleted_comment_count,
        "last_active": last_active
    }
    
    return schemas.AdminUserDetail(**result)


@router.get("/users/{user_id}/restrictions", response_model=List[schemas.Restriction])
def get_user_restriction_history(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자 제재 이력 조회
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자 활동 내역 조회
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.ActivityLog).filter(models.ActivityLog.user_id == user_id)
    
    # 액션 타입별 필터링
    if action_type:
        # 특수 케이스 처리: "post"는 "create_post"와 "delete_post"를 포함
        if action_type == "post":
            query = query.filter(
                or_(
                    models.ActivityLog.action_type == "create_post",
                    models.ActivityLog.action_type == "delete_post"
                )
            )
        # 특수 케이스 처리: "comment"는 "create_comment"와 "delete_comment"를 포함
        elif action_type == "comment":
            query = query.filter(
                or_(
                    models.ActivityLog.action_type == "create_comment",
                    models.ActivityLog.action_type == "delete_comment"
                )
            )
        # 특수 케이스 처리: "like"는 "like"와 관련된 모든 액션 포함
        elif action_type == "like":
            query = query.filter(models.ActivityLog.action_type.like("%like%"))
        # 특수 케이스 처리: "dislike"는 "dislike"와 관련된 모든 액션 포함
        elif action_type == "dislike":
            query = query.filter(models.ActivityLog.action_type.like("%dislike%"))
        # 일반 케이스: 정확히 일치하는 액션 타입
        else:
            query = query.filter(models.ActivityLog.action_type == action_type)
    
    # 총 개수 계산
    total = query.count()
    
    # 최신순 정렬
    query = query.order_by(models.ActivityLog.created_at.desc())
    
    # 페이지네이션
    activities = query.offset(skip).limit(limit).all()
    activities_json = jsonable_encoder(activities)
    return {
        "activities": activities_json,
        "total": total
    }

@router.get("/users/{user_id}/reactions", response_model=Dict[str, Any])
def get_user_reactions(
    user_id: int,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    type: Optional[str] = None,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자의 반응(좋아요/싫어요) 내역 조회
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 기본 쿼리 생성
    query = db.query(models.Reaction).filter(models.Reaction.user_id == user_id)
    
    # 반응 타입별 필터링
    if type and type in ["like", "dislike"]:
        query = query.filter(models.Reaction.type == type)
    
    # 총 개수 계산
    total = query.count()
    
    # 최신순 정렬
    query = query.order_by(models.Reaction.created_at.desc())
    
    # 페이지네이션
    reactions = query.offset(skip).limit(limit).all()
    
    # 결과 구성
    result_reactions = []
    for reaction in reactions:
        # 반응 대상 정보 가져오기
        target_type = "post" if reaction.post_id else "comment"
        target_id = reaction.post_id if reaction.post_id else reaction.comment_id
        
        # 사용자 정보 가져오기
        user = db.query(models.User).filter(models.User.id == user_id).first()
        username = user.username if user else "Unknown User"
        
        # 설명 생성
        description = f"User {username} {reaction.type}d {target_type} {target_id}"
        
        # 반응 객체 생성
        reaction_dict = {
            "id": reaction.id,
            "user_id": reaction.user_id,
            "action_type": reaction.type,  # 활동 로그와 형식 맞추기
            "description": description,
            "created_at": reaction.created_at
        }
        result_reactions.append(reaction_dict)
    
    return {
        "activities": result_reactions,  # 활동 로그와 형식 맞추기
        "total": total
    }


@router.put("/users/{user_id}/status", response_model=schemas.User)
def update_user_status(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    status_data: schemas.UserStatusUpdate,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자 상태 업데이트 (제재 등)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자 역할 업데이트
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    관리자 대시보드 통계 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    기관 정보 업데이트 필요 여부 확인
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
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

@router.get("/comments", response_model=Dict[str, Any])
def get_admin_comments(
    db: Session = Depends(deps.get_db),
    page: int = 1,
    limit: int = 10,
    status: str = None,
    search: str = None,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    관리자용 댓글 목록 조회
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 기본 쿼리 생성
    query = db.query(models.Comment).join(
        models.User, models.Comment.user_id == models.User.id
    ).join(
        models.Post, models.Comment.post_id == models.Post.id
    )
    
    # 상태 필터링
    if status:
        if status == "hidden":
            query = query.filter(models.Comment.is_hidden == True)
        elif status == "visible":
            query = query.filter(models.Comment.is_hidden == False)
        elif status == "reported":
            # 신고된 댓글 필터링
            reported_comment_ids = db.query(models.Report.comment_id).filter(
                models.Report.comment_id != None
            ).distinct()
            query = query.filter(models.Comment.id.in_(reported_comment_ids))
    
    # 검색어 필터링
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Comment.content.ilike(search_term),
                models.User.username.ilike(search_term)
            )
        )
    
    # 총 항목 수 계산
    total_items = query.count()
    total_pages = (total_items + limit - 1) // limit if total_items > 0 else 1
    
    # 페이지네이션
    offset = (page - 1) * limit
    comments = query.order_by(models.Comment.created_at.desc()).offset(offset).limit(limit).all()
    
    # 결과 구성
    result_comments = []
    for comment in comments:
        # 신고 정보 가져오기
        reports = db.query(models.Report).filter(models.Report.comment_id == comment.id).all()
        report_info = []
        for report in reports:
            report_info.append({
                "reason": report.reason,
                "description": report.description
            })
        
        # 게시글 제목 가져오기
        post_title = comment.post.title if comment.post else "Unknown Post"
        
        # 댓글 객체 생성
        comment_dict = {
            **schemas.Comment.model_validate(comment).model_dump(),
            "author": comment.user.username,
            "postTitle": post_title,
            "reports": report_info
        }
        result_comments.append(comment_dict)
    
    return {
        "comments": result_comments,
        "totalPages": total_pages,
        "totalItems": total_items
    }

@router.get("/users")#, response_model=List[schemas.User]
def get_admin_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    관리자용 사용자 목록 조회 (필터링 및 페이지네이션 지원)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.User)
    
    # 검색어 필터링
    if search:
        query = query.filter(
            or_(
                models.User.username.ilike(f"%{search}%"),
                models.User.email.ilike(f"%{search}%")
            )
        )
    
    # 역할 필터링
    if role and role != "all":
        query = query.filter(models.User.role == role)
    
    # 상태 필터링
    if status and status != "all":
        query = query.filter(models.User.status == status)
    
    # 총 사용자 수 계산
    total = query.count()
    
    # 페이지네이션
    users = query.offset(skip).limit(limit).all()
    # SQLAlchemy 모델을 JSON으로 직접 변환
    user_dicts = jsonable_encoder(users)
    # 응답 형식 구성
    return {
        "items": user_dicts,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@router.get("/settings", response_model=Dict[str, Any])
def get_all_settings(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    모든 설정을 섹션별로 그룹화하여 가져옵니다.
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 데이터베이스에서 모든 설정 가져오기
    settings = db.query(models.Setting).all()
    
    # 결과를 섹션별로 그룹화
    result = {
        "site": {},
        "report": {},
        "notification": {}
    }
    
    # 설정이 없으면 기본값으로 초기화
    if not settings:
        for section, defaults in DEFAULT_SETTINGS.items():
            for key, value in defaults.items():
                setting = models.Setting(
                    key_name=f"{SETTING_PREFIXES[section]}{key}",
                    value=json.dumps(value),
                    description=f"{section} setting - {key}"
                )
                db.add(setting)
            
        db.commit()
        return DEFAULT_SETTINGS
    
    # 설정을 섹션별로 분류
    for setting in settings:
        for section, prefix in SETTING_PREFIXES.items():
            if setting.key_name.startswith(prefix):
                key = setting.key_name[len(prefix):]  # 접두사 제거
                try:
                    result[section][key] = json.loads(setting.value)
                except json.JSONDecodeError:
                    result[section][key] = setting.value
    
    # 누락된 설정이 있으면 기본값으로 채우기
    for section, defaults in DEFAULT_SETTINGS.items():
        for key, value in defaults.items():
            if key not in result[section]:
                # 데이터베이스에 추가
                setting = models.Setting(
                    key_name=f"{SETTING_PREFIXES[section]}{key}",
                    value=json.dumps(value),
                    description=f"{section} setting - {key}"
                )
                db.add(setting)
                # 결과에 추가
                result[section][key] = value
    
    if db.in_transaction():
        db.commit()
    
    return result


@router.get("/settings/{section}", response_model=Dict[str, Any])
def get_section_settings(
    section: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    특정 섹션의 설정을 가져옵니다.
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if section not in SETTING_PREFIXES:
        raise HTTPException(status_code=404, detail=f"Section {section} not found")
    
    prefix = SETTING_PREFIXES[section]
    
    # 데이터베이스에서 해당 섹션의 설정 가져오기
    settings = db.query(models.Setting).filter(
        models.Setting.key_name.startswith(prefix)
    ).all()
    
    result = {}
    
    # 설정 파싱
    for setting in settings:
        key = setting.key_name[len(prefix):]  # 접두사 제거
        try:
            result[key] = json.loads(setting.value)
        except json.JSONDecodeError:
            result[key] = setting.value
    
    # 누락된 설정이 있으면 기본값으로 채우기
    for key, value in DEFAULT_SETTINGS[section].items():
        if key not in result:
            # 데이터베이스에 추가
            setting = models.Setting(
                key_name=f"{prefix}{key}",
                value=json.dumps(value),
                description=f"{section} setting - {key}"
            )
            db.add(setting)
            db.commit()
            # 결과에 추가
            result[key] = value
    
    return result


@router.put("/settings/{section}", response_model=Dict[str, Any])
def update_section_settings(
    section: str,
    settings_data: Dict[str, Any] = Body(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    특정 섹션의 설정을 업데이트합니다.
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if section not in SETTING_PREFIXES:
        raise HTTPException(status_code=404, detail=f"Section {section} not found")
    
    prefix = SETTING_PREFIXES[section]
    
    # 각 설정 업데이트
    for key, value in settings_data.items():
        setting_key = f"{prefix}{key}"
        
        # 설정이 이미 존재하는지 확인
        setting = db.query(models.Setting).filter(
            models.Setting.key_name == setting_key
        ).first()
        
        if setting:
            # 기존 설정 업데이트
            setting.value = json.dumps(value)
        else:
            # 새 설정 추가
            setting = models.Setting(
                key_name=setting_key,
                value=json.dumps(value),
                description=f"{section} setting - {key}"
            )
            db.add(setting)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_settings",
        description=f"Admin {current_user.username} updated {section} settings",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    
    db.commit()
    
    # 업데이트된 설정 반환
    return get_section_settings(section, db, current_user)


@router.post("/settings/{section}/reset", response_model=Dict[str, Any])
def reset_section_settings(
    section: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    특정 섹션의 설정을 기본값으로 초기화합니다.
    """
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if section not in SETTING_PREFIXES:
        raise HTTPException(status_code=404, detail=f"Section {section} not found")
    
    prefix = SETTING_PREFIXES[section]
    
    # 해당 섹션의 모든 설정 삭제
    db.query(models.Setting).filter(
        models.Setting.key_name.startswith(prefix)
    ).delete()
    
    # 기본값으로 설정 추가
    for key, value in DEFAULT_SETTINGS[section].items():
        setting = models.Setting(
            key_name=f"{prefix}{key}",
            value=json.dumps(value),
            description=f"{section} setting - {key}"
        )
        db.add(setting)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="reset_settings",
        description=f"Admin {current_user.username} reset {section} settings to defaults",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    
    db.commit()
    
    # 초기화된 설정 반환
    return DEFAULT_SETTINGS[section]

@router.get("/user-dashboard-stats", response_model=schemas.UserDashboardStats)
def get_user_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    사용자 통계 대시보드용 데이터 제공
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 사용자 총계 및 상태별 통계
    total_users = db.query(func.count(models.User.id)).scalar()
    active_users = db.query(func.count(models.User.id)).filter(models.User.status == "active").scalar()
    inactive_users = db.query(func.count(models.User.id)).filter(models.User.status == "inactive").scalar()
    suspended_users = db.query(func.count(models.User.id)).filter(models.User.status == "suspended").scalar()
    
    # 역할별 사용자 통계
    role_stats = db.query(
        models.User.role,
        func.count(models.User.id)
    ).group_by(models.User.role).all()
    
    # 월별 신규 사용자 통계 (최근 6개월)
    now = datetime.utcnow()
    monthly_stats = []
    
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1) - timedelta(days=30*i)
        month_end = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
        
        month_name = month_start.strftime("%Y-%m")
        new_users = db.query(func.count(models.User.id)).filter(
            models.User.created_at >= month_start,
            models.User.created_at <= month_end
        ).scalar()
        
        active_users_month = db.query(func.count(models.ActivityLog.user_id.distinct())).filter(
            models.ActivityLog.created_at >= month_start,
            models.ActivityLog.created_at <= month_end
        ).scalar()
        
        monthly_stats.append({
            "month": month_name,
            "newUsers": new_users,
            "activeUsers": active_users_month
        })
    
    # 기관별 게시물 통계
    institution_stats = db.query(
        models.Institution.name,
        func.count(models.Post.id)
    ).join(
        models.Post,
        models.Post.institution_id == models.Institution.id
    ).group_by(models.Institution.name).limit(5).all()
    
    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "inactiveUsers": inactive_users,
        "suspendedUsers": suspended_users,
        "roleStats": [{"role": role, "count": count} for role, count in role_stats],
        "statusStats": [
            {"status": "active", "count": active_users},
            {"status": "inactive", "count": inactive_users},
            {"status": "suspended", "count": suspended_users}
        ],
        "monthlyStats": monthly_stats,
        "institutionStats": [{"institution": name, "count": count} for name, count in institution_stats]
    }