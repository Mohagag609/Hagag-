import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../AppContext';
import { uid, egp, parseNumber, calculateUnitRemaining } from '../utils';

import ManagePartnersModal from '../components/ManagePartnersModal';

function UnitsPage() {
  const { state, setState } = useContext(AppContext);

  const [formState, setFormState] = useState({
    code: '', name: '', totalPrice: '', type: 'سكني',
    status: 'متاحة', floor: '', building: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [managingUnit, setManagingUnit] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleAddUnit = (e) => {
    e.preventDefault();
    let { code, name, totalPrice, type, status, floor, building } = formState;

    if (!code.trim()) {
        if (!building.trim() || !floor.trim() || !name.trim()) {
            return alert('لإنشاء كود تلقائي، الرجاء إدخال اسم الوحدة ورقم الدور والعمارة.');
        }
        const san_b = building.trim().replace(/\s/g, '');
        const san_f = floor.trim().replace(/\s/g, '');
        const san_n = name.trim().replace(/\s/g, '');
        code = `${san_b}-${san_f}-${san_n}`;
    }

    if (!totalPrice) {
      alert('الرجاء إدخال السعر الكلي للوحدة');
      return;
    }

    if (state.units.some(u => u.code.toLowerCase() === code.toLowerCase())) {
        return alert('هذا الكود مستخدم بالفعل. الرجاء إدخال كود فريد.');
    }

    const newUnit = {
      id: uid('U'),
      code: code.trim(),
      name: name.trim(),
      totalPrice: parseNumber(totalPrice),
      type,
      status,
      floor: floor.trim(),
      building: building.trim()
    };
    setState(prev => ({ ...prev, units: [...prev.units, newUnit] }));
    // Reset form
    setFormState({ code: '', name: '', totalPrice: '', type: 'سكني', status: 'متاحة', floor: '', building: '' });
  };

  const handleDeleteUnit = (id) => {
    if(window.confirm('هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف كل العقود والأقساط والمدفوعات المرتبطة بها.')) {
      setState(prev => {
        const newUnits = prev.units.filter(u => u.id !== id);
        const newContracts = prev.contracts.filter(c => c.unitId !== id);
        const newInstallments = prev.installments.filter(i => i.unitId !== id);
        const newPayments = prev.payments.filter(p => p.unitId !== id);
        const newUnitPartners = prev.unitPartners.filter(up => up.unitId !== id);
        return {...prev, units: newUnits, contracts: newContracts, installments: newInstallments, payments: newPayments, unitPartners: newUnitPartners};
      });
    }
  };

  const filteredUnits = useMemo(() => {
    if (!searchQuery) return state.units;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return state.units.filter(u => {
      const searchable = `${u.code||''} ${u.name||''} ${u.type||'سكني'} ${u.floor||''} ${u.building||''} ${u.status||''}`.toLowerCase();
      return searchable.includes(lowerCaseQuery);
    });
  }, [state.units, searchQuery]);

  return (
    <div className="grid">
      <div className="card">
        <h3>إضافة وحدة</h3>
        <form onSubmit={handleAddUnit}>
          <div className="grid grid-4">
            <input className="input" id="code" value={formState.code} onChange={handleInputChange} placeholder="كود/اسم مختصر" />
            <input className="input" id="name" value={formState.name} onChange={handleInputChange} placeholder="اسم الوحدة" />
            <input className="input" id="totalPrice" value={formState.totalPrice} onChange={handleInputChange} placeholder="السعر الكلي" type="number" />
            <select className="select" id="type" value={formState.type} onChange={handleInputChange}>
              <option value="سكني">سكني</option>
              <option value="تجاري">تجاري</option>
            </select>
            <select className="select" id="status" value={formState.status} onChange={handleInputChange}>
              <option>متاحة</option><option>مباعة</option><option>مرتجعة</option>
            </select>
            <input className="input" id="floor" value={formState.floor} onChange={handleInputChange} placeholder="رقم الدور" />
            <input className="input" id="building" value={formState.building} onChange={handleInputChange} placeholder="رقم العمارة" />
          </div>
          <button className="btn" type="submit" style={{marginTop: '8px'}}>حفظ الوحدة</button>
        </form>
      </div>
      <div className="card">
        <h3>قائمة الوحدات ({filteredUnits.length})</h3>
        <input
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالكود, الاسم, النوع..."
          style={{marginBottom: '8px'}}
        />
        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>الكود</th><th>الاسم</th><th>النوع</th><th>السعر</th><th>المتبقي</th><th>الحالة</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map(u => (
                <tr key={u.id}>
                  <td>{u.code}</td>
                  <td>{u.name}</td>
                  <td>{u.type || 'سكني'}</td>
                  <td>{egp(u.totalPrice)}</td>
                  <td>{egp(calculateUnitRemaining(u, state.contracts, state.payments))}</td>
                  <td>{u.status}</td>
                  <td>
                    <button className="btn" onClick={() => setManagingUnit(u)} style={{marginLeft: '4px'}}>
                      الشركاء
                    </button>
                    <button className="btn secondary" onClick={() => handleDeleteUnit(u.id)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {managingUnit && (
        <ManagePartnersModal
          unit={managingUnit}
          onClose={() => setManagingUnit(null)}
        />
      )}
    </div>
  );
}

export default UnitsPage;
