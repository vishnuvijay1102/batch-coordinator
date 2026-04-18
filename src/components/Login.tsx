import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, User, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-12 min-h-screen bg-surface dark:bg-[#0a0b0e]">
      <div className="w-full max-w-[440px] z-10 flex flex-col items-center">
        {/* Brand Anchor */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-[2.5rem] leading-none font-black tracking-tighter text-black dark:text-white mb-2 uppercase italic">
            Batch Cordinator
          </h1>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-surface-container-lowest dark:bg-[#0d1117] ambient-shadow rounded-2xl overflow-hidden border border-outline-variant/30"
        >
          <div className="p-8 md:p-10">
            <h2 className="text-xl font-bold mb-8 text-black dark:text-white flex items-center gap-2">
              <Lock size={20} className="text-secondary" />
              Portal Access
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input Group */}
              <div className="space-y-2">
                <label className="text-label text-black dark:text-white/60 block" htmlFor="username">
                  email or username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 dark:text-white/40 group-focus-within:text-secondary transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 bg-surface-container-high dark:bg-[#1c2128] border-none rounded-xl focus:ring-2 focus:ring-secondary/20 transition-all text-black dark:text-white placeholder:text-white/100",
                      error && "ring-2 ring-secondary"
                    )}
                    id="username" 
                    name="username" 
                    placeholder="Username" 
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(false);
                    }}
                  />
                </div>
              </div>

              {/* Password Input Group */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-label text-black dark:text-white/60 block" htmlFor="password">
                    password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-black/40 dark:text-white/40 group-focus-within:text-secondary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    className={cn(
                      "w-full pl-11 pr-4 py-3.5 bg-surface-container-high dark:bg-[#1c2128] border-none rounded-xl focus:ring-2 focus:ring-secondary/20 transition-all text-black dark:text-white placeholder:text-white/100",
                      error && "ring-2 ring-secondary"
                    )}
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-secondary/10 p-4 rounded-xl flex items-center gap-3 text-secondary text-xs font-bold ring-1 ring-secondary/20"
                >
                  <AlertCircle size={16} />
                  Invalid username or password. Check credentials.
                </motion.div>
              )}

              {/* Login Button */}
              <div className="pt-2">
                <button 
                  className="w-full py-4 bg-secondary text-black dark:text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2" 
                  type="submit"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
          © 2024 Batch Cordinators
        </p>
      </div>
    </main>
  );
}
