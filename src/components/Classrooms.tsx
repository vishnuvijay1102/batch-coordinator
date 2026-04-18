import React, { useState } from 'react';
import { School, Plus, Search, MoreVertical, MapPin, Users, Trash2, Edit2, X, Check, Calendar, User, Clock, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp, Batch, Classroom } from '../context/AppContext';

export default function Classrooms() {
  const { classrooms, addClassroom, deleteClassroom, batches, addBatch, updateBatch, teachers, setEditBatchId, userRole } = useApp();
  const navigate = useNavigate();
  
  const canEdit = userRole === 'admin';
  
  const handleEditBatch = (id: string) => {
    setEditBatchId(id);
    navigate('/batches');
  };
  
  // Modal States
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Form States
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [roomName, setRoomName] = useState('');

  const [targetRoomId, setTargetRoomId] = useState<string>('');
  const { courses } = useApp();
  const [batchData, setBatchData] = useState<Omit<Batch, 'id'>>({
    code: '',
    title: '',
    trainer: '',
    classroomId: '',
    startTime: '09:00',
    endTime: '11:00',
    day: 'Monday',
    startDate: new Date().toISOString().split('T')[0],
    type: 'Weekday',
    status: 'Active'
  });

  const formatTime12 = (time24: string) => {
    const [hours, mins] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName) {
      if (editingRoom) {
        addClassroom(roomName); 
        if (editingRoom) deleteClassroom(editingRoom.id);
      } else {
        addClassroom(roomName);
      }
      closeRoomModal();
    }
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBatch({ ...batchData, classroomId: targetRoomId });
    setIsBatchModalOpen(false);
  };

  const openRoomModal = (room?: Classroom) => {
    if (room) {
      setEditingRoom(room);
      setRoomName(room.name);
    } else {
      setEditingRoom(null);
      setRoomName('');
    }
    setIsRoomModalOpen(true);
    setActiveMenu(null);
  };

  const closeRoomModal = () => {
    setIsRoomModalOpen(false);
    setEditingRoom(null);
  };

  const openBatchModal = (roomId: string) => {
    setTargetRoomId(roomId);
    setBatchData({
      code: '',
      title: '',
      trainer: '',
      classroomId: roomId,
      startTime: '09:00',
      endTime: '11:00',
      day: 'Monday',
      startDate: new Date().toISOString().split('T')[0],
      type: 'Weekday',
      status: 'Active'
    });
    setIsBatchModalOpen(true);
    setActiveMenu(null);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div>
          <span className="text-label text-secondary block mb-2">Campus Infrastructure</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Classroom Inventory</h2>
        </div>
        <button 
          onClick={() => openRoomModal()}
          disabled={!canEdit}
          className={cn(
            "px-6 py-3 bg-secondary text-white font-semibold rounded-md shadow-sm transition-opacity flex items-center gap-2",
            !canEdit ? "opacity-30 cursor-not-allowed" : "hover:opacity-90"
          )}
        >
          <Plus size={18} />
          Create Classroom
        </button>
      </section>

      {/* Classroom Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {classrooms.map((room, i) => {
          const roomBatches = batches.filter(b => b.classroomId === room.id);
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest p-5 rounded-lg shadow-sm border border-outline-variant/10 group hover:border-secondary transition-all relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-primary-container group-hover:bg-secondary group-hover:text-white transition-colors">
                  <School size={20} />
                </div>
                
                <div className="relative">
                  {canEdit ? (
                    <>
                      <button 
                        onClick={() => setActiveMenu(activeMenu === room.id ? null : room.id)}
                        className="p-2 text-outline hover:text-primary-container transition-colors"
                      >
                        <MoreVertical size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === room.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 z-20 overflow-hidden"
                            >
                              <button 
                                onClick={() => openRoomModal(room)}
                                className="w-full px-4 py-3 text-left text-xs font-bold text-primary-container hover:bg-surface-container-low flex items-center gap-2"
                              >
                                <Edit2 size={14} /> Edit Room
                              </button>
                              {roomBatches.filter(b => b.status === 'Active')[0] && (
                                <button 
                                  onClick={() => handleEditBatch(roomBatches.filter(b => b.status === 'Active')[0].id)}
                                  className="w-full px-4 py-3 text-left text-xs font-bold text-primary-container hover:bg-surface-container-low flex items-center gap-2 border-t border-outline-variant/10"
                                >
                                  <Layers size={14} /> Edit Active Batch
                                </button>
                              )}
                              <button 
                                onClick={() => openBatchModal(room.id)}
                                className="w-full px-4 py-3 text-left text-xs font-bold text-primary-container hover:bg-surface-container-low flex items-center gap-2"
                              >
                                <Plus size={14} /> Add Batch
                              </button>
                              <button 
                                onClick={() => deleteClassroom(room.id)}
                                className="w-full px-4 py-3 text-left text-xs font-bold text-secondary hover:bg-secondary/5 flex items-center gap-2 border-t border-outline-variant/10"
                              >
                                <Trash2 size={14} /> Delete Room
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="p-2 text-outline/20 cursor-not-allowed">
                       <MoreVertical size={20} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-primary-container">{room.name}</h3>
                </div>

                {/* Current & Future Batches */}
                <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2 block">Current Allocation</span>
                    {roomBatches.filter(b => b.status === 'Active').length > 0 ? (
                      roomBatches.filter(b => b.status === 'Active').slice(0, 1).map(batch => (
                        <div key={batch.id} className="bg-surface-container-low p-2 rounded border-l-2 border-secondary relative group/batchitem">
                          <p className="text-xs font-black text-primary-container pr-6">{batch.title}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-outline font-bold uppercase">{batch.trainer}</span>
                            <span className="text-[10px] font-black text-primary-container">{formatTime12(batch.startTime)}</span>
                          </div>
                          <button 
                            onClick={() => handleEditBatch(batch.id)}
                            className="absolute top-2 right-2 p-1 text-outline hover:text-secondary opacity-0 group-hover/batchitem:opacity-100 transition-opacity"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-outline italic">No active batch</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-container mb-2 block">Future Pipeline</span>
                    {roomBatches.filter(b => b.status === 'Future').length > 0 ? (
                      <div className="space-y-2">
                        {roomBatches.filter(b => b.status === 'Future').slice(0, 2).map(batch => (
                          <div key={batch.id} className="flex justify-between items-center text-[10px] group/futureitem">
                            <div className="flex flex-col">
                              <span className="text-primary-container font-black pr-4">{batch.title}</span>
                              <span className="text-outline font-bold uppercase">{batch.trainer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-outline font-bold">{batch.startDate}</span>
                              <button 
                                onClick={() => handleEditBatch(batch.id)}
                                className="p-1 text-outline hover:text-secondary opacity-0 group-hover/futureitem:opacity-100 transition-opacity"
                              >
                                <Edit2 size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-outline italic">No future batches</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-outline" />
                  <span className="text-xs font-bold text-primary-container">{roomBatches.length} Total Batches</span>
                </div>
                <button 
                  onClick={() => navigate('/batches')}
                  className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:underline"
                >
                  Manage All
                </button>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Create/Edit Room Modal */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRoomModal}
              className="absolute inset-0 bg-primary-container/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <h3 className="text-2xl font-bold text-primary-container mb-6">
                {editingRoom ? 'Edit Classroom' : 'New Classroom'}
              </h3>
              <form onSubmit={handleRoomSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-label text-outline block">Classroom Name</label>
                  <input 
                    autoFocus
                    className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                    placeholder="e.g. Room 102, Lab C"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={closeRoomModal}
                    className="flex-1 py-3 text-sm font-bold text-outline hover:bg-surface-container-low rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-secondary text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity shadow-lg"
                  >
                    {editingRoom ? 'Save Changes' : 'Create Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Add Batch Modal */}
      <AnimatePresence>
        {isBatchModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBatchModalOpen(false)}
              className="absolute inset-0 bg-primary-container/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <h3 className="text-2xl font-bold text-primary-container mb-8">
                Add Batch to {classrooms.find(r => r.id === targetRoomId)?.name}
              </h3>
              
              <form onSubmit={handleBatchSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Subject Selection</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={batchData.title}
                      onChange={(e) => {
                        const course = courses.find(c => c.name === e.target.value);
                        setBatchData({ ...batchData, title: e.target.value, code: course?.code || '' });
                      }}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Batch Code</label>
                    <input 
                      disabled
                      className="w-full px-4 py-3 bg-surface-container-high/50 rounded-md border-none text-primary-container font-black uppercase tracking-widest cursor-not-allowed"
                      value={batchData.code}
                      placeholder="Auto-filled from course"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Trainer Name</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={batchData.trainer}
                      onChange={(e) => setBatchData({ ...batchData, trainer: e.target.value })}
                      required
                    >
                      <option value="">Select Trainer</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Start Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={batchData.startTime}
                      onChange={(e) => setBatchData({ ...batchData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">End Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={batchData.endTime}
                      onChange={(e) => setBatchData({ ...batchData, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={batchData.status}
                      onChange={(e) => setBatchData({ ...batchData, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Demo">Demo Class</option>
                      <option value="Future">Future Batch</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsBatchModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-outline hover:bg-surface-container-low rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-secondary text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity shadow-lg"
                  >
                    Add Batch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
