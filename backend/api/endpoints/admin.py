from typing import Any, List, Dict

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