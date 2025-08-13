from sqlalchemy.orm import Session
from datetime import date, timedelta

from . import models, schemas

# --- Unit ---
def get_unit(db: Session, unit_id: int):
    return db.query(models.Unit).filter(models.Unit.id == unit_id).first()

def get_units(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Unit).offset(skip).limit(limit).all()

def create_unit(db: Session, unit: schemas.UnitCreate):
    db_unit = models.Unit(**unit.dict())
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

def update_unit(db: Session, unit_id: int, unit_data: schemas.UnitCreate):
    db_unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not db_unit:
        return None
    for key, value in unit_data.dict().items():
        setattr(db_unit, key, value)
    db.commit()
    db.refresh(db_unit)
    return db_unit

def delete_unit(db: Session, unit_id: int):
    db_unit = db.query(models.Unit).filter(models.Unit.id == unit_id).first()
    if not db_unit:
        return None
    db.delete(db_unit)
    db.commit()
    return db_unit

# --- Partner ---
def get_partners(db: Session):
    return db.query(models.Partner).all()

def create_partner(db: Session, partner: schemas.PartnerCreate):
    db_partner = models.Partner(**partner.dict())
    db.add(db_partner)
    db.commit()
    db.refresh(db_partner)
    return db_partner

def update_partner(db: Session, partner_id: int, partner_data: schemas.PartnerCreate):
    db_partner = db.query(models.Partner).filter(models.Partner.id == partner_id).first()
    if not db_partner:
        return None
    for key, value in partner_data.dict().items():
        setattr(db_partner, key, value)
    db.commit()
    db.refresh(db_partner)
    return db_partner

def delete_partner(db: Session, partner_id: int):
    db_partner = db.query(models.Partner).filter(models.Partner.id == partner_id).first()
    if not db_partner:
        return None
    # Add a check here to prevent deleting partner if associated with a unit
    if db_partner.units:
        raise ValueError("Cannot delete partner associated with a unit.")
    db.delete(db_partner)
    db.commit()
    return db_partner

# --- Customer ---
def get_customers(db: Session):
    return db.query(models.Customer).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer_data: schemas.CustomerCreate):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        return None
    for key, value in customer_data.dict().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not db_customer:
        return None
    if db_customer.contracts:
        raise ValueError("Cannot delete customer with existing contracts.")
    db.delete(db_customer)
    db.commit()
    return db_customer

# --- Contract ---
def get_contracts(db: Session):
    return db.query(models.Contract).all()

def create_contract(db: Session, contract: schemas.ContractCreate):
    # Create the contract
    db_contract = models.Contract(
        unit_id=contract.unit_id,
        customer_id=contract.customer_id,
        total_price=contract.total_price,
        down_payment=contract.down_payment,
        contract_date=contract.contract_date
    )
    db.add(db_contract)
    db.flush() # Use flush to get the contract ID before committing

    # Create down payment if it exists
    if contract.down_payment > 0:
        db_payment = models.Payment(
            contract_id=db_contract.id,
            amount=contract.down_payment,
            date=contract.contract_date,
            method="مقدم"
        )
        db.add(db_payment)

    # Generate and create installments
    remaining_amount = contract.total_price - contract.down_payment
    if contract.installments_num > 0:
        installment_amount = round(remaining_amount / contract.installments_num, 2)
        current_due_date = contract.start_date
        for i in range(contract.installments_num):
            db_installment = models.Installment(
                contract_id=db_contract.id,
                amount=installment_amount,
                due_date=current_due_date,
                status="غير مدفوع"
            )
            db.add(db_installment)
            # Move to the next month
            # This is a simplified way, for more complex scenarios, dateutil.relativedelta is better
            if current_due_date.month == 12:
                current_due_date = date(current_due_date.year + 1, 1, current_due_date.day)
            else:
                current_due_date = date(current_due_date.year, current_due_date.month + 1, current_due_date.day)

    db.commit()
    db.refresh(db_contract)
    return db_contract

# --- Installments ---
def get_installments(db: Session):
    return db.query(models.Installment).all()

def pay_installment(db: Session, installment_id: int, payment_info: schemas.PaymentCreate):
    installment = db.query(models.Installment).filter(models.Installment.id == installment_id).first()
    if not installment:
        raise ValueError("Installment not found")
    if installment.status == "مدفوع":
        raise ValueError("Installment is already paid")

    paid_amount = payment_info.amount
    if paid_amount <= 0 or paid_amount > installment.amount:
        raise ValueError("Invalid payment amount")

    # Create payment record
    new_payment = models.Payment(
        contract_id=installment.contract_id,
        installment_id=installment.id,
        amount=paid_amount,
        date=payment_info.date,
        method="قسط"
    )
    db.add(new_payment)

    # Update installment
    installment.amount -= paid_amount
    if installment.amount < 0.01:
        installment.amount = 0
        installment.status = "مدفوع"

    db.commit()
    db.refresh(installment)
    return installment

def delete_installment(db: Session, installment_id: int):
    installment = db.query(models.Installment).filter(models.Installment.id == installment_id).first()
    if not installment:
        return None
    if installment.payment:
        raise ValueError("Cannot delete an installment with an associated payment.")
    db.delete(installment)
    db.commit()
    return installment

# --- Payments ---
def get_payments(db: Session):
    return db.query(models.Payment).all()

def delete_payment(db: Session, payment_id: int):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        return None

    # If it was an installment payment, revert the installment
    if payment.installment_id:
        installment = db.query(models.Installment).filter(models.Installment.id == payment.installment_id).first()
        if installment:
            installment.amount += payment.amount
            installment.status = "غير مدفوع"

    db.delete(payment)
    db.commit()
    return payment
