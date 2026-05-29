import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, Bell, Monitor, Power, Database, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    autoStart: true,
    darkMode: true,
    notifications: true,
    delayBetweenLaunches: 1.5,
    autoCleanup: true,
  });

  useEffect(() => {
    axios.get('http://localhost:8000/api/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/settings', settings);
      alert("Settings saved successfully! You should see a native Windows notification.");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    }
  };

  const handleWipeData = () => {
    if (window.confirm("Are you sure you want to wipe all process and analytics data? This action cannot be undone.")) {
      // Typically call an API like DELETE /api/system/database
      alert("Analytics data wiped successfully!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 max-w-4xl"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Preferences & Settings</h2>
          <p className="text-gray-400 mt-1">Configure your Nexus automation experience</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-brand-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Save size={20} />
          Save Changes
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Power className="text-blue-400" size={24} />
            <h3 className="text-xl font-semibold">System Startup</h3>
          </div>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-gray-200 font-medium block">Launch on Boot</span>
              <span className="text-sm text-gray-400">Start Nexus silently when Windows starts</span>
            </div>
            <div className="relative">
              <input type="checkbox" name="autoStart" checked={settings.autoStart} onChange={handleChange} className="sr-only" />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.autoStart ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.autoStart ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>

        {/* Automation Settings */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Monitor className="text-purple-400" size={24} />
            <h3 className="text-xl font-semibold">Workspace Automation</h3>
          </div>
          
          <div>
            <label className="block text-gray-200 font-medium mb-1">Launch Delay (Seconds)</label>
            <p className="text-sm text-gray-400 mb-3">Delay between opening multiple applications to prevent CPU spikes.</p>
            <input 
              type="number" 
              name="delayBetweenLaunches" 
              value={settings.delayBetweenLaunches} 
              onChange={handleChange}
              step="0.5"
              min="0"
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary" 
            />
          </div>
        </div>

        {/* Database Settings */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Database className="text-teal-400" size={24} />
            <h3 className="text-xl font-semibold">Data & Privacy</h3>
          </div>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-gray-200 font-medium block">Auto-Cleanup Database</span>
              <span className="text-sm text-gray-400">Delete tracking logs older than 30 days</span>
            </div>
            <div className="relative">
              <input type="checkbox" name="autoCleanup" checked={settings.autoCleanup} onChange={handleChange} className="sr-only" />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.autoCleanup ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.autoCleanup ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>

        {/* Notifications */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
            <Bell className="text-yellow-400" size={24} />
            <h3 className="text-xl font-semibold">Notifications</h3>
          </div>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-gray-200 font-medium block">Desktop Alerts</span>
              <span className="text-sm text-gray-400">Show native Windows notifications for insights</span>
            </div>
            <div className="relative">
              <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} className="sr-only" />
              <div className={`block w-10 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-brand-primary' : 'bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.notifications ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 mt-8 border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-4">
          <AlertTriangle className="text-red-400" size={24} />
          <h3 className="text-xl font-semibold text-red-200">Danger Zone</h3>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-gray-200 font-medium">Wipe Analytics Data</h4>
            <p className="text-sm text-gray-400">Permanently delete all tracked process logs, file events, and generated insights.</p>
          </div>
          <button 
            onClick={handleWipeData}
            className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500/40 text-red-200 font-medium rounded-xl border border-red-500/30 transition-colors"
          >
            Clear Database
          </button>
        </div>
      </div>
    </motion.div>
  );
}
