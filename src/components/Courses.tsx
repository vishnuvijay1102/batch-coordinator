import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit2, BookOpen, Layers, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, Course } from '../context/AppContext';

export default function Courses() {
  const { courses, addCourse, updateCourse, deleteCourse, userRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const canEdit = userRole === 'admin';

  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    name: '',
    code: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateCourse(editingCourse.id, formData.name, formData.code);
    } else {
      addCourse(formData.name, formData.code);
    }
    closeModal();
  };

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({ name: course.name, code: course.code });
    } else {
      setEditingCourse(null);
      setFormData({ name: '', code: '' });
    }
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const filteredCourses = courses.filter(c => 
    (c?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (c?.code || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-label text-secondary block mb-2">Curriculum Management</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Course Catalog</h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text"
              placeholder="Search courses..."
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
              Define Course
            </button>
          )}
        </div>
      </section>

      {/* Course List */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full bg-surface-container-lowest p-20 rounded-xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
             <BookOpen size={48} className="text-outline/20 mb-4" />
             <p className="text-primary-container font-black uppercase tracking-widest text-sm">No Courses Defined</p>
             <p className="text-outline text-xs mt-1">Populate the catalog to enable student registration.</p>
          </div>
        ) : (
          filteredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 group hover:border-secondary transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:bg-secondary/10 transition-colors"></div>
              
              <div className="relative">
                <div className="w-12 h-12 bg-surface-container-low rounded-lg flex items-center justify-center text-primary-container group-hover:bg-secondary group-hover:text-white transition-colors mb-6 shadow-sm">
                  <Layers size={20} />
                </div>
                
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2 block">{course.code}</span>
                <h3 className="text-xl font-bold text-primary-container leading-tight mb-4">{course.name}</h3>
                
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                   <div className="flex items-center gap-2 text-outline text-xs font-bold uppercase tracking-widest">
                      <BookOpen size={14} />
                      Curriculum v1.0
                   </div>
                   <div className="flex items-center gap-1 relative">
                    {canEdit ? (
                      <>
                        <button 
                          onClick={() => setActiveMenu(activeMenu === course.id ? null : course.id)}
                          className="p-1.5 text-outline hover:text-primary-container transition-colors rounded-full hover:bg-surface-container-low"
                        >
                          <MoreVertical size={16} />
                        </button>

                        <AnimatePresence>
                          {activeMenu === course.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 bottom-full mb-2 w-48 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 z-20 overflow-hidden"
                              >
                                <button 
                                  onClick={() => openModal(course)}
                                  className="w-full px-4 py-3 text-left text-xs font-bold text-primary-container hover:bg-surface-container-low flex items-center gap-2"
                                >
                                  <Edit2 size={14} /> Edit Course
                                </button>
                                <button 
                                  onClick={() => deleteCourse(course.id)}
                                  className="w-full px-4 py-3 text-left text-xs font-bold text-secondary hover:bg-secondary/5 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete Course
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <div className="p-1.5 text-outline/20">
                         <MoreVertical size={16} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl p-8"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <h3 className="text-2xl font-bold text-primary-container mb-8">
                {editingCourse ? 'Update Course Definition' : 'Define New Course'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Course Name</label>
                    <input 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      placeholder="e.g. Full Stack Web Development"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Course Code</label>
                    <input 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium uppercase tracking-widest"
                      placeholder="e.g. FSWD-2026"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                    />
                    <p className="text-[10px] text-outline italic">This code will be used as a prefix for batch identifiers.</p>
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
                    {editingCourse ? 'Save Changes' : 'Register Course'}
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
