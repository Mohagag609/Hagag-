from pydantic import BaseModel
from typing import List, Optional


class UnitBase(BaseModel):
    name: str
    bedrooms: int = 0
    bathrooms: float = 0.0
    monthly_rent: float = 0.0


class UnitCreate(UnitBase):
    pass


class UnitRead(UnitBase):
    id: int

    class Config:
        from_attributes = True


class ExpenseBase(BaseModel):
    name: str
    monthly_amount: float


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    id: int

    class Config:
        from_attributes = True


class PropertyBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    country: str
    property_type: str
    purchase_price: Optional[float] = None
    square_feet: Optional[float] = None


class PropertyCreate(PropertyBase):
    units: List[UnitCreate] = []
    expenses: List[ExpenseCreate] = []


class PropertyRead(PropertyBase):
    id: int
    units: List[UnitRead] = []
    expenses: List[ExpenseRead] = []

    class Config:
        from_attributes = True