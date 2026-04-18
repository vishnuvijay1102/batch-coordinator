import React, { useState } from 'react';
import { Users, Plus, Search, Trash2, Edit2, User, BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, Teacher } from '../context/AppContext';

export default function Teachers() {
  const { teachers, addTeacher, deleteTeacher, updateTeacher, userRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canEdit = userRole === 'admin';

  const [name, setName] = useState('');
  const [handling, setHandling] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher(editingTeacher.id, name, handling);
    } else {
      addTeacher(name, handling);
    }
    closeModal();
  };

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setName(teacher.name);
      setHandling(teacher.handling);
    } else {
      setEditingTeacher(null);
      setName('');
      setHandling('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.handling.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-label text-secondary block mb-2">Faculty Management</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Trainer Registry</h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text"
              placeholder="Search trainers..."
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
              Add Trainer
            </button>
          )}
        </div>
      </section>

      {/* Trainer Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher, i) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 group hover:border-secondary transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-surface-container-low rounded-lg flex items-center justify-center text-primary-container group-hover:bg-secondary group-hover:text-white transition-colors">
                <User size={28} />
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <>
                    <button 
                      onClick={() => openModal(teacher)}
                      className="p-2 text-outline hover:text-primary-container hover:bg-surface-container-low rounded-md transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteTeacher(teacher.id)}
                      className="p-2 text-outline hover:text-secondary hover:bg-secondary/10 rounded-md transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-primary-container">{teacher.name}</h3>
                <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Lead Trainer</p>
              </div>

              <div className="pt-4 border-t border-outline-variant/10">
                <div className="flex items-start gap-3">
                  <BookOpen size={16} className="text-outline mt-1 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Handling Modules</p>
                    <p className="text-sm text-primary-container font-medium leading-relaxed">
                      {teacher.handling}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
              className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <h3 className="text-2xl font-bold text-primary-container mb-8">
                {editingTeacher ? 'Edit Trainer' : 'Add New Trainer'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-label text-outline block">Trainer Full Name</label>
                  <input 
                    autoFocus
                    className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                    placeholder="e.g. Dr. Sarah Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-label text-outline block">Modules Handling</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium min-h-[100px]"
                    placeholder="e.g. Advanced Algorithms, Data Science, Python"
                    value={handling}
                    onChange={(e) => setHandling(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
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
                    {editingTeacher ? 'Save Changes' : 'Add Trainer'}
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
