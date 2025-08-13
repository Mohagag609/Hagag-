import React, { useState, useEffect } from 'react';

// Basic modal styling
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
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

function CustomerEditModal({ customer, onSave, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
    }
  }, [customer]);

  if (!customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...customer, name: name.trim(), phone: phone.trim() });
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3>تعديل بيانات العميل</h3>
        <form onSubmit={handleSubmit}>
          <label>الاسم</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{marginBottom: '8px'}}
          />
          <label>الهاتف</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{marginBottom: '12px'}}
          />
          <div className="tools">
            <button className="btn" type="submit">حفظ التعديلات</button>
            <button className="btn secondary" type="button" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerEditModal;
