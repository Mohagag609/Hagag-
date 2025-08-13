import React, { useState, useContext, useMemo } from 'react';
import AppContext from '../AppContext';
import { uid, egp, parseNumber, today } from '../utils';

const initialFormState = {
  unitId: '', customerId: '', totalPrice: 0, downPayment: '',
  maintenanceDeposit: '', brokerPercent: '', type: 'شهري', count: '',
  extraAnnual: '', start: today()
};

function FinancialSummary({ formState }) {
  const total = parseNumber(formState.totalPrice);
  const down = parseNumber(formState.downPayment);
  const maint = parseNumber(formState.maintenanceDeposit);
  const brokerP = parseNumber(formState.brokerPercent);
  const brokerAmt = (total * brokerP / 100);
  const remaining = total - down - maint - brokerAmt;

  return (
    <div className="card" style={{ marginTop: '8px', background: 'var(--bg)', padding: '10px' }}>
      <h4 style={{ marginTop: '0', marginBottom: '8px' }}>ملخص حسابي</h4>
      <table style={{ fontSize: '12px', width: '100%' }}>
        <tbody>
          <tr><td style={{ color: 'var(--muted)' }}>(+) سعر الوحدة</td><td style={{ textAlign: 'left' }}>{egp(total)}</td></tr>
          <tr><td style={{ color: 'var(--muted)' }}>(-) المقدم</td><td style={{ textAlign: 'left' }}>{egp(down)}</td></tr>
          <tr><td style={{ color: 'var(--muted)' }}>(-) وديعة الصيانة</td><td style={{ textAlign: 'left' }}>{egp(maint)}</td></tr>
          <tr><td style={{ color: 'var(--muted)' }}>(-) عمولة السمسار</td><td style={{ textAlign: 'left' }}>{egp(brokerAmt)}</td></tr>
          <tr style={{ borderTop: '1px solid var(--line)', fontWeight: 'bold', fontSize: '13px' }}>
            <td>(=) المبلغ المتبقي للأقساط</td>
            <td style={{ textAlign: 'left' }}>{egp(remaining)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ContractsPage() {
  const { state, setState } = useContext(AppContext);
  const [formState, setFormState] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleUnitChange = (e) => {
    const unitId = e.target.value;
    const unit = state.units.find(u => u.id === unitId);
    setFormState(prev => ({
      ...prev,
      unitId,
      totalPrice: unit ? unit.totalPrice : 0
    }));
  };

  const handleCreateContract = (e) => {
    e.preventDefault();
    const { unitId, customerId, totalPrice, downPayment, maintenanceDeposit, brokerPercent, type, count, extraAnnual, start } = formState;

    if (!unitId || !customerId) return alert('اختر الوحدة والعميل');
    const total = parseNumber(totalPrice);
    const down = parseNumber(downPayment);
    const maint = parseNumber(maintenanceDeposit);
    const brokerP = parseNumber(brokerPercent);
    const numCount = parseInt(count || '0', 10);
    const numExtra = parseInt(extraAnnual || '0', 10);
    const brokerAmt = Math.round((total * brokerP / 100) * 100) / 100;
    const remain = Math.max(0, total - down - maint - brokerAmt);

    if (numCount <= 0 && remain > 0) return alert('عدد الدفعات غير صالح للمبلغ المتبقي.');

    const newContract = {
      id: uid('CT'), code: 'CTR-' + String(state.contracts.length + 1).padStart(5, '0'),
      unitId, customerId, totalPrice: total, downPayment: down, maintenanceDeposit: maint,
      brokerPercent: brokerP, brokerAmount: brokerAmt, type, count: numCount,
      extraAnnual: Math.min(Math.max(numExtra, 0), 3), start
    };

    const newInstallments = [];
    if (numCount > 0) {
      const months = {'شهري':1,'ربع سنوي':3,'نصف سنوي':6,'سنوي':12}[type]||1;
      const parts = numCount + numExtra;
      const base = Math.floor((remain/parts)*100)/100; let acc=0;
      for(let i=0; i<numCount; i++){
        const d = new Date(start); d.setMonth(d.getMonth()+months*(i+1));
        const amt = (i === numCount - 1 && numExtra === 0) ? Math.round((remain - acc) * 100) / 100 : base; acc += amt;
        newInstallments.push({id:uid('I'),unitId,type,amount:amt,originalAmount:amt,dueDate:d.toISOString().slice(0,10),paymentDate:null,status:'غير مدفوع'});
      }
      for(let j=0; j<numExtra; j++){
        const d = new Date(start); d.setMonth(d.getMonth()+12*(j+1));
        const amt = (j === numExtra - 1) ? Math.round((remain-acc)*100)/100 : base; acc+=amt;
        newInstallments.push({id:uid('I'),unitId,type:'سَنوي إضافي',amount:amt,originalAmount:amt,dueDate:d.toISOString().slice(0,10),paymentDate:null,status:'غير مدفوع'});
      }
    }

    setState(prev => ({
      ...prev,
      contracts: [...prev.contracts, newContract],
      installments: [...prev.installments, ...newInstallments],
      units: prev.units.map(u => u.id === unitId ? { ...u, status: 'مباعة' } : u)
    }));

    setFormState(initialFormState); // Reset form
    alert(`تم إنشاء العقد ${newContract.code} بنجاح.`);
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>إضافة عقد</h3>
        <form onSubmit={handleCreateContract}>
          <div className="grid grid-4">
            <select className="select" id="unitId" value={formState.unitId} onChange={handleUnitChange}>
              <option value="">اختر الوحدة...</option>
              {state.units.filter(u => u.status !== 'مباعة').map(u=> <option key={u.id} value={u.id}>{u.code} - {u.name||''}</option>)}
            </select>
            <select className="select" id="customerId" value={formState.customerId} onChange={handleInputChange}>
              <option value="">اختر العميل...</option>
              {state.customers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input className="input" id="totalPrice" value={formState.totalPrice} placeholder="سعر الوحدة (تلقائي)" readOnly />
            <input className="input" id="downPayment" value={formState.downPayment} onChange={handleInputChange} placeholder="المقدم" type="number" />
            <input className="input" id="maintenanceDeposit" value={formState.maintenanceDeposit} onChange={handleInputChange} placeholder="وديعة الصيانة" type="number" />
            <input className="input" id="brokerPercent" value={formState.brokerPercent} onChange={handleInputChange} placeholder="نسبة السمسار %" type="number" />
            <select className="select" id="type" value={formState.type} onChange={handleInputChange}>
              <option>شهري</option><option>ربع سنوي</option><option>نصف سنوي</option><option>سنوي</option>
            </select>
            <input className="input" id="count" value={formState.count} onChange={handleInputChange} placeholder="عدد الدفعات" type="number" />
            <input className="input" id="extraAnnual" value={formState.extraAnnual} onChange={handleInputChange} placeholder="دفعات سنوية إضافية (0-3)" type="number" />
            <input className="input" id="start" value={formState.start} onChange={handleInputChange} type="date" />
          </div>
          <FinancialSummary formState={formState} />
          <div className="tools">
            <button className="btn" type="submit">حفظ + توليد أقساط</button>
          </div>
        </form>
      </div>
      <div className="card">
        <h3>العقود</h3>
        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
        <table className="table">
          <thead><tr><th>كود العقد</th><th>الوحدة</th><th>العميل</th><th>السعر</th><th>تاريخ البدء</th><th></th></tr></thead>
          <tbody>
            {state.contracts.map(c => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{state.units.find(u=>u.id === c.unitId)?.code || '—'}</td>
                <td>{state.customers.find(cust=>cust.id === c.customerId)?.name || '—'}</td>
                <td>{egp(c.totalPrice)}</td>
                <td>{c.start}</td>
                <td>{/* Details button will go here */}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default ContractsPage;
