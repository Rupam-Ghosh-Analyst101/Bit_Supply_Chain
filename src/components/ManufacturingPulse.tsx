import React from 'react';
import { Cpu, Activity, Zap, CheckCircle2, AlertTriangle, TrendingUp, Boxes, Settings, ArrowUpRight, BarChart3, MoreVertical } from 'lucide-react';
import { ManufacturingJob } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

interface ManufacturingPulseProps {
  jobs: ManufacturingJob[];
}

export const ManufacturingPulse: React.FC<ManufacturingPulseProps> = ({ jobs }) => {
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
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
              <Settings size={16} /> Asset Config
           </button>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
             <BarChart3 size={16} /> Efficiency Report
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
                     <button className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">Adjust Plan <ArrowUpRight size={10} /></button>
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
    </div>
  );
};
