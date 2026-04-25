import React, { useState } from 'react';
import { Cpu, Activity, Zap, CheckCircle2, AlertTriangle, TrendingUp, Boxes, Settings, ArrowUpRight, BarChart3, MoreVertical, X, Shield, Download, RefreshCw, Layers, Target, Gauge } from 'lucide-react';
import { ManufacturingJob } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface ManufacturingPulseProps {
  jobs: ManufacturingJob[];
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const ManufacturingPulse: React.FC<ManufacturingPulseProps> = ({ jobs, onAction }) => {
  const [showEfficiencyReport, setShowEfficiencyReport] = React.useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = React.useState(false);
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingJob, setEditingJob] = useState<Partial<ManufacturingJob> | null>(null);

  const handleSaveConfig = async () => {
    if (!editingJob || !auth.currentUser) return;
    setIsSaving(true);
    try {
      const jobId = editingJob.id || `JOB-${Math.floor(Math.random() * 1000)}`;
      const jobData = {
        ...editingJob,
        id: jobId,
        clientId: auth.currentUser.uid,
      };
      await setDoc(doc(db, 'manufacturing', jobId), jobData, { merge: true });
      onAction?.(`Asset Configuration Saved: Job ${jobId} parameters updated.`, 'success');
      setShowConfigModal(false);
    } catch (error) {
      console.error(error);
      onAction?.("Configuration Failure: Encryption handshake failed with factory node.", 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Network Efficiency', value: '94.2%', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Lines', value: '18/20', icon: Cpu, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Throughput', value: '14.2k/hr', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Quality Rating', value: '99.98%', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Phase 3: Production</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manufacturing Control</h1>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => {
              setEditingJob({
                id: `JOB-${Math.floor(Math.random() * 1000)}`,
                productName: '',
                quantity: 1000,
                status: 'planning',
                efficiency: 0,
                startDate: new Date().toISOString(),
                targetProductionRate: 50,
                machinesAllocated: 5,
                qualityThreshold: 99.5
              });
              setShowConfigModal(true);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
           >
              <Settings size={16} /> Asset Config
           </button>
           <button 
            onClick={() => {
              onAction?.("Generating Production Analytics: Comprehensive Efficiency Report compiling...");
              setShowEfficiencyReport(true);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
           >
             <BarChart3 size={16} /> Efficiency Report
           </button>
           <button 
            onClick={() => {
              onAction?.("Initiating Logic Layer Deployment: Sequence ALPHA starting across all active lines...");
              setShowDeploymentModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
           >
             <Zap size={16} /> New Deployment
           </button>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((s, i) => (
           <div key={i} className="glass p-6 group hover:border-blue-500/50 transition-all flex items-center justify-between">
              <div>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{s.label}</span>
                 <span className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</span>
              </div>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12", s.bg, s.color)}>
                 <s.icon size={22} />
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Production Pipeline */}
        <div className="lg:col-span-8 glass flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <Boxes className="text-blue-600" size={20} />
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Active Production Queue</h4>
             </div>
             <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> PRODUCTION</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> PLANNING</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> QA CHECK</span>
             </div>
          </div>
          <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
             {jobs.map((job) => (
               <div key={job.id} className="glass p-6 group hover:shadow-md transition-all relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-1">{job.productName}</h5>
                        <p className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-tighter">ID: {job.id}</p>
                     </div>
                     <span className={cn(
                       "px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                       job.status === 'production' ? 'bg-blue-50 text-blue-600' :
                       job.status === 'planning' ? 'bg-orange-50 text-orange-500' :
                       job.status === 'quality-check' ? 'bg-indigo-50 text-indigo-600 animate-pulse' :
                       'bg-emerald-50 text-emerald-600'
                     )}>
                       {job.status.replace('-', ' ')}
                     </span>
                  </div>

                  <div className="mt-auto space-y-4">
                     <div className="flex justify-between text-[11px] items-end font-bold text-slate-500 uppercase tracking-tight">
                        <span>Quantity: {job.quantity.toLocaleString()}</span>
                        <span className="text-blue-600">{job.efficiency}% Efficiency</span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${job.efficiency}%` }}
                          className={cn(
                            "h-full transition-all duration-1000 shadow-sm",
                            job.efficiency < 85 ? 'bg-orange-500' : 'bg-blue-600'
                          )}
                        />
                     </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase border-t border-slate-50 pt-4">
                     <span>Launch: {new Date(job.startDate).toLocaleDateString()}</span>
                     <button 
                      onClick={() => {
                        setEditingJob(job);
                        setShowConfigModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                     >
                       Adjust Plan <ArrowUpRight size={10} />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Neural Monitoring */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass p-6 flex flex-col h-full">
              <header className="mb-8">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Monitoring</h4>
                 <h3 className="text-lg font-bold text-slate-800 tracking-tight">System Performance Line</h3>
              </header>
              
              <div className="flex-1 h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { t: '01', e: 92 }, { t: '02', e: 94 }, { t: '03', e: 91 }, { t: '04', e: 95 }, { t: '05', e: 94 }, { t: '06', e: 96 }, { t: '07', e: 93 }
                    ]}>
                       <defs>
                          <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <Area type="monotone" dataKey="e" stroke="#2563EB" fill="url(#colorPulse)" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: 'white' }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                 <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
                       <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">IIoT Digital Twin Active</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 italic">
                      "Real-time telemetry calibrated across 14,000 nodal sensors. Sub-millisecond latency within factory mesh."
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-widest mb-1">Downtime</span>
                          <span className="text-sm font-black text-slate-900">0.02%</span>
                       </div>
                       <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-widest mb-1">Line Yield</span>
                          <span className="text-sm font-black text-slate-900">99.8%</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass p-6 bg-slate-900 text-white flex justify-between items-center group cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Facility</p>
                 <h4 className="text-lg font-black tracking-tight leading-none group-hover:text-blue-400 transition-colors">Giga-Factory_01 <span className="text-emerald-500 ml-1">●</span></h4>
              </div>
              <Activity size={24} className="text-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />
           </div>
        </div>
      </div>
      <AnimatePresence>
        {showEfficiencyReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEfficiencyReport(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl glass bg-white shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Line Efficiency Audit</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.34em]">Facility 01 - Performance Breakdown Q2</p>
                  </div>
                </div>
                <button onClick={() => setShowEfficiencyReport(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-12 overflow-y-auto bg-slate-50/30">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Overall OEE', value: '92.4%', color: 'text-blue-600', trend: '+1.5%' },
                    { label: 'Quality Yield', value: '99.9%', color: 'text-emerald-600', trend: 'Stable' },
                    { label: 'MTBF', value: '742h', color: 'text-indigo-600', trend: '+12h' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                       <div className="flex items-baseline justify-between">
                         <span className={cn("text-4xl font-black", stat.color)}>{stat.value}</span>
                         <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
                       </div>
                    </div>
                  ))}
                </section>

                <section>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-blue-600" />
                    Throughput Cycle Velocity
                  </h4>
                  <div className="h-[200px] w-full bg-white rounded-[2rem] border border-slate-200 flex items-end justify-between p-10 gap-2">
                    {jobs.map((job, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${job.efficiency}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="flex-1 bg-gradient-to-t from-slate-900 to-blue-600 rounded-t-lg group relative cursor-pointer"
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                           LINE {i+1}: {job.efficiency}%
                         </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                <div className="space-y-6">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Live Fault Detection Matrix</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       { node: 'M-7 Sensor', error: 'Calibration Float', status: 'critical', impact: 'High' },
                       { node: 'Logic Node B', error: 'Packet Dropped', status: 'minor', impact: 'Low' },
                       { node: 'Thermal Grid', error: 'Steady State', status: 'normal', impact: 'None' },
                       { node: 'Pneumatic 4', error: 'Seal Wear', status: 'warning', impact: 'Med' },
                     ].map((fault, i) => (
                       <div key={i} className="flex bg-white border border-slate-200 p-4 rounded-2xl items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              fault.status === 'critical' ? 'bg-red-500 animate-ping' : 
                              fault.status === 'warning' ? 'bg-orange-500' :
                              fault.status === 'minor' ? 'bg-blue-500' : 'bg-emerald-500'
                            )} />
                            <div>
                               <p className="text-[11px] font-black text-slate-900">{fault.node}</p>
                               <p className="text-[10px] font-bold text-slate-400">{fault.error}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Impact: {fault.impact}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-border mt-auto flex justify-end gap-4">
                 <button className="px-8 py-3 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                   <Download size={14} /> Efficiency Report PDF
                 </button>
                 <button 
                  onClick={() => setShowEfficiencyReport(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                 >
                   Authorize & Close
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {showDeploymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeploying && setShowDeploymentModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg glass bg-white shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-10 border-b border-border bg-blue-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                   <Zap size={140} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">Logic Layer Deployment</h3>
                  <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.4em]">Protocol: ALPHA-STRIKE V2.4</p>
                </div>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <Shield size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-900 uppercase">Neural Encryption</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AES-GCM 256 Polled</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1">
                       <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                    </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Deployment Lines</p>
                     <div className="grid grid-cols-3 gap-2">
                        {['L-01', 'L-02', 'L-03', 'L-04', 'L-05', 'L-06'].map(line => (
                          <div key={line} className="py-2.5 bg-slate-900 text-white rounded-xl text-center text-xs font-black border border-white/10">
                            {line}
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Activity size={18} className="text-blue-600" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Compiler Handshake</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Initializing firmware cross-compile for Edge-Node hardware. Logic layers will bridge via high-speed factory mesh.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    disabled={isDeploying}
                    onClick={() => setShowDeploymentModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isDeploying}
                    onClick={() => {
                      setIsDeploying(true);
                      onAction?.("Logic Layer Propagation: Sequence starting across 6 target nodes...");
                      setTimeout(() => {
                        setIsDeploying(false);
                        setShowDeploymentModal(false);
                        onAction?.("Deployment Matrix Sync Successful.", "success");
                      }, 3000);
                    }}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    {isDeploying ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                    {isDeploying ? 'DEPLOYING...' : 'INIT DEPLOY'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showConfigModal && editingJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setShowConfigModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-2xl glass bg-white shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8 border-b border-border bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter uppercase">Asset Configuration</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Job Specification & Node Allocation</p>
                  </div>
                </div>
                <button onClick={() => setShowConfigModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Designation</label>
                    <input 
                      type="text"
                      value={editingJob.productName || ''}
                      onChange={(e) => setEditingJob({...editingJob, productName: e.target.value})}
                      placeholder="e.g. Neural-Link v5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Total Target Quantity</label>
                    <input 
                      type="number"
                      value={editingJob.quantity || 0}
                      onChange={(e) => setEditingJob({...editingJob, quantity: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Gauge size={12} className="text-blue-600" /> Hourly Rate
                    </label>
                    <input 
                      type="number"
                      value={editingJob.targetProductionRate || 0}
                      onChange={(e) => setEditingJob({...editingJob, targetProductionRate: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Target size={12} className="text-orange-500" /> Quality Threshold
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      value={editingJob.qualityThreshold || 0}
                      onChange={(e) => setEditingJob({...editingJob, qualityThreshold: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Layers size={12} className="text-indigo-600" /> Node Allocation
                    </label>
                    <input 
                      type="number"
                      value={editingJob.machinesAllocated || 0}
                      onChange={(e) => setEditingJob({...editingJob, machinesAllocated: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-3">
                   <div className="flex items-center gap-3">
                      <Shield size={16} className="text-blue-600" />
                      <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Protocol Intelligence</span>
                   </div>
                   <p className="text-xs text-blue-800 leading-relaxed font-medium">
                     Deploying these parameters will recalibrate the local factory mesh. Machines will automatically optimize duty cycles to match the new {editingJob.targetProductionRate} units/hr target while maintaining a {editingJob.qualityThreshold}% quality floor.
                   </p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-border flex justify-end gap-4">
                <button 
                  disabled={isSaving}
                  onClick={() => setShowConfigModal(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Discard
                </button>
                <button 
                  disabled={isSaving}
                  onClick={handleSaveConfig}
                  className="px-10 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-3"
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} className="text-blue-400" />}
                  {isSaving ? 'VALIDATING...' : 'AUTHORIZE CONFIG'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
