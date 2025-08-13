import React from 'react';

function DonutChart({ items }) { // items = [{value, color, label}]
  const total = items.reduce((s, i) => s + i.value, 0);

  if (total === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>لا توجد بيانات لعرضها</div>;
  }

  const gradientParts = [];
  let currentDeg = 0;
  items.forEach(item => {
    const percent = item.value / total * 100;
    if(percent > 0) {
      gradientParts.push(`${item.color} ${currentDeg}deg ${currentDeg + percent * 3.6}deg`);
    }
    currentDeg += percent * 3.6;
  });

  const legend = items.map(i => (
    <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
      <div style={{ width: '12px', height: '12px', backgroundColor: i.color, borderRadius: '3px' }}></div>
      <div>{i.label}: <strong>{i.value}</strong></div>
    </div>
  ));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
      <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(${gradientParts.join(',')})` }}></div>
      <div style={{ fontSize: '13px' }}>{legend}</div>
    </div>
  );
}

export default DonutChart;
