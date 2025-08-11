from typing import List, Dict
import numpy as np
import numpy_financial as npf


def calculate_irr(cash_flows: List[float]) -> float:
    if not cash_flows or all(cf == 0 for cf in cash_flows):
        return 0.0
    try:
        irr = npf.irr(cash_flows)
        return float(irr) if irr is not None and not np.isnan(irr) else 0.0
    except Exception:
        return 0.0


def calculate_npv(discount_rate: float, cash_flows: List[float]) -> float:
    npv = 0.0
    for t, cf in enumerate(cash_flows):
        npv += cf / ((1 + discount_rate) ** t)
    return float(npv)


def calculate_cap_rate(annual_noi: float, purchase_price: float) -> float:
    if purchase_price == 0:
        return 0.0
    return float(annual_noi / purchase_price)


def calculate_cash_on_cash(annual_cash_flow: float, total_equity: float) -> float:
    if total_equity == 0:
        return 0.0
    return float(annual_cash_flow / total_equity)


def calculate_dscr(annual_noi: float, annual_debt_service: float) -> float:
    if annual_debt_service == 0:
        return 0.0
    return float(annual_noi / annual_debt_service)


def amortization_schedule(principal: float, annual_rate: float, years: int, payments_per_year: int = 12) -> List[Dict[str, float]]:
    r = annual_rate / payments_per_year
    n = years * payments_per_year
    if r == 0:
        payment = principal / n
    else:
        payment = principal * (r * (1 + r) ** n) / ((1 + r) ** n - 1)
    balance = principal
    schedule: List[Dict[str, float]] = []
    for k in range(1, n + 1):
        interest = balance * r
        principal_paid = payment - interest
        balance = max(0.0, balance - principal_paid)
        schedule.append({
            "period": float(k),
            "payment": float(payment),
            "principal": float(principal_paid),
            "interest": float(interest),
            "balance": float(balance),
        })
    return schedule