import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';

const APPKEY = 'estate_pro_final_v3';

const initial_state = {
  customers: [],
  units: [],
  partners: [],
  unitPartners: [],
  contracts: [],
  installments: [],
  payments: [],
  settings: { theme: 'dark', font: 16 },
  locked: false
};

function loadState() {
  try {
    const storedState = localStorage.getItem(APPKEY);
    return storedState ? JSON.parse(storedState) : initial_state;
  } catch {
    return initial_state;
  }
}

import Header from './components/Header';
import Tabs from './components/Tabs';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import UnitsPage from './pages/UnitsPage';
import ContractsPage from './pages/ContractsPage';
import InstallmentsPage from './pages/InstallmentsPage';
import PaymentsPage from './pages/PaymentsPage';
import PartnersPage from './pages/PartnersPage';
import ReportsPage from './pages/ReportsPage';
import BackupPage from './pages/BackupPage';

function App() {
  const [state, setState] = useState(loadState);
  const [activeView, setActiveView] = useState('dash');

  useEffect(() => {
    localStorage.setItem(APPKEY, JSON.stringify(state));
    document.documentElement.setAttribute('data-theme', state.settings.theme || 'dark');
    document.documentElement.style.fontSize = (state.settings.font || 16) + 'px';
  }, [state]);

  const contextValue = { state, setState, activeView, setActiveView };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dash': return <DashboardPage />;
      case 'customers': return <CustomersPage />;
      case 'units': return <UnitsPage />;
      case 'contracts': return <ContractsPage />;
      case 'installments': return <InstallmentsPage />;
      case 'payments': return <PaymentsPage />;
      case 'partners': return <PartnersPage />;
      case 'reports': return <ReportsPage />;
      case 'backup': return <BackupPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="container">
        <Header />
        <Tabs activeView={activeView} setActiveView={setActiveView} />
        <div className="panel">
          {renderActiveView()}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
