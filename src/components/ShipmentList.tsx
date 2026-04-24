import React from 'react';
import { Truck, MapPin, Calendar, AlertTriangle, Info, Sparkles, Filter, Search, ChevronRight, MoreVertical } from 'lucide-react';
import { Shipment } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ShipmentListProps {
  shipments: Shipment[];
}

export const ShipmentList: React.FC<ShipmentListProps> = ({ shipments }) => {
  const getStatusStyle = (status: Shipment['status']) => {
    switch (status) {
      case 'in-transit': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'delayed': return 'bg-orange-50 text-orange-500 border-orange-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      case 'pending': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getPriorityStyle = (priority: Shipment['priority']) => {
    switch (priority) {
      case 'critical': return 'text-red-600 font-black';
      case 'high': return 'text-orange-600 font-bold';
      default: return 'text-slate-400 font-medium';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Global Logistics</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Shipment Network</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ID, carrier, or destination..." 
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
             <Filter size={16} /> Filters
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
             <Truck size={16} /> Create Shipment
          </button>
        </div>
      </header>

      <div className="glass overflow-hidden border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID & Carrier</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Route (Source → Target)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Sparkles size={12} className="text-blue-600" /> AI Prediction
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 font-mono tracking-tighter uppercase leading-none mb-1.5">{shipment.id}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{shipment.carrier}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="flex flex-col text-right">
                          <span className="text-xs font-bold text-slate-500">{shipment.origin.split(',')[0]}</span>
                       </div>
                       <div className="flex-1 min-w-[60px] h-px bg-slate-200 relative">
                          <div className={cn(
                            "absolute top-0 left-0 h-full transition-all duration-1000",
                            shipment.status === 'delayed' ? 'bg-orange-400 w-2/3' : 'bg-blue-400 w-full'
                          )} />
                       </div>
                       <ChevronRight className="text-slate-300" size={12} />
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900">{shipment.destination.split(',')[0]}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent",
                      getStatusStyle(shipment.status)
                    )}>
                      {shipment.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 font-mono">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(shipment.eta)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {shipment.predictedEta ? (
                        <div className="flex items-center gap-2 text-xs font-black text-blue-600 font-mono">
                           <Sparkles size={12} className="animate-pulse" />
                           {formatDate(shipment.predictedEta)}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic">RECALCULATING...</span>
                      )}
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden w-24">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all duration-1000"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[10px] uppercase tracking-widest", getPriorityStyle(shipment.priority))}>
                      {shipment.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50/50 border-t border-border flex justify-between items-center text-xs">
           <p className="font-bold text-slate-500">Total Deployments: {shipments.length}</p>
           <div className="flex gap-1.5">
              {[1, 2, 3, '...', 12].map((p, i) => (
                <div key={i} className={cn(
                  "w-8 h-8 rounded border flex items-center justify-center font-bold transition-all cursor-pointer",
                  p === 1 ? "bg-blue-600 text-white border-blue-700 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}>
                  {p}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
