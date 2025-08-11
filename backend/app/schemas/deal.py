from pydantic import BaseModel
from typing import Optional


class DealBase(BaseModel):
    property_id: int
    equity_raise: float
    preferred_return: float = 0.08
    promote: float = 0.20
    hold_period_years: float = 5.0
    exit_cap_rate: Optional[float] = None


class DealCreate(DealBase):
    pass


class DealRead(DealBase):
    id: int

    class Config:
        from_attributes = True


class InvestmentBase(BaseModel):
    deal_id: int
    investor_id: int
    amount: float


class InvestmentCreate(InvestmentBase):
    pass


class InvestmentRead(InvestmentBase):
    id: int

    class Config:
        from_attributes = True