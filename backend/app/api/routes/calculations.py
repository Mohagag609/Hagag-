from typing import List, Dict, Any

from fastapi import APIRouter

from app.services.calculations import (
    calculate_irr,
    calculate_npv,
    calculate_cap_rate,
    calculate_cash_on_cash,
    calculate_dscr,
    amortization_schedule,
)

router = APIRouter(prefix="/calc", tags=["calculations"]) 


@router.post("/irr")
def irr(cash_flows: List[float]) -> Dict[str, Any]:
    return {"irr": calculate_irr(cash_flows)}


@router.post("/npv")
def npv(discount_rate: float, cash_flows: List[float]) -> Dict[str, Any]:
    return {"npv": calculate_npv(discount_rate, cash_flows)}


@router.get("/cap-rate")
def cap_rate(annual_noi: float, purchase_price: float) -> Dict[str, Any]:
    return {"cap_rate": calculate_cap_rate(annual_noi, purchase_price)}


@router.get("/cash-on-cash")
def cash_on_cash(annual_cash_flow: float, total_equity: float) -> Dict[str, Any]:
    return {"cash_on_cash": calculate_cash_on_cash(annual_cash_flow, total_equity)}


@router.get("/dscr")
def dscr(annual_noi: float, annual_debt_service: float) -> Dict[str, Any]:
    return {"dscr": calculate_dscr(annual_noi, annual_debt_service)}


@router.get("/amortization")
def amort(principal: float, annual_rate: float, years: int, payments_per_year: int = 12) -> Dict[str, Any]:
    return {"schedule": amortization_schedule(principal, annual_rate, years, payments_per_year)}