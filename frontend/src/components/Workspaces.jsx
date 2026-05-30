import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Trash2, Edit2, Folder, Globe, Terminal, Layers, X } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newWs, setNewWs] = useState({ name: '', websites: '', applications: '', folders: '' });
  
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get(`${API_BASE}/workspaces`);
      setWorkspaces(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunch = async (id) => {
    try {
      await axios.post(`${API_BASE}/workspaces/${id}/launch`);
      // Could show a notification here
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/workspaces/${id}`);
      fetchWorkspaces();
    } catch (err) {
      console.error("Failed to delete workspace", err);
    }
  };

  const handleEditClick = (ws) => {
    setNewWs({
      name: ws.name,
      websites: ws.config.websites ? ws.config.websites.join('\n') : '',
      applications: ws.config.applications ? ws.config.applications.join('\n') : '',
      folders: ws.config.folders ? ws.config.folders.join('\n') : ''
    });
    setEditingId(ws.id);
    setIsCreating(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const config = {
        websites: newWs.websites.split('\n').filter(Boolean),
        applications: newWs.applications.split('\n').filter(Boolean),
        folders: newWs.folders.split('\n').filter(Boolean)
      };
      
      if (editingId) {
        await axios.put(`${API_BASE}/workspaces/${editingId}`, { name: newWs.name, config });
      } else {
        await axios.post(`${API_BASE}/workspaces`, { name: newWs.name, config });
      }
      
      setIsCreating(false);
      setEditingId(null);
      setNewWs({ name: '', websites: '', applications: '', folders: '' });
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Smart Workspaces</h2>
          <p className="text-gray-400 mt-1">Bulk launcher system for your environments</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewWs({ name: '', websites: '', applications: '', folders: '' });
            setIsCreating(true);
          }}
          className="bg-brand-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={20} />
          New Workspace
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div key={ws.id} className="glass-panel p-6 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => handleEditClick(ws)} className="text-gray-400 hover:text-white transition-colors" title="Edit Workspace">
                <Edit2 size={20} />
              </button>
              <button onClick={() => handleDelete(ws.id)} className="text-red-400 hover:text-red-300 transition-colors" title="Delete Workspace">
                <Trash2 size={20} />
              </button>
            </div>
            
            <h3 className="text-xl font-bold mb-4">{ws.name}</h3>
            
            <div className="space-y-3 mb-6 flex-1 text-sm text-gray-300">
              {ws.config.websites && ws.config.websites.length > 0 && (
                <div className="flex items-start gap-2">
                  <Globe size={16} className="mt-0.5 text-blue-400" />
                  <span>{ws.config.websites.length} Websites</span>
                </div>
              )}
              {ws.config.applications && ws.config.applications.length > 0 && (
                <div className="flex items-start gap-2">
                  <Terminal size={16} className="mt-0.5 text-purple-400" />
                  <span>{ws.config.applications.length} Applications</span>
                </div>
              )}
              {ws.config.folders && ws.config.folders.length > 0 && (
                <div className="flex items-start gap-2">
                  <Folder size={16} className="mt-0.5 text-teal-400" />
                  <span>{ws.config.folders.length} Folders</span>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleLaunch(ws.id)}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border border-white/5 group-hover:border-white/10"
            >
              <Play size={18} />
              Launch Session
            </button>
          </div>
        ))}

        {workspaces.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-white/10 rounded-2xl">
            <Layers size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No workspaces configured yet.</p>
            <p className="text-sm">Create one to get started with bulk launching.</p>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-lg p-6 relative"
          >
            <button onClick={() => { setIsCreating(false); setEditingId(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6">{editingId ? 'Edit Workspace' : 'Create New Workspace'}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Workspace Name</label>
                <input required type="text" value={newWs.name} onChange={e => setNewWs({...newWs, name: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary" placeholder="e.g. Development" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Websites (one per line)</label>
                <textarea value={newWs.websites} onChange={e => setNewWs({...newWs, websites: e.target.value})} className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary" placeholder="https://github.com&#10;https://chat.openai.com"></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Applications (.exe paths, one per line)</label>
                <textarea value={newWs.applications} onChange={e => setNewWs({...newWs, applications: e.target.value})} className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary" placeholder="C:/Program Files/Google/Chrome/Application/chrome.exe"></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Folders (absolute paths, one per line)</label>
                <textarea value={newWs.folders} onChange={e => setNewWs({...newWs, folders: e.target.value})} className="w-full h-24 bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-brand-primary" placeholder="D:/Projects/Dashboard"></textarea>
              </div>
              <button type="submit" className="w-full bg-brand-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors mt-4">
                {editingId ? 'Update Workspace' : 'Save Workspace'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
