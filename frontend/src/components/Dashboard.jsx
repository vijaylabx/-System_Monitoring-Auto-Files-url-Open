import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, MemoryStick, Wifi, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass-panel p-6 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold">{value}%</h3>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ cpu: 0, ram: 0, disk: 0, net_up: 0, net_down: 0 });
  const [processes, setProcesses] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statRes, procRes] = await Promise.all([
          axios.get(`${API_BASE}/system/stats`),
          axios.get(`${API_BASE}/system/processes`)
        ]);
        setStats(statRes.data);
        setProcesses(procRes.data);
      } catch (err) {
        console.error("Failed to fetch system data", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const killProcess = async (pid) => {
    try {
      await axios.delete(`${API_BASE}/system/processes/${pid}`);
      setProcesses(prev => prev.filter(p => p.pid !== pid));
    } catch (err) {
      console.error("Failed to kill process", err);
      alert("Failed to kill process. Ensure you have the right permissions.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold">System Overview</h2>
        <p className="text-gray-400 mt-1">Real-time metrics and activity</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="CPU Usage" 
          value={stats.cpu} 
          icon={Cpu} 
          colorClass="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <StatCard 
          title="RAM Usage" 
          value={stats.ram} 
          icon={MemoryStick} 
          colorClass="bg-gradient-to-br from-purple-500 to-purple-700"
        />
        <StatCard 
          title="Disk Usage" 
          value={stats.disk} 
          icon={HardDrive} 
          colorClass="bg-gradient-to-br from-teal-500 to-teal-700"
        />
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700">
            <Wifi size={24} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Network (Mbps)</p>
            <div className="flex gap-3 mt-1">
              <span className="text-emerald-400 font-bold text-sm">↑ {stats.net_up}</span>
              <span className="text-emerald-400 font-bold text-sm">↓ {stats.net_down}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6 overflow-hidden flex flex-col">
          <h3 className="text-xl font-semibold mb-4">Active Processes</h3>
          <div className="overflow-y-auto flex-1 h-64 pr-2 custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-white/5 text-gray-300 sticky top-0">
                <tr>
                  <th className="px-4 py-2 rounded-l-lg">Name</th>
                  <th className="px-4 py-2">PID</th>
                  <th className="px-4 py-2">RAM %</th>
                  <th className="px-4 py-2">CPU %</th>
                  <th className="px-4 py-2 rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((proc, idx) => (
                  <tr key={`${proc.pid}-${idx}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-200 truncate max-w-[120px]">{proc.name}</td>
                    <td className="px-4 py-3">{proc.pid}</td>
                    <td className="px-4 py-3">{proc.memory_percent?.toFixed(1) || 0}%</td>
                    <td className="px-4 py-3">{proc.cpu_percent?.toFixed(1) || 0}%</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => killProcess(proc.pid)} 
                        className="text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 p-2 rounded-lg"
                        title="Kill Process"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {processes.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Fetching processes...</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
          <div className="space-y-4">
             <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
               <p className="text-blue-200">🚀 You spent 4h 20m in VS Code today.</p>
             </div>
             <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
               <p className="text-purple-200">📈 Chrome usage increased by 30%.</p>
             </div>
             <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
               <p className="text-teal-200">💡 Most edited project: monitoring-dashboard</p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
