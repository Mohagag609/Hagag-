from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False)
    property_type = Column(String, nullable=False)  # e.g., multifamily, office, retail
    purchase_price = Column(Float, nullable=True)
    square_feet = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    units = relationship("Unit", back_populates="property", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="property", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    name = Column(String, nullable=False)
    bedrooms = Column(Integer, default=0)
    bathrooms = Column(Float, default=0.0)
    monthly_rent = Column(Float, default=0.0)

    property = relationship("Property", back_populates="units")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    name = Column(String, nullable=False)
    monthly_amount = Column(Float, default=0.0)

    property = relationship("Property", back_populates="expenses")