import React, { useState } from 'react';
import { Building2, Clock, ShieldCheck, Compass, Plus, Edit2, Check, X, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useApp, Batch } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Schedule() {
  const { classrooms, batches, mockDetails, updateBatch } = useApp();
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [scheduleType, setScheduleType] = useState<'Batches' | 'Mocks'>('Batches');

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBatch) {
      updateBatch(editingBatch.id, editingBatch);
      setEditingBatch(null);
    }
  };

  const formatTime12 = (time24: string) => {
    if (!time24) return '';
    const [hours, mins] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const PX_PER_HOUR = 130;
  const MIN_HOUR = 6;
  const TOTAL_HOURS = 18;

  const SESSIONS = [
    { start: '06:00', end: '08:00' },
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
    { start: '20:00', end: '22:00' },
    { start: '22:00', end: '24:00' }
  ];

  const getOffset = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h - MIN_HOUR) * PX_PER_HOUR + (m / 60) * PX_PER_HOUR;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
        <div className="flex bg-surface-container-high p-1 rounded-xl w-full md:w-auto self-start">
          <button 
            onClick={() => setScheduleType('Batches')}
            className={cn(
              "flex-1 md:w-48 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              scheduleType === 'Batches' ? "bg-secondary text-white shadow-lg" : "text-outline hover:bg-surface-container-low"
            )}
          >
            Batch Schedule
          </button>
          <button 
            onClick={() => setScheduleType('Mocks')}
            className={cn(
              "flex-1 md:w-48 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              scheduleType === 'Mocks' ? "bg-secondary text-white shadow-lg" : "text-outline hover:bg-surface-container-low"
            )}
          >
            Mock Schedule
          </button>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-surface-container-lowest py-3 px-6 border-l-4 border-secondary ambient-shadow rounded-r-xl hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-outline mb-0.5">Active Items</p>
            <p className="text-2xl font-black text-primary-container">
              {scheduleType === 'Batches' ? batches.filter(b => b.status === 'Active').length : mockDetails.length}
            </p>
          </div>
        </div>
      </section>

      {/* Grid Container */}
      <div className="bg-surface-container-low overflow-x-auto shadow-2xl relative rounded-xl border border-outline-variant/30">
        <div style={{ minWidth: `${160 + (TOTAL_HOURS * PX_PER_HOUR)}px` }}>
          {/* Ruler Headers */}
          <div className="flex border-b-2 border-outline-variant sticky top-0 z-30 bg-surface-container-low">
            <div className="w-40 bg-secondary text-black dark:text-white p-6 font-black flex items-center justify-center shrink-0 h-24 shadow-lg z-40 transition-colors">
              <Compass size={24} className="mr-3" />
              <span className="tracking-widest text-[10px]">ROOMS</span>
            </div>
            <div className="flex-1 flex relative h-24 bg-surface-container-high/30 backdrop-blur-md">
              {SESSIONS.map((session, i) => {
                const left = getOffset(session.start);
                const width = getOffset(session.end) - left;
                return (
                  <div 
                    key={i} 
                    className="absolute top-0 bottom-0 border-x border-outline-variant/30 flex flex-col items-center justify-center bg-surface-container-low/20"
                    style={{ left: `${left}px`, width: `${width}px` }}
                  >
                    <span className="text-xs font-black text-black dark:text-white tracking-tighter">
                      {formatTime12(session.start)} — {formatTime12(session.end)}
                    </span>
                    <div className="mt-1 w-6 h-1 bg-secondary/60 rounded-full"></div>
                  </div>
                );
              })}
              
              {/* Hour Guides */}
              {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + MIN_HOUR).map(hour => (
                <div 
                  key={hour} 
                  className="absolute top-0 bottom-0 border-l border-outline-variant/10 pointer-events-none"
                  style={{ left: `${(hour - MIN_HOUR) * PX_PER_HOUR}px` }}
                />
              ))}
            </div>
          </div>

          {/* Grid Body */}
          <div className="flex flex-col">
            {classrooms.map((room) => {
              const roomBatches = scheduleType === 'Batches' 
                ? batches.filter(b => String(b.classroomId) === String(room.id) && b.status !== 'Closed')
                : [];
              const roomMocks = scheduleType === 'Mocks'
                ? mockDetails.filter(m => String(m.classroomId) === String(room.id))
                : [];
              
              return (
                <div key={room.id} className="flex border-b border-outline-variant/40 group">
                  <div className="w-40 bg-surface-container-lowest p-6 flex flex-col justify-center shrink-0 transition-all duration-300 group-hover:bg-secondary group-hover:text-black dark:group-hover:text-white border-r border-outline-variant/40">
                    <span className="text-lg font-black tracking-tight text-black dark:text-white group-hover:text-black dark:group-hover:text-white">{room.name}</span>
                  </div>
                  <div className="flex-1 flex relative h-48 bg-surface-container-low/30 overflow-hidden">
                    {/* Vertical Lines */}
                    {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute top-0 bottom-0 border-l border-outline-variant/10"
                        style={{ left: `${i * PX_PER_HOUR}px` }}
                      />
                    ))}
                  
                  {roomBatches.length === 0 && roomMocks.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-black uppercase tracking-[0.5em] text-black/5 dark:text-white/5">Facility Idle</span>
                    </div>
                  )}

                  {/* Render Batches */}
                  {roomBatches.map((batch) => {
                    const left = getOffset(batch.startTime);
                    const right = getOffset(batch.endTime);
                    const width = right - left;

                    return (
                      <motion.div 
                        key={batch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "absolute top-8 h-32 p-6 shadow-xl flex flex-col justify-between z-10 hover:z-20 transition-all rounded-xl border-t-4",
                          "bg-secondary text-black dark:text-white border-white/20"
                        )}
                        style={{ left: `${left}px`, width: `${width}px` }}
                      >
                        <div className="flex justify-between items-start text-black dark:text-white">
                          <span className="text-[9px] px-2 py-1 font-black bg-black/10 dark:bg-white/20 text-black dark:text-white rounded uppercase tracking-widest">
                            {batch.code}
                          </span>
                          <button 
                            onClick={() => setEditingBatch(batch)}
                            className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-black leading-tight text-black dark:text-white uppercase line-clamp-2">{batch.title}</h4>
                          <div className="flex flex-col gap-0.5">
                             <div className="flex items-center gap-1.5 text-black/80 dark:text-white/80">
                                <Clock size={11} />
                                <span className="text-[10px] font-bold">{formatTime12(batch.startTime)} — {formatTime12(batch.endTime)}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-black/60 dark:text-white/70">
                                <User size={11} />
                                <span className="text-[10px] font-bold uppercase tracking-wide truncate">{batch.trainer}</span>
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Render Mock Sessions */}
                  {roomMocks.map((mock) => {
                    const left = getOffset(mock.startTime);
                    const right = getOffset(mock.endTime);
                    const width = right - left;

                    return (
                      <motion.div 
                        key={mock.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "absolute top-8 h-32 p-6 shadow-xl flex flex-col justify-between z-10 hover:z-20 transition-all rounded-xl border-t-4",
                          "bg-red-700 text-black dark:text-white border-white/20"
                        )}
                        style={{ left: `${left}px`, width: `${width}px` }}
                      >
                        <div className="flex justify-between items-start text-black dark:text-white">
                          <span className="text-[9px] px-2 py-1 font-black bg-black/10 dark:bg-white/20 text-black dark:text-white rounded uppercase tracking-widest">
                            MOCK
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-black leading-tight text-black dark:text-white uppercase line-clamp-2">MOCK ASSESSMENT</h4>
                          <div className="flex flex-col gap-0.5">
                             <div className="flex items-center gap-1.5 text-black/80 dark:text-white/80">
                                <Clock size={11} />
                                <span className="text-[10px] font-bold text-black/90 dark:text-white/90">{formatTime12(mock.startTime)} — {formatTime12(mock.endTime)}</span>
                             </div>
                             <div className="flex items-center gap-1.5 text-black/60 dark:text-white/60">
                                <User size={11} />
                                <span className="text-[10px] font-bold uppercase tracking-wide truncate text-black/80 dark:text-white/80">{mock.trainer}</span>
                             </div>
                             <div className="text-[8px] font-bold bg-black/10 dark:bg-white/10 text-black dark:text-white px-1 inline-block mt-1 self-start rounded transition-colors">
                               {mock.date}
                             </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingBatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBatch(null)}
              className="absolute inset-0 bg-primary-container/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-container">Edit Batch Schedule</h3>
                <button onClick={() => setEditingBatch(null)} className="text-outline hover:text-primary-container">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleEditSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-label text-outline block">Classroom</label>
                  <select 
                    className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                    value={editingBatch.classroomId}
                    onChange={(e) => setEditingBatch({ ...editingBatch, classroomId: e.target.value })}
                  >
                    {classrooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Start Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={editingBatch.startTime}
                      onChange={(e) => setEditingBatch({ ...editingBatch, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">End Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={editingBatch.endTime}
                      onChange={(e) => setEditingBatch({ ...editingBatch, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-secondary text-white font-bold rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Check size={20} />
                    Update Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contextual FAB */}
      <button className="fixed bottom-10 right-10 bg-secondary text-white w-16 h-16 shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50">
        <Plus size={32} />
      </button>
    </div>
  );
}
