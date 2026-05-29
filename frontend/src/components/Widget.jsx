import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Widget() {
  const [workspaces, setWorkspaces] = useState([]);
  const [stats, setStats] = useState({ cpu: 0, ram: 0 });

  useEffect(() => {
    // Load Workspaces
    axios.get('http://localhost:8000/api/workspaces')
      .then(res => setWorkspaces(res.data))
      .catch(err => console.error(err));

    // Load Stats periodically
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/system/stats');
        setStats(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const launchWorkspace = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/workspaces/${id}/launch`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-full bg-dark-bg/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col p-4 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-brand-primary" />
        <h2 className="font-bold text-lg">Nexus Mini</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-gray-400">CPU Usage</p>
          <p className="font-bold text-blue-400">{stats.cpu}%</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <p className="text-xs text-gray-400">RAM Usage</p>
          <p className="font-bold text-purple-400">{stats.ram}%</p>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Launch</h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {workspaces.map(ws => (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            key={ws.id} 
            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-colors"
            onClick={() => launchWorkspace(ws.id)}
          >
            <span className="font-medium text-sm">{ws.name}</span>
            <Play size={14} className="text-brand-primary" />
          </motion.div>
        ))}
        {workspaces.length === 0 && (
          <p className="text-xs text-gray-500 text-center mt-4">No workspaces configured.</p>
        )}
      </div>
    </div>
  );
}
