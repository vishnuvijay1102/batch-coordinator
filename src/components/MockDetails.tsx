import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ClipboardList, User, MapPin, Clock, Calendar, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, MockDetail } from '../context/AppContext';
import { cn } from '@/src/lib/utils';

export default function MockDetails() {
  const { mockDetails, addMockDetail, deleteMockDetail, updateMockDetail, classrooms, teachers, userRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMock, setEditingMock] = useState<MockDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canEdit = userRole === 'admin';

  // Form State
  const [classroomId, setClassroomId] = useState('');
  const [trainer, setTrainer] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const openModal = (mock?: MockDetail) => {
    if (mock) {
      setEditingMock(mock);
      setClassroomId(mock.classroomId);
      setTrainer(mock.trainer);
      setDate(mock.date);
      setStartTime(mock.startTime);
      setEndTime(mock.endTime);
    } else {
      setEditingMock(null);
      setClassroomId('');
      setTrainer('');
      setDate('');
      setStartTime('');
      setEndTime('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { classroomId, trainer, date, startTime, endTime };
    
    if (editingMock) {
      updateMockDetail(editingMock.id, data);
    } else {
      addMockDetail(data);
    }
    setIsModalOpen(false);
  };

  const filteredMocks = mockDetails.filter(mock => {
    const roomName = classrooms.find(r => String(r.id) === String(mock.classroomId || ''))?.name || '';
    return (
      roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mock.trainer || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-label text-secondary block mb-2 uppercase tracking-widest font-bold">Assessment Management</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Mock Session Details</h2>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text" 
              placeholder="Search by Room or Trainer..." 
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {canEdit && (
            <button 
              onClick={() => openModal()}
              className="px-6 py-3 bg-secondary text-white font-semibold rounded-md shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
            >
              <Plus size={18} />
              Add Mock
            </button>
          )}
        </div>
      </section>

      {/* Mock Details Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-[0.65rem] uppercase tracking-widest text-outline border-bottom border-outline-variant/10">
              <th className="px-8 py-4 font-bold">Classroom</th>
              <th className="px-8 py-4 font-bold">Trainer</th>
              <th className="px-8 py-4 font-bold">Date</th>
              <th className="px-8 py-4 font-bold">Timing</th>
              {canEdit && <th className="px-8 py-4 font-bold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredMocks.length > 0 ? (
              filteredMocks.map((mock) => (
                <tr key={mock.id || `mock-${Math.random()}`} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                        <MapPin size={16} />
                      </div>
                      <span className="font-bold text-primary-container">
                        {classrooms.find(r => String(r.id) === String(mock.classroomId))?.name || 'Unknown Room'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                        <User size={16} />
                      </div>
                      <span className="text-on-surface-variant font-medium">{mock.trainer}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Calendar size={14} className="text-outline" />
                      <span className="text-sm font-mono">{mock.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Clock size={14} className="text-outline" />
                      <span className="text-sm font-mono">{mock.startTime} - {mock.endTime}</span>
                    </div>
                  </td>
                  {canEdit && (
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal(mock)}
                          className="p-2 text-outline hover:text-primary-container hover:bg-surface-container-low rounded-md transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteMockDetail(mock.id)}
                          className="p-2 text-outline hover:text-secondary hover:bg-secondary/10 rounded-md transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canEdit ? 5 : 4} className="px-8 py-12 text-center text-outline">
                   <div className="flex flex-col items-center gap-2">
                     <ClipboardList size={32} className="opacity-20" />
                     <p>No mock sessions found.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary-container/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border-t-4 border-secondary"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black tracking-tight text-primary-container">
                    {editingMock ? 'Update Mock Detail' : 'Schdule New Mock'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-primary-container transition-colors p-2 hover:bg-surface-container-low rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-outline">Classroom Location</label>
                      <select
                        required
                        value={classroomId}
                        onChange={(e) => setClassroomId(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all appearance-none"
                      >
                        <option value="">Select a Classroom</option>
                        {classrooms.map(room => (
                          <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-outline">Trainer / Evaluator</label>
                      <select
                        required
                        value={trainer}
                        onChange={(e) => setTrainer(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all appearance-none"
                      >
                        <option value="">Select Trainer</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                        ))}
                        <option value="External Evaluator">External Evaluator</option>
                      </select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-outline">Mock Date</label>
                      <input
                        required
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-outline">Start Time</label>
                      <input
                        required
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-outline">End Time</label>
                      <input
                        required
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 font-bold text-outline hover:bg-surface-container-low rounded-md transition-all uppercase tracking-widest text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-secondary text-white font-bold rounded-md shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                      {editingMock ? <Check size={18} /> : <Plus size={18} />}
                      {editingMock ? 'Save Changes' : 'Initialize Mock'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
