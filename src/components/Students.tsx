import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Trash2, Edit2, User, Phone, BookOpen, CreditCard, Calendar, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp, Student } from '../context/AppContext';

export default function Students() {
  const { students, courses, addStudent, updateStudent, deleteStudent, userRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    phone: '',
    course: '',
    paymentStatus: 'Not Paid',
    promiseDate: ''
  });

  const canEdit = userRole === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      addStudent(formData);
    }
    closeModal();
  };

  const openModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({ ...student });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        phone: '',
        course: courses[0]?.name || '',
        paymentStatus: 'Not Paid',
        promiseDate: ''
      });
    }
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const filteredStudents = students.filter(s => 
    (s?.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (s?.phone || '').includes(searchQuery || '') ||
    (s?.course || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-label text-secondary block mb-2">Student Management</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Student Details</h2>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
            <input 
              type="text"
              placeholder="Search students..."
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
              Add Student
            </button>
          )}
        </div>
      </section>

      {/* Student List */}
      <section className="grid grid-cols-1 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-surface-container-lowest p-20 rounded-xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
             <User size={48} className="text-outline/20 mb-4" />
             <p className="text-primary-container font-black uppercase tracking-widest text-sm">No Students Registered</p>
             <p className="text-outline text-xs mt-1">Begin by adding a new student to the database.</p>
          </div>
        ) : (
          filteredStudents.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-secondary transition-all"
            >
              <div className="flex items-center gap-6 flex-1 w-full">
                <div className="w-14 h-14 bg-surface-container-low rounded-lg flex items-center justify-center text-primary-container group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
                  <User size={24} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
                  <div>
                    <h3 className="text-lg font-bold text-primary-container">{student.name}</h3>
                    <div className="flex items-center gap-2 text-outline text-xs mt-1">
                      <Phone size={12} />
                      {student.phone}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-outline mb-1 block">Course</span>
                    <div className="flex items-center gap-2 text-primary-container text-sm font-semibold">
                      <BookOpen size={14} />
                      {student.course}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-outline mb-1 block">Payment Status</span>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                         student.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 
                         student.paymentStatus === 'Partially Paid' ? 'bg-orange-100 text-orange-700' :
                         'bg-red-100 text-red-700'
                       )}>
                         {student.paymentStatus}
                       </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-outline mb-1 block">Promise Date</span>
                    <div className="flex items-center gap-2 text-primary-container text-xs font-bold font-mono">
                       <Calendar size={12} />
                       {student.promiseDate || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 relative">
                {canEdit ? (
                  <>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === student.id ? null : student.id)}
                      className="p-2 text-outline hover:text-primary-container transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                      {activeMenu === student.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant/20 z-20 overflow-hidden"
                          >
                            <button 
                              onClick={() => openModal(student)}
                              className="w-full px-4 py-3 text-left text-xs font-bold text-primary-container hover:bg-surface-container-low flex items-center gap-2"
                            >
                              <Edit2 size={14} /> Edit Student
                            </button>
                            <button 
                              onClick={() => deleteStudent(student.id)}
                              className="w-full px-4 py-3 text-left text-xs font-bold text-secondary hover:bg-secondary/5 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Student
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="p-2 text-outline/30 cursor-not-allowed">
                    <MoreVertical size={20} />
                  </div>
                )}
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
              className="relative w-full max-w-xl bg-surface-container-lowest rounded-xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <h3 className="text-2xl font-bold text-primary-container mb-8">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-label text-outline block">Student Name</label>
                    <input 
                      className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                      placeholder="e.g. Johnathan Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-label text-outline block">Phone Number</label>
                      <input 
                        type="tel"
                        className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-label text-outline block">Course Selection</label>
                      <select 
                        className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-medium"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                    <label className="text-label text-outline block mb-4">Payment Status</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Paid', 'Partially Paid', 'Not Paid'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentStatus: status })}
                          className={cn(
                            "py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                            formData.paymentStatus === status 
                              ? "bg-secondary text-white border-secondary shadow-md" 
                              : "bg-surface-container-low text-outline border-transparent hover:border-outline-variant"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {(formData.paymentStatus !== 'Paid') && (
                      <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest block">Follow-up Promise Date</label>
                        <input 
                          type="date"
                          className="w-full px-4 py-3 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary text-primary-container font-mono text-sm"
                          value={formData.promiseDate}
                          onChange={(e) => setFormData({ ...formData, promiseDate: e.target.value })}
                        />
                      </div>
                    )}
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
                    {editingStudent ? 'Update Details' : 'Complete Registration'}
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
