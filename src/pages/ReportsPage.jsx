import React, { useState, useContext } from 'react';
import AppContext from '../AppContext';
import ReportDisplay from '../components/ReportDisplay';
import { egp } from '../utils';

// This logic is moved outside the component as it's a pure function
function runReport(type, state, filters) {
  const { from, to, partnerId } = filters;
  let title = '', headers = [], rows = [];

  const getUnitCode = (unitId) => state.units.find(u => u.id === unitId)?.code || '—';
  const getCustomerName = (customerId) => state.customers.find(c => c.id === customerId)?.name || '—';
  const getPartnerName = (pId) => state.partners.find(p => p.id === pId)?.name || '—';

  switch (type) {
    case 'units_status':
      title = 'تقرير حالة الوحدات'; headers = ['الحالة', 'العدد', 'إجمالي السعر'];
      const stats = {}; state.units.forEach(u => { stats[u.status] = (stats[u.status] || { c: 0, p: 0 }); stats[u.status].c++; stats[u.status].p += Number(u.totalPrice || 0); });
      rows = Object.keys(stats).map(k => [k, stats[k].c, egp(stats[k].p)]);
      break;
    case 'cust_activity':
      title='تقرير نشاط العملاء'; headers=['العميل','عدد الوحدات','إجمالي المدفوعات'];
      const custs={}; state.contracts.forEach(c=>{ custs[c.customerId]=(custs[c.customerId]||{u:new Set(),p:0}); custs[c.customerId].u.add(c.unitId); });
      let custPays=state.payments.slice();
      if(from) custPays=custPays.filter(p=>p.date>=from);
      if(to) custPays=custPays.filter(p=>p.date<=to);
      custPays.forEach(p=>{
        const ct=state.contracts.find(c=>c.unitId===p.unitId);
        if(ct&&ct.customerId&&custs[ct.customerId]) custs[ct.customerId].p+=Number(p.amount||0);
      });
      rows=Object.keys(custs).map(k=>[(state.customers.find(c=>c.id===k)||{}).name||k,custs[k].u.size,egp(custs[k].p)]);
      break;
    case 'inst_due':
      title='تقرير كل الأقساط المستحقة'; headers=['الوحدة','العميل','المبلغ','تاريخ الاستحقاق'];
      let inst=state.installments.filter(i=>i.status!=='مدفوع');
      if(from) inst=inst.filter(i=>i.dueDate>=from); if(to) inst=inst.filter(i=>i.dueDate<=to);
      rows=inst.map(i=>[getUnitCode(i.unitId),getCustomerName(state.contracts.find(c=>c.unitId===i.unitId)?.customerId),egp(i.amount),i.dueDate]);
      break;
    case 'inst_overdue':
      title='تقرير الأقساط المتأخرة فقط';
      headers=['الوحدة', 'العميل', 'المبلغ', 'تاريخ الاستحقاق', 'أيام التأخير'];
      const today = new Date();
      today.setHours(0,0,0,0);
      let overdueInst = state.installments.filter(i => {
          return i.status !== 'مدفوع' && i.dueDate && new Date(i.dueDate) < today;
      });
      if (from) overdueInst = overdueInst.filter(i => i.dueDate >= from);
      if (to) overdueInst = overdueInst.filter(i => i.dueDate <= to);
      rows = overdueInst.map(i => {
        const delay = Math.floor((today - new Date(i.dueDate)) / (1000 * 60 * 60 * 24));
        return [
          getUnitCode(i.unitId),
          getCustomerName(state.contracts.find(c=>c.unitId===i.unitId)?.customerId),
          egp(i.amount),
          i.dueDate,
          `${delay} يوم`
        ]
      });
      break;
    case 'payments_monthly':
      title='تقرير المدفوعات الشهرية'; headers=['الشهر','إجمالي المدفوعات'];
      let pays=state.payments.slice();
      if(from) pays=pays.filter(p=>p.date>=from); if(to) pays=pays.filter(p=>p.date<=to);
      const months={}; pays.forEach(p=>{ const ym=p.date.slice(0,7); months[ym]=(months[ym]||0)+Number(p.amount||0); });
      rows=Object.keys(months).sort().map(k=>[k,egp(months[k])]);
      break;
    case 'partner_profits':
      title='تفاصيل أرباح الشركاء'; headers=['الشريك','الوحدة','إجمالي الدفعة','نسبة الشريك','ربح الشريك'];
      let partnerPays=state.payments.slice();
      if(from) partnerPays=partnerPays.filter(p=>p.date>=from); if(to) partnerPays=partnerPays.filter(p=>p.date<=to);
      partnerPays.forEach(p=>{
        const links=state.unitPartners.filter(up=>up.unitId===p.unitId);
        links.forEach(l=>{
          const profit=Math.round((p.amount*l.percent/100)*100)/100;
          rows.push([getPartnerName(l.partnerId),getUnitCode(p.unitId),egp(p.amount),l.percent+'%',egp(profit)]);
        });
      });
      break;
    case 'partner_cashflow':
      title = 'تقرير ملخص تدفقات الشريك';
      headers = ['الشهر', 'إجمالي حصة الأرباح'];
      if (!partnerId) return { title, headers, rows:[], error: 'الرجاء اختيار شريك'};
      const partner = state.partners.find(p=>p.id===partnerId);
      title += ` - ${partner.name}`;
      let paysForPartner = state.payments.slice();
      if (from) paysForPartner = paysForPartner.filter(p => p.date >= from);
      if (to) paysForPartner = paysForPartner.filter(p => p.date <= to);
      const monthlyProfits = {};
      paysForPartner.forEach(p => {
          const link = state.unitPartners.find(up => up.unitId === p.unitId && up.partnerId === partnerId);
          if (link) {
              const profit = (p.amount * link.percent / 100);
              const month = p.date.slice(0, 7);
              monthlyProfits[month] = (monthlyProfits[month] || 0) + profit;
          }
      });
      rows = Object.keys(monthlyProfits).sort().map(month => [ month, egp(monthlyProfits[month]) ]);
      break;
    case 'cashflow':
      title='تقرير التدفقات النقدية العامة'; headers=['التاريخ','البيان','مدين','دائن','الرصيد'];
      let trans=[];
      let payFlow=state.payments.slice();
      if(from) payFlow=payFlow.filter(p=>p.date>=from); if(to) payFlow=payFlow.filter(p=>p.date<=to);
      payFlow.forEach(p=>trans.push({d:p.date,n:`دفعة وحدة ${getUnitCode(p.unitId)}`,i:p.amount,o:0}));
      state.contracts.forEach(c=>{
        if(c.brokerAmount>0) {
          const include = (!from || c.start >= from) && (!to || c.start <= to);
          if(include) {
            trans.push({d:c.start, n:`عمولة سمسار ${getUnitCode(c.unitId)}`, i:0, o:c.brokerAmount});
          }
        }
      });
      trans.sort((a,b)=>a.d.localeCompare(b.d));
      let bal=0;
      rows=trans.map(t=>{ bal+=Number(t.i||0)-Number(t.o||0); return [t.d,t.n,egp(t.i),egp(t.o),egp(bal)]; });
      break;
  }
  return { title, headers, rows };
}

