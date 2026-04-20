import React from 'react';
import { School, Users, Layers, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { cn } from '@/src/lib/utils';

export default function Dashboard() {
  const { classrooms, batches, userRole } = useApp();

  const canEdit = userRole === 'admin';

  const stats = [
    { label: 'Total Classrooms', value: classrooms.length.toString(), icon: School, trend: '+2 New', trendColor: 'text-secondary' },
    { label: 'Active Teachers', value: '156', icon: Users, trend: '98% Active', trendColor: 'dark:text-secondary' },
    { label: 'Ongoing Batches', value: batches.length.toString(), icon: Layers, trend: 'Live Now', trendColor: 'dark:text-secondary' },
    { label: "Today's Total Schedule", value: '112', icon: Clock, accent: true },
  ];

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <section className="flex justify-between items-end text-primary">
        <div>
          <span className="text-label text-secondary block mb-2">Executive Overview</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary leading-none">Operational Dashboard</h2>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-surface-container-lowest text-primary font-semibold rounded-md shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-colors">
            Export Report
          </button>
          {canEdit && (
            <button className="px-6 py-3 bg-secondary text-white font-semibold rounded-md shadow-sm hover:opacity-90 transition-opacity">
              Manage Assets
            </button>
          )}
        </div>
      </section>

      {/* Bento Grid Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 rounded-xl shadow-sm relative overflow-hidden border border-outline-variant/10 transition-colors",
              stat.accent 
                ? "bg-primary-container dark:bg-secondary text-white" 
                : "bg-surface-container-lowest"
            )}
          >
            {!stat.accent && <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>}
            {stat.accent && <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>}
            
            <div className="flex justify-between items-start mb-6">
              <stat.icon size={20} className={stat.accent ? 'text-white/40' : 'text-outline'} />
              {stat.trend && <span className={cn("text-[10px] font-bold tracking-widest uppercase", stat.trendColor)}>{stat.trend}</span>}
            </div>
            <p className={cn("text-[0.7rem] uppercase tracking-widest font-semibold mb-1", stat.accent ? "text-white/60" : "text-outline")}>{stat.label}</p>
            <h3 className={cn("text-4xl font-extrabold tracking-tighter", stat.accent ? "text-white" : "text-primary")}>{stat.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Centered Classroom Availability */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-extrabold tracking-tight text-primary">Classroom Availability Architecture</h3>
          <p className="text-outline text-sm">Real-time spatial status based on current batch allocations for this week.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classrooms.map((room, i) => {
            const roomBatches = batches.filter(b => b.classroomId === room.id);
            const isAvailable = roomBatches.length === 0;

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex items-center justify-between group hover:border-secondary transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                    isAvailable 
                      ? "bg-secondary/10 dark:bg-secondary/20 text-secondary" 
                      : "bg-primary-container/10 dark:bg-primary/20 text-primary-container"
                  )}>
                    <School size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-primary">{room.name}</h4>
                    <p className="text-xs text-outline uppercase tracking-widest font-medium">{room.level}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors",
                    isAvailable 
                      ? "bg-secondary text-black dark:text-white" 
                      : "bg-surface-container-high text-black/40 dark:text-white/40"
                  )}>
                    {isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isAvailable ? 'Free Class' : 'Occupied'}
                  </div>
                  {!isAvailable && (
                    <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-tighter">
                      {roomBatches.length} Batch{roomBatches.length > 1 ? 'es' : ''} Active
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Secondary Panel - Feature Highlight */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-12 border-t border-outline-variant/10">
        <div className="bg-primary-container dark:bg-secondary rounded-xl p-10 text-white relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <h4 className="text-label text-white/60 mb-6">System Intelligence</h4>
          <h3 className="text-3xl font-bold tracking-tight mb-4 leading-tight">Automated Spatial<br/>Optimization Active</h3>
          <p className="text-white/80 text-sm leading-relaxed max-w-md">
            Our monolith architecture continuously monitors classroom load. If a room remains "Free" for more than 48 hours, the system suggests batch re-allocation for maximum campus efficiency.
          </p>
        </div>

        <div className="relative group h-full min-h-[240px] rounded-xl overflow-hidden shadow-lg border border-outline-variant/10">
          <img 
            alt="Campus View" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=1000" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <span className="px-2 py-1 bg-secondary text-white text-[8px] font-bold uppercase tracking-widest mb-2 inline-block">Updates</span>
            <h4 className="text-white font-bold text-2xl leading-tight">North Campus Expansion<br/>Nearing Completion</h4>
          </div>
        </div>
      </section>
    </div>
  );
}
