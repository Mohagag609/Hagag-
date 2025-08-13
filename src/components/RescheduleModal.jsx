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

function RescheduleModal({ installment, onSave, onClose }) {
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    if (installment) {
      setNewAmount(installment.amount);
      setNewDate(installment.dueDate);
    }
  }, [installment]);

  if (!installment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseNumber(newAmount);
    if (parsedAmount < 0 || !newDate) {
      alert('الرجاء إدخال مبلغ وتاريخ صحيحين.');
      return;
    }
    onSave(installment, parsedAmount, newDate);
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3>إعادة جدولة قسط</h3>
        <p>الوحدة: <strong>{installment.unitCode}</strong></p>
        <p>القسط الحالي: <strong>{egp(installment.amount)}</strong> في <strong>{installment.dueDate}</strong></p>
        <form onSubmit={handleSubmit}>
          <label>المبلغ الجديد</label>
          <input
            className="input"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            type="number"
            style={{marginBottom: '8px'}}
          />
          <label>تاريخ الاستحقاق الجديد</label>
          <input
            className="input"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            type="date"
            style={{marginBottom: '12px'}}
          />
          <div className="tools">
            <button className="btn" type="submit">حفظ وإعادة توزيع الفرق</button>
            <button className="btn secondary" type="button" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RescheduleModal;
