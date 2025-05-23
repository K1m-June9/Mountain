from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/")#response_model=List[schemas.Report]
def read_reports(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    type: Optional[str] = None,  # 추가: 게시물/댓글 필터링
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    신고 목록 조회 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.Report)
    
    # 상태별 필터링
    if status:
        query = query.filter(models.Report.status == status)
    
    # 타입별 필터링 (게시물/댓글)
    if type == "post":
        query = query.filter(models.Report.post_id.isnot(None))
    elif type == "comment":
        query = query.filter(models.Report.comment_id.isnot(None))
    
    # 최신순 정렬
    query = query.order_by(models.Report.created_at.desc())
    
    # 페이지네이션
    total = query.count()
    reports = query.offset(skip).limit(limit).all()
    
    # 관련 게시물 및 댓글 정보 포함
    result = []
    for report in reports:
        report_dict = schemas.Report.from_orm(report).dict()
        
        # 게시물 정보 추가
        if report.post_id:
            post = db.query(models.Post).filter(models.Post.id == report.post_id).first()
            if post:
                report_dict["post"] = schemas.Post.from_orm(post).dict()
        
        # 댓글 정보 추가
        if report.comment_id:
            comment = db.query(models.Comment).filter(models.Comment.id == report.comment_id).first()
            if comment:
                report_dict["comment"] = schemas.Comment.from_orm(comment).dict()
        
        result.append(report_dict)
    
    return {
        "items": result,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }


@router.get("/{report_id}", response_model=schemas.Report)
def read_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    특정 신고 조회 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.put("/{report_id}", response_model=schemas.Report)
def update_report(
    *,
    db: Session = Depends(deps.get_db),
    report_id: int,
    report_in: schemas.ReportUpdate,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    신고 상태 업데이트 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # 신고 상태 업데이트
    report.status = report_in.status
    report.reviewed_by = current_user.id
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_report",
        description=f"User {current_user.username} updated report {report.id} status to {report.status}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    # 신고자에게 알림 생성
    notification = models.Notification(
        user_id=report.reporter_id,
        type="report_status",
        content=f"Your report has been {report.status}.",
        related_id=report.id
    )
    db.add(notification)
    db.commit()
    
    return report

@router.post("/", response_model=schemas.Report)
def create_report(
    *,
    db: Session = Depends(deps.get_db),
    report_in: schemas.ReportCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    신고 생성
    """
    # 신고 대상 확인 (게시물 또는 댓글)
    if report_in.post_id:
        # 게시물 존재 확인
        post = db.query(models.Post).filter(models.Post.id == report_in.post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
    elif report_in.comment_id:
        # 댓글 존재 확인
        comment = db.query(models.Comment).filter(models.Comment.id == report_in.comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
    else:
        raise HTTPException(status_code=400, detail="Either post_id or comment_id must be provided")
    
    # 신고 객체 생성
    report = models.Report(
        reporter_id=current_user.id,
        post_id=report_in.post_id,
        comment_id=report_in.comment_id,
        reason=report_in.reason,
        description=report_in.description,
        status="pending"
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # 자동 숨김 처리 로직
    # 1. 설정값 조회
    auto_hide_threshold_setting = db.query(models.Setting).filter(
        models.Setting.key_name == "report.autoHideThreshold"
    ).first()
    
    if auto_hide_threshold_setting:
        try:
            auto_hide_threshold = int(auto_hide_threshold_setting.value)
            
            # 2. 해당 게시물/댓글의 총 신고 수 확인
            if report_in.post_id:
                # 게시물에 대한 신고 수 계산
                total_reports = db.query(func.count(models.Report.id)).filter(
                    models.Report.post_id == report_in.post_id
                ).scalar()
                
                # 임계값 도달 시 게시물 숨김 처리
                if total_reports >= auto_hide_threshold:
                    post.is_hidden = True
                    db.add(post)
                    db.commit()
                    
            elif report_in.comment_id:
                # 댓글에 대한 신고 수 계산
                total_reports = db.query(func.count(models.Report.id)).filter(
                    models.Report.comment_id == report_in.comment_id
                ).scalar()
                
                # 임계값 도달 시 댓글 숨김 처리
                if total_reports >= auto_hide_threshold:
                    comment.is_hidden = True
                    db.add(comment)
                    db.commit()
                    
        except ValueError:
            # 설정값이 숫자가 아닌 경우 무시
            pass
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="create_report",
        description=f"User {current_user.username} reported {'post' if report_in.post_id else 'comment'} {report_in.post_id or report_in.comment_id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return report

@router.put("/{report_id}/approve", response_model=schemas.Report)
def approve_report(
    *,
    db: Session = Depends(deps.get_db),
    report_id: int,
    type: Optional[str] = None,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    신고 승인 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # 신고 상태 업데이트
    report.status = "reviewed"
    report.reviewed_by = current_user.id
    
    # 신고된 콘텐츠 숨김 처리
    if report.post_id:
        post = db.query(models.Post).filter(models.Post.id == report.post_id).first()
        if post:
            post.is_hidden = True
            db.add(post)
    elif report.comment_id:
        comment = db.query(models.Comment).filter(models.Comment.id == report.comment_id).first()
        if comment:
            comment.is_hidden = True
            db.add(comment)
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="approve_report",
        description=f"User {current_user.username} approved report {report.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    # 신고자에게 알림 생성
    notification = models.Notification(
        user_id=report.reporter_id,
        type="report_status",
        content=f"Your report has been approved.",
        related_id=report.id
    )
    db.add(notification)
    db.commit()
    
    return report

@router.put("/{report_id}/reject", response_model=schemas.Report)
def reject_report(
    *,
    db: Session = Depends(deps.get_db),
    report_id: int,
    type: Optional[str] = None,
    current_user: models.User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    신고 거부 (관리자/중재자만 가능)
    """
    # if current_user.role not in ["admin", "moderator"]:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # 신고 상태 업데이트
    report.status = "rejected"
    report.reviewed_by = current_user.id
    
    # 신고 거부 시 숨김 해제 처리
    if report.post_id:
        post = db.query(models.Post).filter(models.Post.id == report.post_id).first()
        if post and post.is_hidden:
            post.is_hidden = False
            db.add(post)
    elif report.comment_id:
        comment = db.query(models.Comment).filter(models.Comment.id == report.comment_id).first()
        if comment and comment.is_hidden:
            comment.is_hidden = False
            db.add(comment)
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="reject_report",
        description=f"User {current_user.username} rejected report {report.id}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    # 신고자에게 알림 생성
    notification = models.Notification(
        user_id=report.reporter_id,
        type="report_status",
        content=f"Your report has been rejected.",
        related_id=report.id
    )
    db.add(notification)
    db.commit()
    
    return report