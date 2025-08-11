from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    equity_raise = Column(Float, nullable=False)
    preferred_return = Column(Float, default=0.08)  # 8% pref
    promote = Column(Float, default=0.20)  # 20% promote above pref
    hold_period_years = Column(Float, default=5.0)
    exit_cap_rate = Column(Float, nullable=True)

    property = relationship("Property")
    investments = relationship("Investment", back_populates="deal", cascade="all, delete-orphan")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    investor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    deal = relationship("Deal", back_populates="investments")