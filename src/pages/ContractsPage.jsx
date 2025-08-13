import React, { useState, useContext, useMemo } from 'react';
import AppContext from '../AppContext';
import { uid, egp, parseNumber, today } from '../utils';
import ContractDetailsModal from '../components/ContractDetailsModal';

const initialFormState = {
  unitId: '', customerId: '', totalPrice: 0, downPayment: '',
  brokerPercent: '', type: 'شهري', count: '',
  extraAnnual: '', start: today()
};

function FinancialSummary({ formState }) {
  const total = parseNumber(formState.totalPrice);
  const down = parseNumber(formState.downPayment);
  const brokerP = parseNumber(formState.brokerPercent);
  const brokerAmt = (total * brokerP / 100);
  const remaining = total - down - brokerAmt;

  return (
    <div className="card" style={{ marginTop: '8px', background: 'var(--bg)', padding: '10px' }}>
      <h4 style={{ marginTop: '0', marginBottom: '8px' }}>ملخص حسابي</h4>
      <table style={{ fontSize: '12px', width: '100%' }}>
        <tbody>
          <tr><td style={{ color: 'var(--muted)' }}>(+) سعر الوحدة</td><td style={{ textAlign: 'left' }}>{egp(total)}</td></tr>
          <tr><td style={{ color: 'var(--muted)' }}>(-) المقدم</td><td style={{ textAlign: 'left' }}>{egp(down)}</td></tr>
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingContract, setViewingContract] = useState(null);

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
    const { unitId, customerId, totalPrice, downPayment, brokerPercent, type, count, extraAnnual, start } = formState;

    if (!unitId || !customerId) return alert('اختر الوحدة والعميل');
    const total = parseNumber(totalPrice);
    const down = parseNumber(downPayment);
    const brokerP = parseNumber(brokerPercent);
    const numCount = parseInt(count || '0', 10);
    const numExtra = parseInt(extraAnnual || '0', 10);
    const brokerAmt = Math.round((total * brokerP / 100) * 100) / 100;
    const remain = Math.max(0, total - down - brokerAmt);

    if (numCount <= 0 && remain > 0) return alert('عدد الدفعات غير صالح للمبلغ المتبقي.');

    const newContract = {
      id: uid('CT'), code: 'CTR-' + String(state.contracts.length + 1).padStart(5, '0'),
      unitId, customerId, totalPrice: total, downPayment: down,
      brokerPercent: brokerP, brokerAmount: brokerAmt, type, count: numCount,
      extraAnnual: Math.min(Math.max(numExtra, 0), 3), start, status: 'active'
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

  const getUnitCode = (unitId) => state.units.find(u => u.id === unitId)?.code || '—';
  const getCustomerName = (customerId) => state.customers.find(c => c.id === customerId)?.name || '—';

  const handleCancelContract = (contractId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا العقد؟ سيتم إعادة حالة الوحدة إلى "متاحة" ولن يتم حذف العقد كسجل تاريخي.')) return;

    setState(prev => {
      const contract = prev.contracts.find(c => c.id === contractId);
      if (!contract) return prev;

      const updatedContracts = prev.contracts.map(c =>
        c.id === contractId ? { ...c, status: 'cancelled' } : c
      );
      const updatedUnits = prev.units.map(u =>
        u.id === contract.unitId ? { ...u, status: 'متاحة' } : u
      );

      return { ...prev, contracts: updatedContracts, units: updatedUnits };
    });
    setViewingContract(prev => ({...prev, status: 'cancelled'})); // Update modal view
  };

  const filteredContracts = useMemo(() => {
    if (!searchQuery) return state.contracts;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return state.contracts.filter(c => {
      const searchable = `${c.code||''} ${getUnitCode(c.unitId)} ${getCustomerName(c.customerId)}`.toLowerCase();
      return searchable.includes(lowerCaseQuery);
    });
  }, [state.contracts, state.units, state.customers, searchQuery]);

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
        <h3>العقود ({filteredContracts.length})</h3>
        <input
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بكود العقد, الوحدة, أو العميل..."
          style={{marginBottom: '8px'}}
        />
        <div style={{maxHeight: '500px', overflowY: 'auto'}}>
        <table className="table">
          <thead><tr><th>كود العقد</th><th>الوحدة</th><th>العميل</th><th>السعر</th><th>تاريخ البدء</th><th></th></tr></thead>
          <tbody>
            {filteredContracts.map(c => (
              <tr key={c.id} style={{ opacity: c.status === 'cancelled' ? 0.5 : 1 }}>
                <td>{c.code}{c.status === 'cancelled' && <span className="badge warn" style={{marginRight: '8px'}}>ملغى</span>}</td>
                <td>{getUnitCode(c.unitId)}</td>
                <td>{getCustomerName(c.customerId)}</td>
                <td>{egp(c.totalPrice)}</td>
                <td>{c.start}</td>
                <td>
                  <button className="btn" onClick={() => setViewingContract(c)}>
                    تفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      {viewingContract && (
        <ContractDetailsModal
          contract={viewingContract}
          onClose={() => setViewingContract(null)}
          onCancelContract={handleCancelContract}
        />
      )}
    </div>
  );
}

export default ContractsPage;
