import React from 'react';
import { Truck, MapPin, Calendar, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { Shipment } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ShipmentListProps {
  shipments: Shipment[];
}

export const ShipmentList: React.FC<ShipmentListProps> = ({ shipments }) => {
  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'in-transit': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5';
      case 'delivered': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
      case 'delayed': return 'text-orange-400 border-orange-500/30 bg-orange-500/5';
      case 'cancelled': return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
      case 'pending': return 'text-slate-500 border-white/10 bg-white/5';
      default: return 'text-slate-500 border-white/10 bg-white/5';
    }
  };

  const getPriorityColor = (priority: Shipment['priority']) => {
    switch (priority) {
      case 'critical': return 'text-rose-500 glow-text';
      case 'high': return 'text-orange-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">Logistics Pipeline</h2>
          <h3 className="text-3xl font-black text-white leading-none glow-text uppercase">Active Network</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-64 glass px-3 py-2 text-xs focus-within:border-cyan-500/50 transition-all">
            <input 
              type="text" 
              placeholder="Query Node or Container ID..." 
              className="flex-1 bg-transparent border-none outline-none placeholder:text-slate-600 font-mono text-cyan-400 tracking-tighter"
            />
          </div>
        </div>
      </header>

      <div className="glass overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-8">Deployment ID</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector (Origin &gt; Dest)</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Protocol Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono text-cyan-400">
                  <div className="flex items-center gap-1">
                    <Sparkles size={12} /> Predictive ETA
                  </div>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-white/5 transition-colors group border-white/5">
                  <td className="p-4 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border border-white/10 rounded-sm text-slate-500 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all">
                        <Truck size={14} />
                      </div>
                      <div>
                        <p className="data-mono text-white tracking-tighter group-hover:glow-text uppercase">{shipment.id}</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{shipment.carrier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold uppercase tracking-tighter">
                        <MapPin size={10} className="shrink-0" /> {shipment.origin}
                      </div>
                      <div className="w-full h-[1px] bg-white/5 my-0.5 relative">
                         <div className="absolute top-0 left-0 w-1/2 h-full bg-cyan-500/40 shadow-[0_0_5px_rgba(0,240,255,0.5)]" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-white uppercase tracking-tighter">
                        <MapPin size={10} className="shrink-0 text-cyan-400" /> {shipment.destination}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border",
                      getStatusColor(shipment.status)
                    )}>
                      {shipment.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <Calendar size={12} className="opacity-50" />
                      {formatDate(shipment.eta)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-400 font-mono">
                        {shipment.predictedEta ? (
                          <motion.div 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-1.5"
                          >
                            <Sparkles size={12} className="animate-pulse" />
                            {formatDate(shipment.predictedEta)}
                          </motion.div>
                        ) : (
                          <span className="text-slate-600 font-normal italic opacity-50">PROCESING...</span>
                        )}
                      </div>
                      {shipment.predictedEta && (
                        <div className="flex items-center gap-1 w-24">
                          <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '85%' }}
                              className="h-full bg-cyan-400 shadow-[0_0_5px_rgba(0,240,255,0.8)]"
                            />
                          </div>
                          <span className="text-[8px] text-cyan-600 font-mono">0.85c</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-transparent rounded", getPriorityColor(shipment.priority))}>
                      {shipment.priority}
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="p-2 text-slate-700 hover:text-cyan-400 transition-colors">
                      <Info size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
