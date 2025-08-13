from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["null"] # Allow file:// origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root ---
@app.get("/")
def read_root():
    return {"status": "ok"}

# --- Units ---
@app.get("/api/units/", response_model=List[schemas.Unit])
def read_units(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    units = crud.get_units(db, skip=skip, limit=limit)
    return units

@app.post("/api/units/", response_model=schemas.Unit)
def create_unit(unit: schemas.UnitCreate, db: Session = Depends(get_db)):
    return crud.create_unit(db=db, unit=unit)

@app.put("/api/units/{unit_id}", response_model=schemas.Unit)
def update_unit(unit_id: int, unit: schemas.UnitCreate, db: Session = Depends(get_db)):
    db_unit = crud.update_unit(db, unit_id, unit)
    if db_unit is None:
        raise HTTPException(status_code=404, detail="Unit not found")
    return db_unit

@app.delete("/api/units/{unit_id}", response_model=schemas.Unit)
def delete_unit(unit_id: int, db: Session = Depends(get_db)):
    db_unit = crud.delete_unit(db, unit_id)
    if db_unit is None:
        raise HTTPException(status_code=404, detail="Unit not found")
    return db_unit

# --- Partners ---
@app.get("/api/partners/", response_model=List[schemas.Partner])
def read_partners(db: Session = Depends(get_db)):
    return crud.get_partners(db)

@app.post("/api/partners/", response_model=schemas.Partner)
def create_partner(partner: schemas.PartnerCreate, db: Session = Depends(get_db)):
    return crud.create_partner(db=db, partner=partner)

@app.put("/api/partners/{partner_id}", response_model=schemas.Partner)
def update_partner(partner_id: int, partner: schemas.PartnerCreate, db: Session = Depends(get_db)):
    db_partner = crud.update_partner(db, partner_id, partner)
    if db_partner is None:
        raise HTTPException(status_code=404, detail="Partner not found")
    return db_partner

@app.delete("/api/partners/{partner_id}", response_model=schemas.Partner)
def delete_partner(partner_id: int, db: Session = Depends(get_db)):
    try:
        db_partner = crud.delete_partner(db, partner_id)
        if db_partner is None:
            raise HTTPException(status_code=404, detail="Partner not found")
        return db_partner
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Customers ---
@app.get("/api/customers/", response_model=List[schemas.Customer])
def read_customers(db: Session = Depends(get_db)):
    return crud.get_customers(db)

@app.post("/api/customers/", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db=db, customer=customer)

@app.put("/api/customers/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    db_customer = crud.update_customer(db, customer_id, customer)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@app.delete("/api/customers/{customer_id}", response_model=schemas.Customer)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    try:
        db_customer = crud.delete_customer(db, customer_id)
        if db_customer is None:
            raise HTTPException(status_code=404, detail="Customer not found")
        return db_customer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Contracts ---
@app.get("/api/contracts/", response_model=List[schemas.Contract])
def read_contracts(db: Session = Depends(get_db)):
    return crud.get_contracts(db)

@app.post("/api/contracts/", response_model=schemas.Contract)
def create_contract(contract: schemas.ContractCreate, db: Session = Depends(get_db)):
    return crud.create_contract(db=db, contract=contract)

# --- Installments ---
@app.get("/api/installments/", response_model=List[schemas.Installment])
def read_installments(db: Session = Depends(get_db)):
    return crud.get_installments(db)

@app.post("/api/installments/{installment_id}/pay", response_model=schemas.Installment)
def pay_installment(installment_id: int, payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    try:
        return crud.pay_installment(db, installment_id, payment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/installments/{installment_id}", response_model=schemas.Installment)
def delete_installment(installment_id: int, db: Session = Depends(get_db)):
    try:
        db_installment = crud.delete_installment(db, installment_id)
        if db_installment is None:
            raise HTTPException(status_code=404, detail="Installment not found")
        return db_installment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Payments ---
@app.get("/api/payments/", response_model=List[schemas.Payment])
def read_payments(db: Session = Depends(get_db)):
    return crud.get_payments(db)

@app.delete("/api/payments/{payment_id}", response_model=schemas.Payment)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = crud.delete_payment(db, payment_id)
    if db_payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return db_payment

# A single endpoint to get all data at once for the initial load
@app.get("/api/all-data/")
def read_all_data(db: Session = Depends(get_db)):
    return {
        "units": crud.get_units(db),
        "partners": crud.get_partners(db),
        "customers": crud.get_customers(db),
        "contracts": crud.get_contracts(db),
        "installments": crud.get_installments(db),
        "payments": crud.get_payments(db),
    }
