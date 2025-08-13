import React, { useState, useContext } from 'react';
import AppContext from '../AppContext';
import { uid, parseNumber, egp } from '../utils';

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
  width: '600px',
  border: '1px solid var(--line)',
};

function ManagePartnersModal({ unit, onClose }) {
  const { state, setState } = useContext(AppContext);
  const [partnerId, setPartnerId] = useState('');
  const [percent, setPercent] = useState('');

  if (!unit) return null;

  const currentPartners = state.unitPartners.filter(up => up.unitId === unit.id);

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!partnerId || !percent || percent <= 0 || percent > 100) {
      alert('الرجاء اختيار شريك وإدخال نسبة صحيحة.');
      return;
    }
    if (currentPartners.some(p => p.partnerId === partnerId)) {
      alert('هذا الشريك مضاف بالفعل لهذه الوحدة.');
      return;
    }
    const newLink = { id: uid('UP'), unitId: unit.id, partnerId, percent: parseNumber(percent) };
    setState(prev => ({ ...prev, unitPartners: [...prev.unitPartners, newLink] }));
    setPartnerId('');
    setPercent('');
  };

  const handleRemovePartner = (linkId) => {
    setState(prev => ({...prev, unitPartners: prev.unitPartners.filter(up => up.id !== linkId)}));
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <h3>إدارة شركاء الوحدة: {unit.code}</h3>
          <button className="btn secondary" onClick={onClose}>إغلاق</button>
        </div>
        <div className="grid grid-2" style={{ marginTop: '12px', alignItems: 'flex-start' }}>
            <div className="card">
                <h4>إضافة شريك</h4>
                <form onSubmit={handleAddPartner}>
                    <select className="select" value={partnerId} onChange={e => setPartnerId(e.target.value)} style={{marginBottom: '8px'}}>
                        <option value="">اختر شريك...</option>
                        {state.partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input className="input" value={percent} onChange={e=>setPercent(e.target.value)} type="number" placeholder="النسبة %" style={{marginBottom: '8px'}} />
                    <button className="btn" type="submit">إضافة</button>
                </form>
            </div>
            <div className="card">
                <h4>الشركاء الحاليون</h4>
                <table className="table">
                    <thead><tr><th>الشريك</th><th>النسبة</th><th></th></tr></thead>
                    <tbody>
                        {currentPartners.length > 0 ? currentPartners.map(link => {
                            const partner = state.partners.find(p => p.id === link.partnerId);
                            return (
                                <tr key={link.id}>
                                    <td>{partner?.name || 'غير معروف'}</td>
                                    <td>{link.percent}%</td>
                                    <td><button className="btn warn" onClick={() => handleRemovePartner(link.id)}>إزالة</button></td>
                                </tr>
                            );
                        }) : <tr><td colSpan="3">لا يوجد شركاء</td></tr>}
                    </tbody>
                </table>
                <div style={{marginTop: '8px', fontWeight: 'bold'}}>
                    المجموع: <span className="badge ok">{currentPartners.reduce((sum, p) => sum + p.percent, 0)}%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ManagePartnersModal;