function ReportsPage() {
  const { state } = useContext(AppContext);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', partnerId: '' });
  const [reportResult, setReportResult] = useState(null);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerateReport = () => {
    if (!selectedReportType) {
      alert('الرجاء اختيار نوع التقرير أولاً.');
      return;
    }
    const result = runReport(selectedReportType, state, filters);
    if (result.error) {
      alert(result.error);
      setReportResult(null);
    } else {
      setReportResult(result);
    }
  };

  const handleSelectReport = (type) => {
    setSelectedReportType(type);
    // Automatically clear old results when selecting a new report type
    setReportResult(null);
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '12px' }}>1. اختر نوع التقرير</h3>
      <div className="grid grid-3" style={{gap: '12px', marginBottom: '16px'}}>
        <div className="card">
            <h4 style={{marginTop:0, marginBottom:'8px', borderBottom:'1px solid var(--line)', paddingBottom:'4px'}}>تقارير مالية</h4>
            <div className="tools" style={{flexDirection: 'column', gap: '8px', alignItems: 'stretch'}}>
                <button className={`btn gold report-btn ${selectedReportType === 'payments_monthly' ? 'active' : ''}`} onClick={()=>handleSelectReport('payments_monthly')}>مدفوعات شهرية</button>
                <button className={`btn gold report-btn ${selectedReportType === 'cashflow' ? 'active' : ''}`} onClick={()=>handleSelectReport('cashflow')}>التدفقات النقدية العامة</button>
            </div>
        </div>
        <div className="card">
            <h4 style={{marginTop:0, marginBottom:'8px', borderBottom:'1px solid var(--line)', paddingBottom:'4px'}}>تقارير الشركاء</h4>
            <div className="tools" style={{flexDirection: 'column', gap: '8px', alignItems: 'stretch'}}>
                <button className={`btn gold report-btn ${selectedReportType === 'partner_profits' ? 'active' : ''}`} onClick={()=>handleSelectReport('partner_profits')}>تفاصيل أرباح الشركاء</button>
                <button className={`btn gold report-btn ${selectedReportType === 'partner_cashflow' ? 'active' : ''}`} onClick={()=>handleSelectReport('partner_cashflow')}>ملخص تدفقات الشركاء</button>
            </div>
        </div>
        <div className="card">
            <h4 style="margin-top:0; margin-bottom:8px; border-bottom:1px solid var(--line); padding-bottom:4px;">تقارير المتابعة</h4>
            <div className="tools" style={{flexDirection: 'column', gap: '8px', alignItems: 'stretch'}}>
                <button className={`btn gold report-btn ${selectedReportType === 'inst_due' ? 'active' : ''}`} onClick={()=>handleSelectReport('inst_due')}>كل الأقساط المستحقة</button>
                <button className={`btn gold report-btn ${selectedReportType === 'inst_overdue' ? 'active' : ''}`} onClick={()=>handleSelectReport('inst_overdue')}>الأقساط المتأخرة فقط</button>
                <button className={`btn gold report-btn ${selectedReportType === 'cust_activity' ? 'active' : ''}`} onClick={()=>handleSelectReport('cust_activity')}>نشاط العملاء</button>
                <button className={`btn gold report-btn ${selectedReportType === 'units_status' ? 'active' : ''}`} onClick={()=>handleSelectReport('units_status')}>حالة الوحدات</button>
            </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '12px' }}>2. حدد الفلاتر (اختياري)</h3>
      <div className="tools" style={{ gap: '8px' }}>
        <input type="date" className="input" id="from" value={filters.from} onChange={handleFilterChange} />
        <input type="date" className="input" id="to" value={filters.to} onChange={handleFilterChange} />
        <select id="partnerId" className="select" value={filters.partnerId} onChange={handleFilterChange} style={{ visibility: (selectedReportType === 'partner_profits' || selectedReportType === 'partner_cashflow') ? 'visible' : 'hidden' }}>
            <option value="">اختر شريك...</option>
            {state.partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <h3 style={{ marginBottom: '12px' }}>3. قم بإنشاء التقرير</h3>
      <button className="btn" onClick={handleGenerateReport} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>إنشاء التقرير</button>
      <hr />
      <div id="rep-out">
        <ReportDisplay result={reportResult} />
      </div>
    </div>
  );
}

export default ReportsPage;
