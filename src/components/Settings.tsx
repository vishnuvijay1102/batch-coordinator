import React, { useState } from 'react';
import { UserPlus, Shield, Trash2, ShieldAlert, Check, X, Users, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, UserAccount } from '../context/AppContext';
import { cn } from '@/src/lib/utils';

export default function Settings() {
  const { users, addUser, deleteUser, updateUserRole, currentUser, userRole } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');

  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ShieldAlert size={48} className="text-secondary mb-4" />
        <h2 className="text-2xl font-bold text-primary-container">Access Denied</h2>
        <p className="text-on-surface-variant">Only administrators can access the settings page.</p>
      </div>
    );
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      addUser({ username, password, role });
      setUsername('');
      setPassword('');
      setRole('viewer');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary-container">System Settings</h1>
          <p className="text-on-surface-variant">Manage user accounts and system permissions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-white font-bold rounded-md ambient-shadow hover:opacity-90 active:scale-95 transition-all"
        >
          <UserPlus size={20} />
          Create New User
        </button>
      </div>

      {/* User Management Section */}
      <section className="bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border border-outline-variant/10">
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/10 flex items-center gap-2">
          <Users size={20} className="text-primary-container" />
          <h2 className="font-bold text-primary-container">User Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-outline">User Info</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-outline">Role</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-outline">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container font-black">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-primary-container flex items-center gap-2">
                          {user.username}
                          {currentUser?.id === user.id && (
                            <span className="text-[10px] bg-primary-container/10 text-primary px-2 py-0.5 rounded-full uppercase">You</span>
                          )}
                        </div>
                        <div className="text-xs text-outline tabular-nums flex items-center gap-1">
                          <Key size={10} /> {user.password.replace(/./g, '•')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      user.role === 'admin' 
                        ? "bg-secondary/10 text-secondary" 
                        : "bg-primary-container/10 text-primary-container"
                    )}>
                      <Shield size={12} />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {user.role === 'viewer' ? (
                        <button
                          onClick={() => updateUserRole(user.id, 'admin')}
                          className="p-2 text-outline hover:text-secondary hover:bg-secondary/5 rounded transition-all"
                          title="Promote to Admin"
                        >
                          <Shield size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserRole(user.id, 'viewer')}
                          className="p-2 text-outline hover:text-primary-container hover:bg-primary-container/5 rounded transition-all"
                          title="Demote to Viewer"
                        >
                          <Users size={18} />
                        </button>
                      )}
                      
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-surface-container-lowest rounded-xl ambient-shadow overflow-hidden border-t-4 border-secondary"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-primary-container">New User Account</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-primary-container transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-outline">Username</label>
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-outline">Password</label>
                    <input
                      required
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-secondary transition-all"
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-outline">Access Role</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('viewer')}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-md border-2 font-bold transition-all flex items-center justify-center gap-2",
                          role === 'viewer' 
                            ? "border-secondary bg-secondary/5 text-secondary" 
                            : "border-outline-variant text-outline hover:border-outline"
                        )}
                      >
                        <Users size={18} />
                        Viewer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-md border-2 font-bold transition-all flex items-center justify-center gap-2",
                          role === 'admin' 
                            ? "border-secondary bg-secondary/5 text-secondary" 
                            : "border-outline-variant text-outline hover:border-outline"
                        )}
                      >
                        <Shield size={18} />
                        Admin
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 font-bold text-outline hover:bg-surface-container-low rounded-md transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-secondary text-white font-bold rounded-md ambient-shadow hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      Create Account
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
