import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, MoreVertical, Trash2, Edit2, Calendar, User, BookOpen, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, Batch } from '../context/AppContext';

export default function Batches() {
  const { batches, classrooms, teachers, courses, addBatch, updateBatch, deleteBatch, closeBatch, editBatchId, setEditBatchId, userRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const canEdit = userRole === 'admin';

  // Cross-component Edit Trigger
  useEffect(() => {
    if (editBatchId) {
      const batchToEdit = batches.find(b => b.id === editBatchId);
      if (batchToEdit) {
        openModal(batchToEdit);
        setEditBatchId(null); // Reset after opening
      }
    }
  }, [editBatchId, batches]);

  // Handle URL params for direct links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlEditId = params.get('edit');
    if (urlEditId) {
      const batchToEdit = batches.find(b => b.id === urlEditId);
      if (batchToEdit) {
        openModal(batchToEdit);
      }
    }
  }, [batches]);

  const [formData, setFormData] = useState<Omit<Batch, 'id'>>({
    code: '',
    title: '',
    trainer: '',
    classroomId: classrooms[0]?.id || '',
    startTime: '09:00',
    endTime: '11:00',
    day: 'Monday',
    startDate: new Date().toISOString().split('T')[0],
    type: 'Weekday',
    status: 'Active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBatch) {
      updateBatch(editingBatch.id, formData);
    } else {
      addBatch(formData);
    }
    closeModal();
  };

  const openModal = (batch?: Batch) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({ ...batch });
    } else {
      setEditingBatch(null);
      setFormData({
        code: '',
        title: '',
        trainer: '',
        classroomId: classrooms[0]?.id || '',
        startTime: '09:00',
        endTime: '11:00',
        day: 'Monday',
        startDate: new Date().toISOString().split('T')[0],
        type: 'Weekday',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
  };

  const filteredBatches = batches.filter(b => 
    (b?.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (b?.code || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (b?.trainer || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-label text-secondary block mb-2">Academic Management</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Batch Registry</h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text"
              placeholder="Search batches..."
              className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest rounded-md border border-outline-variant/10 focus:ring-2 focus:ring-secondary text-sm"
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
              Add Batch
            </button>
          )}
        </div>
      </section>

      {/* Batch List */}
      <section className="space-y-12">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary-container border-b-2 border-secondary inline-block pb-1">Running Batches</h3>
          <div className="grid grid-cols-1 gap-4">
            {filteredBatches.filter(b => b.status !== 'Closed').length === 0 ? (
              <div className="bg-surface-container-lowest p-10 rounded-xl border border-dashed border-outline-variant/30 text-center italic text-outline text-sm">
                No active batches found matching your criteria.
              </div>
            ) : (
              filteredBatches.filter(b => b.status !== 'Closed').map((batch, i) => (
                <BatchCard 
                  key={batch.id} 
                  batch={batch} 
                  classrooms={classrooms}
                  index={i}
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  openModal={openModal}
                  closeBatch={closeBatch}
                  deleteBatch={deleteBatch}
                  canEdit={canEdit}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-4 pt-8 opacity-80">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-outline border-b-2 border-outline-variant inline-block pb-1">Closed Batches Archive</h3>
            <span className="bg-surface-container-highest px-2 py-0.5 rounded text-[10px] font-bold text-outline">History</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBatches.filter(b => b.status === 'Closed').length === 0 ? (
              <div className="col-span-full bg-surface-container-low/30 p-10 rounded-xl border border-dashed border-outline-variant/20 text-center italic text-outline text-xs">
                Archive is empty. Completed batches will appear here.
              </div>
            ) : (
              filteredBatches.filter(b => b.status === 'Closed').map((batch, i) => (
                <BatchCard 
                  key={batch.id} 
                  batch={batch} 
                  classrooms={classrooms}
                  index={i}
                  setActiveMenu={setActiveMenu}
                  activeMenu={activeMenu}
                  openModal={openModal}
                  closeBatch={closeBatch}
                  deleteBatch={deleteBatch}
                  canEdit={canEdit}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
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
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Course Selection</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.title}
                      onChange={(e) => {
                        const course = courses.find(c => c.name === e.target.value);
                        setFormData({ ...formData, title: e.target.value, code: course?.code || '' });
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
                      value={formData.code}
                      placeholder="Auto-filled from course"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Trainer Name</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.trainer}
                      onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                      required
                    >
                      <option value="">Select Trainer</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Classroom</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.classroomId}
                      onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    >
                      {classrooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Start Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">End Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Start Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Weekday / Weekend</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="Weekday">Weekday Batch</option>
                      <option value="Weekend">Weekend Batch</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Demo">Demo Class</option>
                      <option value="Future">Future Batch</option>
                      <option value="Closed">Closed Batch</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Primary Day</label>
                    <select 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 text-sm font-bold text-outline hover:bg-surface-container-low rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-secondary text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity shadow-lg"
                  >
                    {editingBatch ? 'Save Changes' : 'Create Batch'}
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

function BatchCard({ batch, classrooms, index, setActiveMenu, activeMenu, openModal, closeBatch, deleteBatch, canEdit }: any) {
  const room = classrooms.find((r: any) => r.id === batch.classroomId);
  const isClosed = batch.status === 'Closed';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group transition-all",
        isClosed ? "border-outline-variant bg-surface-container-low grayscale" : "hover:border-secondary"
      )}
    >
      <div className="flex items-center gap-6 flex-1">
        <div className={cn(
          "w-14 h-14 rounded-lg flex items-center justify-center transition-colors shrink-0",
          isClosed ? "bg-surface-container-highest text-outline" : "bg-surface-container-low text-primary-container group-hover:bg-secondary group-hover:text-white"
        )}>
          <Layers size={24} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1 block">{batch.code}</span>
            <h3 className="text-lg font-bold text-primary-container">{batch.title}</h3>
            <div className="flex items-center gap-2 text-outline text-xs mt-1">
              <User size={12} />
              {batch.trainer}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary-container text-sm font-semibold text-wrap">
              <Clock size={14} />
              {batch.startTime} - {batch.endTime}
            </div>
            <div className="flex items-center gap-2 text-outline text-xs">
              <Calendar size={12} />
              {batch.day} • {batch.type}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary-container text-sm font-semibold">
              <MapPin size={14} />
              {room?.name || 'Unassigned'}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded inline-block",
              batch.status === 'Active' ? 'bg-secondary/10 text-secondary' : 
              batch.status === 'Demo' ? 'bg-green-100 text-green-700' : 
              batch.status === 'Closed' ? 'bg-surface-container-highest text-outline' :
              'bg-blue-100 text-blue-700'
            )}>
              {batch.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/10 relative">
        {canEdit ? (
          <>
            <button 
              onClick={() => setActiveMenu(activeMenu === batch.id ? null : batch.id)}
              className="p-2 text-outline hover:text-primary-container transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            <AnimatePresence>
              {activeMenu === batch.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 z-20 overflow-hidden"
                  >
                    {!isClosed && (
                      <button 
                        onClick={() => openModal(batch)}
                        className="w-full px-4 py-3 text-left text-xs font-bold text-primary-container hover:bg-surface-container-low flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Edit Batch
                      </button>
                    )}
                    
                    {!isClosed ? (
                      <button 
                        onClick={() => closeBatch(batch.id)}
                        className="w-full px-4 py-3 text-left text-xs font-bold text-secondary hover:bg-secondary/5 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Close Batch
                      </button>
                    ) : (
                      <button 
                        onClick={() => deleteBatch(batch.id)}
                        className="w-full px-4 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Permanent Delete
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="p-2 text-outline/20">
             <MoreVertical size={20} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
