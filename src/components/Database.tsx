import React from 'react';
import { Database, Server, ShieldCheck, Terminal, RefreshCw, HardDrive, Cpu, Activity, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

const dbMetrics = [
  { label: 'Uptime', value: '99.99%', icon: Activity },
  { label: 'Latency', value: '12ms', icon: Cpu },
  { label: 'Storage', value: '1.2GB / 10GB', icon: HardDrive },
];

const tables = [
  { name: 'users', rows: 28, size: '42KB', status: 'Active' },
  { name: 'classrooms', rows: 42, size: '12KB', status: 'Active' },
  { name: 'teachers', rows: 156, size: '84KB', status: 'Active' },
  { name: 'batches', rows: 112, size: '124KB', status: 'Active' },
];

export default function DatabaseView() {
  const { userRole } = useApp();

  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <ShieldAlert size={48} className="text-secondary mb-4" />
        <h2 className="text-2xl font-bold text-primary-container">Access Denied</h2>
        <p className="text-on-surface-variant">Infrastructure management is restricted to administrative personnel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <section className="flex justify-between items-end">
        <div>
          <span className="text-label text-secondary block mb-2">Infrastructure Management</span>
          <h2 className="text-5xl font-extrabold tracking-tighter text-primary-container leading-none">Database Architecture</h2>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-surface-container-lowest text-primary-container font-semibold rounded-md shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-colors flex items-center gap-2">
            <RefreshCw size={18} />
            Sync Schema
          </button>
          <button className="px-6 py-3 bg-secondary text-white font-semibold rounded-md shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2">
            <Terminal size={18} />
            SQL Console
          </button>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dbMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10"
          >
            <div className="flex justify-between items-start mb-6">
              <metric.icon size={20} className="text-on-primary-container/40" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-secondary">Optimal</span>
            </div>
            <p className="text-[0.7rem] uppercase tracking-widest font-semibold mb-1 text-outline">{metric.label}</p>
            <h3 className="text-4xl font-extrabold tracking-tighter text-primary-container">{metric.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Connection Status Card */}
      <section className="bg-primary-container text-white rounded-xl p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <Server size={32} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight">PostgreSQL Monolith</h3>
              <p className="text-on-primary-container text-sm mt-1">Connected to: <code className="bg-white/10 px-2 py-0.5 rounded">db.executive-editorial.internal</code></p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full border border-white/20">
            <ShieldCheck size={20} className="text-secondary" />
            <span className="text-sm font-bold tracking-wider uppercase">SSL Encryption Active</span>
          </div>
        </div>
      </section>

      {/* Tables & Schema */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold tracking-tight text-primary-container">Relational Tables</h4>
            <button className="text-xs font-bold uppercase tracking-widest text-secondary hover:underline">Manage Tables</button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-[0.65rem] uppercase tracking-widest text-outline">
                  <th className="px-8 py-4 font-bold">Table Name</th>
                  <th className="px-8 py-4 font-bold">Rows</th>
                  <th className="px-8 py-4 font-bold">Storage</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {tables.map((table) => (
                  <tr key={table.name} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-3">
                      <Database size={16} className="text-on-primary-container/40 group-hover:text-secondary transition-colors" />
                      <span className="font-bold text-primary-container">{table.name}</span>
                    </td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">{table.rows}</td>
                    <td className="px-8 py-5 text-sm text-on-surface-variant">{table.size}</td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded uppercase tracking-tighter">
                        {table.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-8">
          <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 space-y-6">
            <h4 className="text-label text-outline">Database Setup Command</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              To initialize the local database schema for the ClassCordinator monolith, run the following command in your terminal:
            </p>
            <div className="bg-primary-container p-4 rounded-md relative group">
              <code className="text-white text-xs font-mono break-all">
                npx class-coord-cli init --db postgres --schema monolith-v1
              </code>
              <button className="absolute top-2 right-2 p-1 text-white/40 hover:text-white transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-xs text-on-surface-variant">Configure your <code className="bg-surface-container-high px-1 rounded">.env</code> with database credentials.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-xs text-on-surface-variant">Run the migration command above to build the schema.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                <p className="text-xs text-on-surface-variant">Restart the server to apply the architectural changes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
