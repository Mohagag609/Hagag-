import React, { useContext } from 'react';
import AppContext from '../AppContext';
import { egp, calculateUnitRemaining } from '../utils';

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
  width: '800px',
  maxWidth: '90%',
  border: '1px solid var(--line)',
  maxHeight: '90vh',
  overflowY: 'auto'
};

function ContractDetailsModal({ contract, onClose, onCancelContract }) {
  const { state } = useContext(AppContext);

  if (!contract) return null;

  const unit = state.units.find(u => u.id === contract.unitId);
  const customer = state.customers.find(c => c.id === contract.customerId);
  const installments = state.installments.filter(i => i.unitId === contract.unitId);
  const payments = state.payments.filter(p => p.unitId === contract.unitId);

  const handlePrint = () => {
    const printable = document.getElementById('printable-contract').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html lang="ar" dir="rtl"><head><title>تفاصيل العقد ${contract.code}</title>
      <style>
        body { font-family: system-ui, sans-serif; direction: rtl; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
        h1, h2, h3 { margin-top: 20px; }
      </style></head><body>${printable}</body></html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div className="header">
            <h3>تفاصيل العقد — ${contract.code} {contract.status === 'cancelled' && <span className="badge warn">ملغى</span>}</h3>
            <div>
              <button className="btn" onClick={handlePrint} style={{marginLeft: '8px'}}>طباعة</button>
              <button className="btn warn" onClick={() => onCancelContract(contract.id)} disabled={contract.status === 'cancelled'} style={{marginLeft: '8px'}}>إلغاء العقد</button>
              <button className="btn secondary" onClick={onClose}>إغلاق</button>
            </div>
        </div>
        <div id="printable-contract">
          <div className="grid grid-2" style={{ marginTop: '12px', alignItems: 'flex-start' }}>
              <div className="card">
                  <h4>بيانات العقد</h4>
                  <table><tbody>
                      <tr><th>العميل</th><td>${customer?.name || '—'} (${customer?.phone || '—'})</td></tr>
                      <tr><th>الوحدة</th><td>${unit?.code || '—'} (${unit?.name || '—'})</td></tr>
                      <tr><th>السعر الكلي</th><td style={{fontWeight:'bold'}}>${egp(contract.totalPrice)}</td></tr>
                      <tr><th>المقدم</th><td>${egp(contract.downPayment)}</td></tr>
                      <tr><th>عمولة السمسار</th><td>${egp(contract.brokerAmount || 0)} (${contract.brokerPercent || 0}%)</td></tr>
                      <tr><th>نظام الأقساط</th><td>${contract.type} × ${contract.count} + ${contract.extraAnnual} سنوية</td></tr>
                      <tr><th>تاريخ البدء</th><td>${contract.start}</td></tr>
                  </tbody></table>
              </div>
              <div className="card">
                  <h4>ملخص مالي للوحدة</h4>
                   <table>
                      <tbody>
                        <tr><th>إجمالي المتبقي من سعر الوحدة</th><td style={{fontWeight:'bold'}}>{egp(calculateUnitRemaining(unit, state.contracts, state.payments))}</td></tr>
                        <tr><th>إجمالي الأقساط المتبقية</th><td>${egp(installments.reduce((s,i)=>s+(i.amount||0),0))}</td></tr>
                        <tr><th>إجمالي المدفوعات المسجلة</th><td>${egp(payments.reduce((s,p)=>s+(p.amount||0),0))}</td></tr>
                      </tbody>
                    </table>
              </div>
          </div>
          <h4>جدول الأقساط</h4>
          <div style={{maxHeight: '200px', overflowY: 'auto'}}>
          <table className="table">
              <thead><tr><th>النوع</th><th>المبلغ الأصلي</th><th>المتبقي</th><th>تاريخ الاستحقاق</th><th>الحالة</th></tr></thead>
              <tbody>
                  {installments.map(i => <tr key={i.id}><td>{i.type}</td><td>{egp(i.originalAmount)}</td><td>{egp(i.amount)}</td><td>{i.dueDate}</td><td>{i.status}</td></tr>)}
              </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractDetailsModal;
