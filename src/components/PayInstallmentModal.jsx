import React, { useState, useEffect } from 'react';
import { egp, parseNumber } from '../utils';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'var(--panel)',
  padding: '20px',
  borderRadius: '14px',
  width: '400px',
  border: '1px solid var(--line)',
};

function PayInstallmentModal({ installment, onSave, onClose }) {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (installment) {
      setAmount(installment.amount);
    }
  }, [installment]);

  if (!installment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const paidAmount = parseNumber(amount);
    if (paidAmount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح.');
      return;
    }
    if (paidAmount > installment.amount) {
      alert('المبلغ المدفوع أكبر من المبلغ المتبقي على القسط.');
      return;
    }
    onSave(installment, paidAmount);
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3>دفع قسط</h3>
        <p>الوحدة: <strong>{installment.unitCode}</strong></p>
        <p>المبلغ المتبقي: <strong>{egp(installment.amount)}</strong></p>
        <form onSubmit={handleSubmit}>
          <label>المبلغ المدفوع</label>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            style={{marginBottom: '12px'}}
            autoFocus
          />
          <div className="tools">
            <button className="btn ok" type="submit">تأكيد الدفع</button>
            <button className="btn secondary" type="button" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PayInstallmentModal;
