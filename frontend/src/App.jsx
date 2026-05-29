import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Workspaces from './components/Workspaces';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-dark-bg selection:bg-brand-primary/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
          {activeTab === 'workspaces' && <Workspaces key="workspaces" />}
          {activeTab === 'analytics' && <Analytics key="analytics" />}
          {activeTab === 'settings' && <Settings key="settings" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
