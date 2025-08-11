from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.deal import Deal, Investment
from app.schemas.deal import DealCreate, DealRead, InvestmentCreate, InvestmentRead

router = APIRouter(prefix="/deals", tags=["deals"]) 


@router.post("/", response_model=DealRead)
def create_deal(payload: DealCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    deal = Deal(**payload.model_dump())
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.get("/", response_model=List[DealRead])
def list_deals(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Deal).all()


@router.post("/{deal_id}/invest", response_model=InvestmentRead)
def invest(deal_id: int, payload: InvestmentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if payload.deal_id != deal_id:
        raise HTTPException(status_code=400, detail="deal_id mismatch")
    inv = Investment(**payload.model_dump())
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.get("/{deal_id}/investments", response_model=List[InvestmentRead])
def list_investments(deal_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Investment).filter(Investment.deal_id == deal_id).all()