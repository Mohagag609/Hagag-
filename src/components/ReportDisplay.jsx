import React from 'react';

function ReportDisplay({ result }) {
  if (!result) return null;

  const { title, headers, rows } = result;

  // This is a simplified version of the old print logic
  const handlePrint = () => {
    // In a real React app, a library like react-to-print would be better.
    // For now, we replicate the old vanilla JS logic.
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: system-ui, Segoe UI, Roboto; direction: rtl; color: #111; }
            h1 { font-size: 20px; margin: 0 0 12px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: right; }
            thead th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table class="table">
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div>
      <div className="header">
        <h4>نتائج التقرير: {title}</h4>
        <button className="btn" onClick={handlePrint}>طباعة PDF</button>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length}>لا توجد بيانات لهذا التقرير.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportDisplay;
