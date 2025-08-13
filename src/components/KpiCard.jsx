import React from 'react';

function KpiCard({ title, value, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="big">{value}</div>
      {children}
    </div>
  );
}

export default KpiCard;
