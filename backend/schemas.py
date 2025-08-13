from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# --- Partner Schemas ---
class PartnerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    notes: Optional[str] = None

class PartnerCreate(PartnerBase):
    pass

class Partner(PartnerBase):
    id: int
    class Config:
        orm_mode = True

# --- UnitPartner Schemas ---
class UnitPartnerBase(BaseModel):
    partner_id: int
    ownership: float

class UnitPartnerCreate(UnitPartnerBase):
    pass

class UnitPartner(UnitPartnerBase):
    partner: Partner
    class Config:
        orm_mode = True

# --- Unit Schemas ---
class UnitBase(BaseModel):
    code: str
    unit_type: Optional[str] = None
    area: Optional[float] = None
    price: Optional[float] = None
    notes: Optional[str] = None

class UnitCreate(UnitBase):
    pass

class Unit(UnitBase):
    id: int
    partners: List[UnitPartner] = []
    class Config:
        orm_mode = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    national_id: Optional[str] = None
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    class Config:
        orm_mode = True

# --- Payment Schemas ---
class PaymentBase(BaseModel):
    amount: float
    date: date
    method: str

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    installment_id: Optional[int] = None
    class Config:
        orm_mode = True

# --- Installment Schemas ---
class InstallmentBase(BaseModel):
    amount: float
    due_date: date
    status: str

class InstallmentCreate(InstallmentBase):
    pass

class Installment(InstallmentBase):
    id: int
    payment: Optional[Payment] = None
    class Config:
        orm_mode = True

# --- Contract Schemas ---
class ContractBase(BaseModel):
    unit_id: int
    customer_id: int
    total_price: float
    down_payment: float
    contract_date: date

class ContractCreate(ContractBase):
    installments_num: int
    start_date: date

class Contract(ContractBase):
    id: int
    installments: List[Installment] = []
    payments: List[Payment] = []
    unit: Unit
    customer: Customer
    class Config:
        orm_mode = True
