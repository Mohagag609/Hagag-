from app.services.calculations import (
    calculate_irr,
    calculate_npv,
    calculate_cap_rate,
    calculate_cash_on_cash,
    calculate_dscr,
    amortization_schedule,
)


def test_irr_basic():
    irr = calculate_irr([-1000, 200, 300, 400, 500])
    assert -1.0 < irr < 1.0


def test_npv_basic():
    npv = calculate_npv(0.1, [-1000, 400, 400, 400, 400])
    assert npv > 0


def test_cap_rate():
    assert calculate_cap_rate(120000, 1500000) == 0.08


def test_cash_on_cash():
    assert calculate_cash_on_cash(10000, 100000) == 0.1


def test_dscr():
    assert calculate_dscr(120000, 100000) == 1.2


def test_amortization():
    schedule = amortization_schedule(100000, 0.06, 30)
    assert len(schedule) == 360
    assert schedule[-1]["balance"] == 0.0