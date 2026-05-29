import React, { useState } from 'react';
import { LayoutDashboard, Layers, PieChart, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workspaces', label: 'Workspaces', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ width: isHovered ? 256 : 88 }}
      className="glass-panel m-4 flex flex-col py-4 px-3 overflow-hidden z-50 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 mb-10 px-2 mt-4 overflow-hidden whitespace-nowrap">
        <div className="bg-gradient-to-tr from-brand-primary to-brand-accent p-2 rounded-lg flex-shrink-0">
          <Activity size={24} className="text-white" />
        </div>
        <AnimatePresence>
          {isHovered && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400"
            >
              Nexus
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex flex-col gap-2 flex-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative ${
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
              <div className="flex items-center gap-4 w-full">
                <Icon size={20} className="relative z-10 flex-shrink-0" />
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium relative z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Tooltip for collapsed state */}
              {!isHovered && (
                <div className="absolute left-16 bg-white text-gray-900 font-semibold px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto w-full">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`group flex items-center px-4 py-3 rounded-xl transition-all relative ${
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
          <div className="flex items-center gap-4 w-full">
            <Settings size={20} className="relative z-10 flex-shrink-0" />
            <AnimatePresence>
              {isHovered && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium relative z-10 whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {!isHovered && (
            <div className="absolute left-16 bg-white text-gray-900 font-semibold px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Settings
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
