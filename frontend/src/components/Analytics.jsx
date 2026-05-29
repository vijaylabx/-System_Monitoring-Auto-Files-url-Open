import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({ insights: [], top_software: [] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/analytics/summary');
        setAnalyticsData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#cbd5e1' } },
    },
    scales: {
      y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
    },
  };

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Focus Hours',
        data: [4, 6, 5, 8, 7, 3, 2],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Idle Hours',
        data: [1, 2, 1, 0.5, 1.5, 3, 4],
        backgroundColor: 'rgba(148, 163, 184, 0.5)',
        borderRadius: 4,
      }
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold">Productivity Analytics</h2>
        <p className="text-gray-400 mt-1">Track your work habits and software usage</p>
      </header>

      <div className="glass-panel p-6 mb-8 h-96">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Weekly Focus Trends</h3>
        <div className="h-full pb-8">
          <Bar data={data} options={{...options, maintainAspectRatio: false}} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-semibold mb-4">Top Used Software (Today)</h3>
          <ul className="space-y-4">
            {analyticsData.top_software.map((item, i) => {
              // Calculate a simple percentage based on max being 8 hours (480 mins) for visual scaling
              const percent = Math.min((item.duration / 480) * 100, 100);
              return (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-gray-300 truncate w-1/2">{item.name} ({item.duration}m)</span>
                  <div className="w-1/2 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                  </div>
                </li>
              );
            })}
            {analyticsData.top_software.length === 0 && <p className="text-gray-500">No data collected yet today.</p>}
          </ul>
        </div>
        
        <div className="glass-panel p-6 bg-gradient-to-br from-brand-accent/20 to-transparent">
          <h3 className="text-xl font-semibold mb-4">Daily Summary & Insights</h3>
          <ul className="space-y-3 text-gray-300 leading-relaxed list-disc list-inside">
            {analyticsData.insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
