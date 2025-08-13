import React from 'react';
import { egp } from '../utils';

function BarChart({ rows }) { // e.g., [['Label', value], ...]
  if (!rows || !rows.length) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>لا توجد بيانات لعرضها</div>;
  }

  const maxVal = Math.max(...rows.map(r => r[1]));
  if (maxVal === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>لا توجد تدفقات نقدية قادمة</div>;
  }

  const bars = rows.map(([label, value], i) => {
    const percent = (value / maxVal) * 100;
    return (
      <g key={label} transform={`translate(${i * 55 + 10}, 0)`}>
        <title>{label}: {egp(value)}</title>
        <rect y={100 - percent} width="40" height={percent} fill="var(--brand)" rx="4"></rect>
        <text x="20" y="115" textAnchor="middle" fill="var(--muted)" fontSize="10">{label}</text>
      </g>
    );
  });

  return (
    <svg viewBox={`0 0 ${rows.length * 55 + 10} 120`} width="100%" height="150" style={{ marginTop: '10px' }}>
      {bars}
    </svg>
  );
}

export default BarChart;
