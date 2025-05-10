from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Report])
def read_reports(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    신고 목록 조회 (관리자/중재자만 가능)
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    query = db.query(models.Report)
    
    # 상태별 필터링
    if status:
        query = query.filter(models.Report.status == status)
    
    # 최신순 정렬
    query = query.order_by(models.Report.created_at.desc())
    
    # 페이지네이션
    reports = query.offset(skip).limit(limit).all()
    
    return reports


@router.get("/{report_id}", response_model=schemas.Report)
def read_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    특정 신고 조회 (관리자/중재자만 가능)
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
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
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    신고 상태 업데이트 (관리자/중재자만 가능)
    """
    if current_user.role not in ["admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
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