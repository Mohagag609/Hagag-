import React, { useContext, useState, useMemo } from 'react';
import AppContext from '../AppContext';
import { egp, today, uid, parseNumber } from '../utils';
import PayInstallmentModal from '../components/PayInstallmentModal';
import RescheduleModal from '../components/RescheduleModal';

function InstallmentsPage() {
  const { state, setState } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [payingInstallment, setPayingInstallment] = useState(null);
  const [reschedulingInstallment, setReschedulingInstallment] = useState(null);

  const getUnitCode = (unitId) => state.units.find(u => u.id === unitId)?.code || '—';

  const filteredInstallments = useMemo(() => {
    let list = state.installments;
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      list = list.filter(i => {
        const searchable = `${getUnitCode(i.unitId)} ${i.status||''} ${i.dueDate||''}`.toLowerCase();
        return searchable.includes(lowerCaseQuery);
      });
    }
    return list.sort((a,b) => (a.dueDate||'').localeCompare(b.dueDate||''));
  }, [state.installments, searchQuery, state.units]);

  const getRowClass = (i) => {
    if (i.status === 'مدفوع') return 'paid';
    if (i.dueDate) {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const dueDate = new Date(i.dueDate);
      if (dueDate < todayDate) return 'overdue';
      const sevenDaysFromNow = new Date(todayDate);
      sevenDaysFromNow.setDate(todayDate.getDate() + 7);
      if (dueDate <= sevenDaysFromNow) return 'due-soon';
    }
    return '';
  };

  return (
    <div className="card">
      <h3>الأقساط ({filteredInstallments.length})</h3>
       <input
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالوحدة, الحالة, أو تاريخ الاستحقاق..."
          style={{marginBottom: '8px'}}
        />
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>الوحدة</th><th>النوع</th><th>المبلغ</th><th>المتبقي</th><th>المسدد</th>
              <th>الاستحقاق</th><th>تاريخ السداد</th><th>الحالة</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map(i => {
              const paidSoFar = state.payments
                .filter(p => p.installmentId === i.id)
                .reduce((sum, p) => sum + p.amount, 0);
              return (
                <tr key={i.id} className={getRowClass(i)}>
                  <td>{getUnitCode(i.unitId)}</td>
                  <td>{i.type || ''}</td>
                  <td>{egp(i.originalAmount != null ? i.originalAmount : i.amount)}</td>
                  <td>{egp(i.amount)}</td>
                  <td>{egp(paidSoFar)}</td>
                  <td>{i.dueDate || ''}</td>
                  <td>{i.paymentDate || '—'}</td>
                  <td>{i.status || 'غير مدفوع'}</td>
                  <td>
                    <button
                      className="btn ok"
                      onClick={() => setPayingInstallment({...i, unitCode: getUnitCode(i.unitId)})}
                      disabled={i.status === 'مدفوع'}
                        style={{marginLeft: '4px'}}
                    >
                      دفع
                    </button>
                      <button
                        className="btn"
                        onClick={() => setReschedulingInstallment({...i, unitCode: getUnitCode(i.unitId)})}
                        disabled={i.status === 'مدفوع'}
                        style={{marginLeft: '4px'}}
                      >
                        إعادة جدولة
                      </button>
                      <button className="btn warn" onClick={() => handleDeleteInstallment(i.id)}>حذف</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {payingInstallment && (
        <PayInstallmentModal
          installment={payingInstallment}
          onSave={handleSavePayment}
          onClose={() => setPayingInstallment(null)}
        />
      )}
      {reschedulingInstallment && (
        <RescheduleModal
          installment={reschedulingInstallment}
          onSave={handleSaveReschedule}
          onClose={() => setReschedulingInstallment(null)}
        />
      )}
    </div>
  );
}

  const handleSavePayment = (installment, paidAmount) => {
    saveState();
    const newPayment = {
      id: uid('P'),
      unitId: installment.unitId,
      amount: paidAmount,
      method: paidAmount < installment.amount ? 'جزئي' : 'قسط',
      date: today(),
      installmentId: installment.id
    };

    setState(prev => {
      const updatedInstallments = prev.installments.map(i => {
        if (i.id === installment.id) {
          const newAmount = Math.round((i.amount - paidAmount) * 100) / 100;
          return {
            ...i,
            originalAmount: i.originalAmount != null ? i.originalAmount : i.amount,
            amount: newAmount,
            status: newAmount <= 0 ? 'مدفوع' : i.status,
            paymentDate: newAmount <= 0 ? today() : i.paymentDate
          };
        }
        return i;
      });

      return {
        ...prev,
        payments: [...prev.payments, newPayment],
        installments: updatedInstallments
      };
    });

    setPayingInstallment(null);
  };

  const handleSaveReschedule = (installment, newAmount, newDate) => {
    saveState();
    setState(prev => {
      const remainList = prev.installments
        .filter(x => x.unitId === installment.unitId && x.status !== 'مدفوع')
        .sort((a,b) => (a.dueDate||'').localeCompare(b.dueDate||''));

      const idx = remainList.findIndex(x => x.id === installment.id);
      const diff = Math.round((installment.amount - newAmount) * 100) / 100;
      const others = remainList.slice(idx + 1);
      const share = others.length ? Math.round((diff / others.length) * 100) / 100 : 0;

      const updatedInstallments = prev.installments.map(i => {
        if (i.id === installment.id) {
          return { ...i, amount: newAmount, dueDate: newDate, originalAmount: i.originalAmount != null ? i.originalAmount : i.amount };
        }
        if (others.some(o => o.id === i.id)) {
          return { ...i, amount: Math.round((i.amount + share) * 100) / 100, originalAmount: i.originalAmount != null ? i.originalAmount : i.amount };
        }
        return i;
      });

      return { ...prev, installments: updatedInstallments };
    });
    alert('تمت إعادة الجدولة وتوزيع الفرق على الأقساط التالية.');
    setReschedulingInstallment(null);
  };

  const handleDeleteInstallment = (id) => {
    const hasPayments = state.payments.some(p => p.installmentId === id);
    if (hasPayments) {
      return alert('لا يمكن حذف هذا القسط لوجود دفعات مسجلة عليه.');
    }
    if (window.confirm('هل أنت متأكد من حذف هذا القسط؟ قد يؤثر هذا على الحسابات الإجمالية للعقد.')) {
      saveState();
      setState(prev => ({
        ...prev,
        installments: prev.installments.filter(i => i.id !== id)
      }));
    }
  };

  return (
    <div className="card">
      <h3>الأقساط ({filteredInstallments.length})</h3>
       <input
          className="input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث بالوحدة, الحالة, أو تاريخ الاستحقاق..."
          style={{marginBottom: '8px'}}
        />
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>الوحدة</th><th>النوع</th><th>المبلغ</th><th>المتبقي</th><th>المسدد</th>
              <th>الاستحقاق</th><th>تاريخ السداد</th><th>الحالة</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.map(i => {
              const paidSoFar = state.payments
                .filter(p => p.installmentId === i.id)
                .reduce((sum, p) => sum + p.amount, 0);
              return (
                <tr key={i.id} className={getRowClass(i)}>
                  <td>{getUnitCode(i.unitId)}</td>
                  <td>{i.type || ''}</td>
                  <td>{egp(i.originalAmount != null ? i.originalAmount : i.amount)}</td>
                  <td>{egp(i.amount)}</td>
                  <td>{egp(paidSoFar)}</td>
                  <td>{i.dueDate || ''}</td>
                  <td>{i.paymentDate || '—'}</td>
                  <td>{i.status || 'غير مدفوع'}</td>
                  <td>
                    <button
                      className="btn ok"
                      onClick={() => setPayingInstallment({...i, unitCode: getUnitCode(i.unitId)})}
                      disabled={i.status === 'مدفوع'}
                        style={{marginLeft: '4px'}}
                    >
                      دفع
                    </button>
                      <button
                        className="btn"
                        onClick={() => setReschedulingInstallment({...i, unitCode: getUnitCode(i.unitId)})}
                        disabled={i.status === 'مدفوع'}
                        style={{marginLeft: '4px'}}
                      >
                        إعادة جدولة
                      </button>
                      <button className="btn warn" onClick={() => handleDeleteInstallment(i.id)}>حذف</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {payingInstallment && (
        <PayInstallmentModal
          installment={payingInstallment}
          onSave={handleSavePayment}
          onClose={() => setPayingInstallment(null)}
        />
      )}
      {reschedulingInstallment && (
        <RescheduleModal
          installment={reschedulingInstallment}
          onSave={handleSaveReschedule}
          onClose={() => setReschedulingInstallment(null)}
        />
      )}
    </div>
  );
}

export default InstallmentsPage;
