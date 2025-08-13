import React, { useContext } from 'react';
import AppContext from '../AppContext';
import { today } from '../utils';

function BackupPage() {
  const { state, setState } = useContext(AppContext);

  const handleBackup = () => {
    const data = JSON.stringify(state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estate-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.confirm('سيتم استبدال كل البيانات الحالية. هل أنت متأكد؟')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const restoredState = JSON.parse(e.target.result);
        // Basic validation
        if (restoredState && restoredState.settings && Array.isArray(restoredState.units)) {
          setState(restoredState);
          alert('تمت الاستعادة بنجاح.');
        } else {
          alert('ملف غير صالح.');
        }
      } catch (err) {
        alert('ملف غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
    event.target.value = null; // Reset file input
  };

  const handleReset = () => {
    if (prompt('اكتب "مسح" لتأكيد حذف كل البيانات') === 'مسح') {
      // This is a destructive action, so we just clear the state
      // A full page reload might be better but this works for SPA
      localStorage.removeItem('estate_pro_final_v3');
      window.location.reload(); // Easiest way to reset everything
    }
  };

  return (
    <div className="card">
      <h3>النسخ الاحتياطي والاستعادة</h3>
      <p>يتم حفظ بياناتك في متصفحك. قم بتنزيل نسخة احتياطية بشكل دوري.</p>
      <div className="tools">
        <button className="btn" onClick={handleBackup}>تنزيل نسخة JSON</button>
        <label className="btn secondary">
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestore} />
          استعادة نسخة
        </label>
        <button className="btn warn" onClick={handleReset}>مسح كل البيانات</button>
      </div>
    </div>
  );
}

export default BackupPage;
