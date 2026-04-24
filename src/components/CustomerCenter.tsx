import React from 'react';
import { Users, Heart, Star, MessageSquare, ShieldCheck, TrendingUp, Search, MoreVertical, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const CustomerCenter: React.FC = () => {
  const metrics = [
    { label: 'NPS Score', value: '78', trend: '+4', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Retention Rate', value: '94%', trend: '+0.5%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Order Fidelity', value: '99.2%', trend: '-0.1%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Feedback', value: '4.8/5', trend: 'Stable', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Success Metrics</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Satisfaction Hub</h1>
        </div>
        <div className="flex gap-4">
           <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-main bg-slate-200 flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/40?u=${i}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-bg-main bg-blue-600 text-white flex items-center justify-center text-[11px] font-black leading-none shadow-lg">
                +14k
              </div>
           </div>
        </div>
      </header>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {metrics.map((m, i) => (
           <div key={i} className="glass p-6 group hover:border-blue-500/50 transition-all flex flex-col justify-between">
              <div>
                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{m.label}</h5>
                 <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-black tracking-tighter", m.color)}>{m.value}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.trend}</span>
                 </div>
              </div>
              <div className={cn("mt-6 w-full h-1 rounded-full", m.bg)}>
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className={cn("h-full rounded-full transition-all duration-1000", m.color.replace('text', 'bg'))}
                 />
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interaction Feed */}
        <div className="lg:col-span-7 glass flex flex-col bg-white overflow-hidden">
          <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <MessageSquare className="text-blue-600" size={20} />
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Live Service Insights</h4>
             </div>
             <button className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest px-4 py-2 border border-slate-200 rounded-lg bg-white shadow-sm">
               Run AI Sentiment Scan
             </button>
          </div>
          <div className="p-0 flex-1 divide-y divide-slate-100">
             {[
               { id: 1, user: 'Enterprise Asia Ltd', msg: 'Delivery consistency has improved by 12% this quarter. AI routing is proving resilient in regional corridors.', score: 5, date: '2m ago' },
               { id: 2, user: 'Global Logistics DACH', msg: 'Minor latency in clearing predicted, but system corrected within 14 minutes. Overall stability is high.', score: 4, date: '14m ago' },
               { id: 3, user: 'Quantum Supply VP', msg: 'Platform transition was seamless. Node synchronization is at an all-time peak.', score: 5, date: '42m ago' }
             ].map((f, i) => (
               <div key={f.id} className="p-6 hover:bg-slate-50/80 transition-all group flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                     <Users size={22} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-0.5">{f.user}</h6>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{f.date}</span>
                        </div>
                        <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-100">
                           {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= f.score ? 'text-amber-400 fill-amber-400' : 'text-slate-100'} />)}
                        </div>
                     </div>
                     <p className="text-sm text-slate-600 italic leading-relaxed font-medium group-hover:text-slate-900 transition-colors">
                       "{f.msg}"
                     </p>
                  </div>
               </div>
             ))}
          </div>
          <div className="p-6 border-t border-border bg-slate-50/30 text-center">
             <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">View All Feedback</button>
          </div>
        </div>

        {/* Loyalty Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="glass p-8 bg-slate-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 -mr-10 -mt-10 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={160} />
              </div>
              
              <header className="mb-8 relative z-10">
                 <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="text-blue-400" size={20} />
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Resilience Index</h4>
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Enterprise Client Tiering</h3>
              </header>
              
              <div className="space-y-6 relative z-10 flex-1">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Diamond Network Allocation</h5>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium italic mb-6">
                      Priority node routing and zero-latency reallocation enabled for 14,200 premium service vectors.
                    </p>
                    <div className="flex items-center gap-6">
                       <div className="flex flex-col">
                          <span className="text-[9px] text-slate-500 uppercase font-black">AI Retention Score</span>
                          <span className="text-2xl font-black text-blue-400 tracking-tighter">98.2%</span>
                       </div>
                       <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: '94%' }}
                             className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Activity size={14} /> Optimization Outcomes
                    </h5>
                    {[
                      { label: 'Response Index', val: 'Top 2%' },
                      { label: 'Resolution Speed', val: '< 4m' },
                      { label: 'Reliability (SLA)', val: '99.9%' }
                    ].map((o, i) => (
                       <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <span className="text-xs font-bold text-slate-300">{o.label}</span>
                          <span className="text-sm font-black text-blue-400 font-mono tracking-tighter">{o.val}</span>
                       </div>
                    ))}
                 </div>
              </div>
              
              <button className="mt-10 w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-50 transition-all">
                Client Loyalty Audit
              </button>
           </div>

           <div className="glass p-6 flex justify-between items-center group cursor-pointer hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm border border-blue-100">
                    <Heart size={24} />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Community Sentiment</h4>
                    <p className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">Highly Positive</p>
                 </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={24} />
           </div>
        </div>
      </div>
    </div>
  );
};
