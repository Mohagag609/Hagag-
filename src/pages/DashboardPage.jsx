import React, { useContext } from 'react';
import AppContext from '../AppContext';
import KpiCard from '../components/KpiCard';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import { egp } from '../utils';

function DashboardPage() {
  const { state } = useContext(AppContext);

  // Calculations
  const total = state.units.length;
  const avail = state.units.filter(u => u.status === 'متاحة').length;
  const sold = state.units.filter(u => u.status === 'مباعة').length;
  const ret = state.units.filter(u => u.status === 'مرتجعة').length;
  const revenue = state.payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const now = new Date();
  const proj = {};
  state.installments
    .filter(i => i.status !== 'مدفوع' && i.dueDate && new Date(i.dueDate) >= now)
    .forEach(i => {
      const ym = i.dueDate.slice(0, 7);
      proj[ym] = (proj[ym] || 0) + Number(i.amount || 0);
    });
  const projRows = Object.keys(proj).sort().slice(0, 6).map(k => [k, proj[k]]);

  const unitChartData = [
    { value: avail, color: '#2563eb', label: 'متاحة' },
    { value: sold, color: '#16a34a', label: 'مباعة' },
    { value: ret, color: '#ef4444', label: 'مرتجعة' }
  ];

  return (
    <div>
      <div className="grid grid-3">
        <div className="card">
            <h3>نظرة عامة على الوحدات</h3>
            <DonutChart items={unitChartData} />
        </div>
        <KpiCard title="إجمالي الوحدات" value={total} />
        <KpiCard title="إجمالي المتحصلات" value={egp(revenue)} />
      </div>
      <div className="card" style={{ marginTop: '10px' }}>
        <h3>التدفقات النقدية المتوقعة (6 أشهر)</h3>
        <BarChart rows={projRows} />
        {/* Print button can be added later if needed */}
      </div>
    </div>
  );
}

export default DashboardPage;
