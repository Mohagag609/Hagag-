import React from 'react';

const routes = [
  {id:'dash',title:'لوحة التحكم'},
  {id:'customers',title:'العملاء'},
  {id:'units',title:'الوحدات'},
  {id:'contracts',title:'العقود'},
  {id:'installments',title:'الأقساط'},
  {id:'payments',title:'المدفوعات'},
  {id:'partners',title:'الشركاء'},
  {id:'reports',title:'التقارير'},
  {id:'backup',title:'نسخة احتياطية'},
];

function Tabs({ activeView, setActiveView }) {
  return (
    <div className="tabs">
      {routes.map(route => (
        <button
          key={route.id}
          className={`tab ${activeView === route.id ? 'active' : ''}`}
          onClick={() => setActiveView(route.id)}
        >
          {route.title}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
