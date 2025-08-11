from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.property import Property, Unit, Expense
from app.schemas.property import PropertyCreate, PropertyRead

router = APIRouter(prefix="/properties", tags=["properties"]) 


@router.post("/", response_model=PropertyRead)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    prop = Property(
        name=payload.name,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        property_type=payload.property_type,
        purchase_price=payload.purchase_price,
        square_feet=payload.square_feet,
    )
    db.add(prop)
    db.flush()

    for u in payload.units:
        db.add(Unit(property_id=prop.id, **u.model_dump()))

    for e in payload.expenses:
        db.add(Expense(property_id=prop.id, **e.model_dump()))

    db.commit()
    db.refresh(prop)
    return prop


@router.get("/", response_model=List[PropertyRead])
def list_properties(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Property).all()


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(property_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop