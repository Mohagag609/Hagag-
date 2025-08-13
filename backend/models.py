import sqlalchemy
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from .database import Base

class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    unit_type = Column(String)
    area = Column(Float)
    price = Column(Float)
    notes = Column(String)

    partners = relationship("UnitPartner", back_populates="unit", cascade="all, delete-orphan")
    contract = relationship("Contract", back_populates="unit", uselist=False)

class Partner(Base):
    __tablename__ = "partners"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    notes = Column(String)

    units = relationship("UnitPartner", back_populates="partner")

class UnitPartner(Base):
    __tablename__ = "unit_partners"
    unit_id = Column(Integer, ForeignKey("units.id"), primary_key=True)
    partner_id = Column(Integer, ForeignKey("partners.id"), primary_key=True)
    ownership = Column(Float, nullable=False)

    unit = relationship("Unit", back_populates="partners")
    partner = relationship("Partner", back_populates="units")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    national_id = Column(String)
    notes = Column(String)

    contracts = relationship("Contract", back_populates="customer")

class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), unique=True) # A unit can only have one contract
    customer_id = Column(Integer, ForeignKey("customers.id"))
    total_price = Column(Float)
    down_payment = Column(Float)
    contract_date = Column(Date)

    customer = relationship("Customer", back_populates="contracts")
    unit = relationship("Unit", back_populates="contract")
    installments = relationship("Installment", back_populates="contract", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="contract", cascade="all, delete-orphan")

class Installment(Base):
    __tablename__ = "installments"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    amount = Column(Float)
    due_date = Column(Date)
    status = Column(String, default="غير مدفوع") # e.g., 'غير مدفوع', 'مدفوع'

    contract = relationship("Contract", back_populates="installments")
    payment = relationship("Payment", back_populates="installment", uselist=False)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    installment_id = Column(Integer, ForeignKey("installments.id"), nullable=True) # Can be null for down payment
    amount = Column(Float)
    date = Column(Date)
    method = Column(String) # e.g., 'مقدم', 'قسط'

    contract = relationship("Contract", back_populates="payments")
    installment = relationship("Installment", back_populates="payment")
