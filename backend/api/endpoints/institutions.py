from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Institution])
def read_institutions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    기관 목록 조회
    """
    institutions = db.query(models.Institution).offset(skip).limit(limit).all()
    return institutions


@router.post("/", response_model=schemas.Institution)
def create_institution(
    *,
    db: Session = Depends(deps.get_db),
    institution_in: schemas.InstitutionCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    새 기관 생성 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # 이미 존재하는 기관인지 확인
    existing = db.query(models.Institution).filter(models.Institution.name == institution_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Institution with this name already exists")
    
    institution = models.Institution(**institution_in.dict())
    db.add(institution)
    db.commit()
    db.refresh(institution)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="create_institution",
        description=f"Admin {current_user.username} created institution {institution.name}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return institution


@router.get("/{institution_id}", response_model=schemas.Institution)
def read_institution(
    institution_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    특정 기관 조회
    """
    institution = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    return institution


@router.put("/{institution_id}", response_model=schemas.Institution)
def update_institution(
    *,
    db: Session = Depends(deps.get_db),
    institution_id: int,
    institution_in: schemas.InstitutionUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    기관 정보 수정 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    institution = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # 이름 중복 확인
    if institution_in.name is not None:
        existing = db.query(models.Institution).filter(
            models.Institution.name == institution_in.name,
            models.Institution.id != institution_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Institution with this name already exists")
    
    # 기관 정보 업데이트
    if institution_in.name is not None:
        institution.name = institution_in.name
    if institution_in.description is not None:
        institution.description = institution_in.description
    
    db.add(institution)
    db.commit()
    db.refresh(institution)
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="update_institution",
        description=f"Admin {current_user.username} updated institution {institution.name}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    db.commit()
    
    return institution


@router.delete("/{institution_id}", response_model=schemas.Institution)
def delete_institution(
    *,
    db: Session = Depends(deps.get_db),
    institution_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    기관 삭제 (관리자만 가능)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    institution = db.query(models.Institution).filter(models.Institution.id == institution_id).first()
    if not institution:
        raise HTTPException(status_code=404, detail="Institution not found")
    
    # 활동 로그 기록
    activity_log = models.ActivityLog(
        user_id=current_user.id,
        action_type="delete_institution",
        description=f"Admin {current_user.username} deleted institution {institution.name}",
        ip_address="127.0.0.1"  # 실제 구현에서는 요청의 IP 주소를 가져와야 함
    )
    db.add(activity_log)
    
    # 기관 삭제
    db.delete(institution)
    db.commit()
    
    return institution