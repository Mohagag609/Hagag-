import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../AppContext';
import { egp, uid, parseNumber, today } from '../utils';

function PaymentsPage() {
  const { state, setState } = useContext(AppContext);
  const [formState, setFormState] = useState({ unitId: '', amount: '', method: 'نقدي', date: today() });
  const [searchQuery, setSearchQuery] = useState('');

  const getUnitCode = (unitId) => state.units.find(u => u.id === unitId)?.code || '—';

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    const { unitId, amount, method, date } = formState;
    const parsedAmount = parseNumber(amount);
    if (!unitId || !parsedAmount > 0) {
      alert('اختر وحدة واكتب مبلغ صحيح');
      return;
    }
    const newPayment = { id: uid('P'), unitId, amount: parsedAmount, method, date };
    setState(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    setFormState({ unitId: '', amount: '', method: 'نقدي', date: today() });
  };

  const filteredPayments = useMemo(() => {
    let list = state.payments;
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      list = list.filter(p => {
        const searchable = `${getUnitCode(p.unitId)} ${p.method||''} ${p.date||''}`.toLowerCase();
        return searchable.includes(lowerCaseQuery);
      });
    }
    return list.sort((a, b) => (b.date||'').localeCompare(a.date||''));
  }, [state.payments, searchQuery, state.units]);

  return (
    <div className="grid grid-2">
      <div className="card">
        <h3>إضافة دفعة يدوية</h3>
        <form onSubmit={handleAddPayment}>
          <select className="select" id="unitId" value={formState.unitId} onChange={handleInputChange} style={{marginBottom: '8px'}}>
            <option value="">اختر الوحدة...</option>
            {state.units.map(u => <option key={u.id} value={u.id}>{u.code} - {u.name||''}</option>)}
          </select>
          <input className="input" id="amount" value={formState.amount} onChange={handleInputChange} placeholder="المبلغ" type="number" style={{marginBottom: '8px'}} />
          <select className="select" id="method" value={formState.method} onChange={handleInputChange} style={{marginBottom: '8px'}}>
            <option>نقدي</option><option>تحويل</option><option>دفعة مقدمة</option><option>وديعة صيانة</option><option>أخرى</option>
          </select>
          <input className="input" id="date" value={formState.date} onChange={handleInputChange} type="date" style={{marginBottom: '8px'}} />
          <button className="btn" type="submit">حفظ الدفعة</button>
        </form>
      </div>
      <div className="card">
        <h3>سجل المدفوعات ({filteredPayments.length})</h3>
        <input
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالوحدة, الطريقة, أو التاريخ..."
          style={{marginBottom: '8px'}}
        />
        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
          <table className="table">
            <thead><tr><th>الوحدة</th><th>المبلغ</th><th>الطريقة</th><th>التاريخ</th><th>المصدر</th></tr></thead>
            <tbody>
              {filteredPayments.map(p => (
                <tr key={p.id}>
                  <td>{getUnitCode(p.unitId)}</td>
                  <td>{egp(p.amount)}</td>
                  <td>{p.method||'—'}</td>
                  <td>{p.date||'—'}</td>
                  <td>{p.installmentId ? <span className="badge info">قسط</span> : <span className="badge secondary">يدوي</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentsPage;
