import React, { useContext, useState } from 'react';
import AppContext from '../AppContext';
import { uid } from '../utils';

function PartnersPage() {
  const { state, setState } = useContext(AppContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('الرجاء إدخال اسم الشريك.');
      return;
    }
    const newPartner = {
      id: uid('PR'),
      name: name.trim(),
      phone: phone.trim(),
    };
    setState(prevState => ({
      ...prevState,
      partners: [...prevState.partners, newPartner]
    }));
    setName('');
    setPhone('');
  };

  const handleDeletePartner = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الشريك؟')) {
      setState(prevState => ({
        ...prevState,
        partners: prevState.partners.filter(p => p.id !== id)
      }));
    }
  };

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>إضافة شريك</h3>
        <form onSubmit={handleAddPartner}>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم الشريك"
            style={{marginBottom: '8px'}}
          />
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="الهاتف"
            style={{marginBottom: '8px'}}
          />
          <button className="btn" type="submit">حفظ</button>
        </form>
      </div>
      <div className="card">
        <h3>الشركاء</h3>
        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.partners.length > 0 ? (
                state.partners.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.phone}</td>
                    <td>
                      <button className="btn secondary" onClick={() => handleDeletePartner(p.id)}>
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">لا يوجد شركاء</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PartnersPage;
