import React from 'react';
import { Truck, Map, Box, Radio, RefreshCcw, Navigation, CheckCircle, ChevronRight, Activity, Bell } from 'lucide-react';
import { Shipment } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DistributionFlowProps {
  shipments: Shipment[];
}

export const DistributionFlow: React.FC<DistributionFlowProps> = ({ shipments }) => {
  const distributionStages = [
    { label: 'Warehouse Outbound', icon: Box, color: 'text-blue-600', bg: 'bg-blue-50', count: 12 },
    { label: 'Sortation Center', icon: RefreshCcw, color: 'text-orange-500', bg: 'bg-orange-50', count: 8 },
    { label: 'Last-Mile Transit', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', count: 15 },
    { label: 'Final Delivery', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', count: 42 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Final Vector Positioning</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Micro-Fulfillment Logic</h1>
        </div>
        <div className="flex gap-4">
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
             <Navigation size={16} /> Optimize Local Routes
           </button>
        </div>
      </header>

      {/* Pipeline Visualization */}
      <div className="glass p-10 bg-white">
         <div className="flex justify-between items-center max-w-5xl mx-auto relative">
            {distributionStages.map((stage, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-4 group z-10">
                   <div className={cn(
                     "w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-slate-100 group-hover:border-blue-200 transition-all duration-500 relative bg-white shadow-sm",
                     i === 2 && "border-blue-200 bg-blue-50/10 shadow-lg shadow-blue-500/5"
                   )}>
                      <stage.icon className={cn(stage.color, "transition-transform group-hover:scale-110")} size={28} />
                      {i === 2 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse" />}
                   </div>
                   <div className="text-center">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight block mb-0.5">{stage.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stage.count} Active Orders</span>
                   </div>
                </div>
                {i < distributionStages.length - 1 && (
                  <div className="flex-1 h-px border-t-2 border-dashed border-slate-100 mx-4 relative top-[-1.5rem]">
                     <motion.div 
                        animate={{ left: ['0%', '100%'], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-2px] w-4 h-1 bg-blue-400 rounded-full"
                     />
                  </div>
                )}
              </React.Fragment>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Local Dispatch Log */}
        <div className="glass flex flex-col bg-white overflow-hidden">
          <div className="px-6 py-5 border-b border-border bg-slate-50/50 flex justify-between items-center">
             <h4 className="text-sm font-bold text-slate-800 tracking-tight">Local Dispatch Vectors</h4>
             <span className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-tighter">DISTRICT: AP-42</span>
          </div>
          <div className="p-0">
             {shipments.filter(s => s.status === 'in-transit').slice(0, 4).map((s, i) => (
               <div key={i} className="flex flex-col p-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="text-xs font-black text-slate-900 tracking-widest uppercase flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> PKG_{s.id.slice(0, 8).toUpperCase()}
                     </span>
                     <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-md">EST 14:22 PM</span>
                  </div>
                  <div className="flex items-center gap-6 text-[11px] text-slate-500 font-bold">
                     <div className="flex items-center gap-2"><Map size={14} className="text-slate-400" /> {s.destination.split(',')[0]}</div>
                     <div className="flex items-center gap-2"><Truck size={14} className="text-slate-400" /> {s.carrier}</div>
                     <div className="ml-auto flex items-center gap-1 group-hover:text-blue-600 transition-colors">Route Details <ChevronRight size={14} /></div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Transmission Feed */}
        <div className="glass flex flex-col bg-slate-900 text-white p-8 relative overflow-hidden group">
           <div className="absolute bottom-0 right-0 p-10 opacity-5 -mb-6 -mr-6 transition-transform group-hover:scale-110">
              <Radio size={160} />
           </div>
           
           <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Activity size={16} /> Wireless Transmission Feed
           </h4>
           <div className="space-y-6 flex-1">
              {[
                { time: '14:22', msg: 'Vehicle V-442 rerouted through secondary corridor due to congestion.', type: 'info', color: 'border-blue-500' },
                { time: '14:18', msg: 'Signature confirmed for Vector SH-9910. Successful delivery at Hub-North.', type: 'success', color: 'border-emerald-500' },
                { time: '14:05', msg: 'Low power warning: Dispatch Drone D-22 reporting 12% remaining.', type: 'warn', color: 'border-orange-500' }
              ].map((log, i) => (
                <div key={i} className="flex gap-6 pb-6 border-b border-white/5 last:border-0 relative z-10">
                   <span className="text-[11px] font-mono font-bold text-slate-500 w-12">{log.time}</span>
                   <div className={cn(
                     "flex-1 text-sm font-medium leading-relaxed italic pr-12 border-l-2 pl-4",
                     log.color
                   )}>
                      {log.msg}
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Radio size={18} className="animate-pulse" />
                 </div>
                 <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">IoT Mesh Active</span>
                    <span className="text-xs font-black text-emerald-500 uppercase">98.4% Uptime</span>
                 </div>
              </div>
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
                 <Bell size={18} className="text-blue-400" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
