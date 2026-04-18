import React from 'react';
import { LayoutDashboard, School, Users, CalendarDays, BarChart3, Settings, HelpCircle, Database, Layers, GraduationCap, BookOpen, MapPin, ClipboardList } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MapPin, label: 'Classrooms', path: '/classrooms' },
  { icon: Layers, label: 'Batches', path: '/batches' },
  { icon: GraduationCap, label: 'Students Details', path: '/students' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: Users, label: 'Trainers', path: '/teachers' },
  { icon: ClipboardList, label: 'Mock Details', path: '/mock-details' },
  { icon: CalendarDays, label: 'Schedule', path: '/schedule' },
  { icon: Database, label: 'Database', path: '/database' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export default function Sidebar() {
  const location = useLocation();
  const { userRole } = useApp();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col z-50 transition-colors duration-300">
      <div className="px-8 py-10 bg-surface-container-high/50">
        <h1 className="text-xl font-black tracking-tighter text-black dark:text-white uppercase transition-colors duration-300">Batch Cordinator</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white/60 mt-1">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          // Hide sensitive technical items from non-admins
          if ((item.path === '/database' || item.path === '/reports') && userRole !== 'admin') {
            return null;
          }
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-8 py-3 transition-all duration-200 group",
                isActive 
                  ? "font-black bg-black dark:bg-white text-white dark:text-black shadow-lg z-10" 
                  : "text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white dark:text-black" : "text-black dark:text-white")} />
              <span className="text-[11px] font-black uppercase tracking-widest leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-outline-variant/10">
        <button className="w-full bg-black dark:bg-white text-white dark:text-black text-[0.75rem] font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-all ambient-shadow active:scale-95 shadow-lg">
          New Record
        </button>
      </div>

      <div className="pb-10 pt-4 space-y-1">
        {userRole === 'admin' && (
          <Link to="/settings" className="flex items-center gap-3 px-8 py-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-black group">
            <Settings size={18} className="text-black dark:text-white" />
            <span className="text-[11px] font-black uppercase tracking-widest leading-none">Settings</span>
          </Link>
        )}
        <Link to="/support" className="flex items-center gap-3 px-8 py-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-black group">
          <HelpCircle size={18} className="text-black dark:text-white" />
          <span className="text-[11px] font-black uppercase tracking-widest leading-none">Support</span>
        </Link>
      </div>
    </aside>
  );
}
