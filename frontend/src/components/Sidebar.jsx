import React from 'react';
import { LayoutDashboard, Layers, PieChart, Settings, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workspaces', label: 'Workspaces', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 glass-panel m-4 flex flex-col p-4">
      <div className="flex items-center gap-3 mb-10 px-2 mt-4">
        <div className="bg-gradient-to-tr from-brand-primary to-brand-accent p-2 rounded-lg">
          <Activity size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
          Nexus
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-bg"
                  className="absolute inset-0 bg-brand-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="font-medium relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left relative ${
            activeTab === 'settings' ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          {activeTab === 'settings' && (
            <motion.div 
              layoutId="active-bg"
              className="absolute inset-0 bg-brand-primary/20 rounded-xl"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <Settings size={20} className="relative z-10" />
          <span className="font-medium relative z-10">Settings</span>
        </button>
      </div>
    </div>
  );
}
