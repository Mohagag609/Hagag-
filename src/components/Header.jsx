import React, { useContext } from 'react';
import AppContext from '../AppContext';

function Header() {
  const { state, setState } = useContext(AppContext);
  // In a real app, undo/redo logic would come from a history hook
  // For now, we'll just have placeholders.
  const handleUndo = () => console.log("Undo clicked");
  const handleRedo = () => console.log("Redo clicked");

  const handleThemeChange = (e) => {
    setState(prev => ({...prev, settings: {...prev.settings, theme: e.target.value}}));
  };

  const handleFontChange = (e) => {
    setState(prev => ({...prev, settings: {...prev.settings, font: Number(e.target.value)}}));
  };

  return (
    <div className="header">
      <div className="brand"><div className="logo">🏛️</div><h1>مدير الاستثمار العقاري - نسخة React</h1></div>
      <div className="tools">
        <button className="btn secondary" onClick={handleUndo} title="تراجع (Ctrl+Z)">↪️</button>
        <button className="btn secondary" onClick={handleRedo} title="إعادة (Ctrl+Y)">↩️</button>
        <select className="select" value={state.settings.theme} onChange={handleThemeChange}>
            <option value="dark">داكن</option>
            <option value="light">فاتح</option>
        </select>
        <select className="select" value={state.settings.font} onChange={handleFontChange}>
            <option value="14">خط 14</option>
            <option value="16">خط 16</option>
            <option value="18">خط 18</option>
        </select>
        <button className="btn secondary" id="lockBtn">🔒 قفل</button>
      </div>
    </div>
  );
}

export default Header;
