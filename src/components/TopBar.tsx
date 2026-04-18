import React from 'react';
import { Search, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-8 w-full h-16 bg-surface-container-lowest/70 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input 
            className="w-full pl-10 pr-4 py-1.5 bg-surface-container-high rounded-full border-none text-sm focus:ring-1 focus:ring-primary-container" 
            placeholder="Search resources..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:opacity-70 transition-opacity">
            <Bell size={20} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-on-surface-variant hover:text-red-500 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-primary-container">{currentUser?.username || 'Guest'}</p>
            <p className="text-[10px] uppercase tracking-tighter text-on-primary-container">
              {currentUser?.role === 'admin' ? 'System Administrator' : 'Viewer Account'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-black dark:text-white font-black ambient-shadow">
            {currentUser?.username?.charAt(0).toUpperCase() || 'G'}
          </div>
        </div>
      </div>
    </header>
  );
}
