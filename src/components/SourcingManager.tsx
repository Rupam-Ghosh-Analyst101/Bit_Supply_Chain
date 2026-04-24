import React from 'react';
import { Package, ShieldCheck, AlertCircle, Clock, Factory, Search, ChevronRight, MoreVertical, Star, CheckCircle2 } from 'lucide-react';
import { SourcingRecord } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SourcingManagerProps {
  sourcing: SourcingRecord[];
}

export const SourcingManager: React.FC<SourcingManagerProps> = ({ sourcing }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Strategic Supply</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sourcing Control Center</h1>
        </div>
        <div className="flex gap-4">
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">Supplier Audit</button>
           <button className="px-4 py-2 bg-blue-600 text-white border border-blue-700 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
             <Factory size={16} /> New Vendor
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Vendor List */}
        <div className="lg:col-span-2 glass flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
             <div className="flex items-center gap-3">
               <ShieldCheck className="text-blue-600" size={20} />
               <h4 className="text-sm font-bold text-slate-800 tracking-tight">Global Supplier Matrix</h4>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter vendors..." 
                  className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 w-56 transition-all"
                />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50/30">
                  <th className="px-6 py-4">Vendor Details</th>
                  <th className="px-6 py-4">Material / Service</th>
                  <th className="px-6 py-4 text-center">Lead Time</th>
                  <th className="px-6 py-4">Reliability</th>
                  <th className="px-6 py-4">Risk Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {sourcing.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase tracking-tighter">
                           {s.vendorName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{s.vendorName}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono tracking-tighter">{s.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{s.material}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs font-black text-slate-900">{s.leadTime} DAYS</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 w-20 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 shadow-sm transition-all duration-1000" style={{ width: `${s.reliabilityRating}%` }} />
                          </div>
                          <span className="text-xs font-black text-blue-600">{s.reliabilityRating}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                        s.riskLevel === 'low' ? 'bg-emerald-50 text-emerald-600' :
                        s.riskLevel === 'medium' ? 'bg-orange-50 text-orange-500' :
                        'bg-red-50 text-red-600'
                      )}>
                        {s.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                          <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/50 border-t border-border mt-auto">
             <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Active Vendors: {sourcing.length}</span>
                <span className="flex items-center gap-2 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-Audit Sync Active</span>
             </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6 flex flex-col">
          <div className="glass p-6">
             <div className="flex items-center gap-3 mb-6">
                <Package className="text-indigo-600" size={20} />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Supply Intel</h3>
             </div>
             
             <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                   <AlertCircle className="text-red-600" size={18} />
                   <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">Strike Warning</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Labor strikes in South American lithium mines may impact lead times by <span className="font-bold text-red-600 underline">12-14 days</span>.
                </p>
                <button className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest rounded-lg shadow-lg shadow-red-600/20 transition-all">
                  Switch to Backup Vendor
                </button>
             </div>

             <div className="space-y-5">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex justify-between"> Procurement Vectors <CheckCircle2 size={12} className="text-emerald-500" /></h5>
                {[
                  { label: 'Raw Materials', val: 94, color: 'bg-blue-600' },
                  { label: 'Core Assemblies', val: 62, color: 'bg-orange-500' },
                  { label: 'Logistics Overhead', val: 88, color: 'bg-emerald-500' }
                ].map((v, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-slate-600">{v.label}</span>
                         <span className="text-slate-900">{v.val}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full transition-all duration-1000", v.color)} 
                           style={{ width: `${v.val}%` }} 
                         />
                      </div>
                   </div>
                ))}
             </div>
          </div>

          <div className="glass p-6 bg-blue-600 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 -mr-4 -mt-4 transition-transform group-hover:scale-110">
                <Star size={120} />
             </div>
             <h4 className="text-white font-black text-xl tracking-tight mb-2 relative z-10">AI Sourcing Agent</h4>
             <p className="text-blue-100 text-sm leading-relaxed mb-6 relative z-10">
               "I've identified 3 alternate suppliers for high-risk components with 15% better unit pricing."
             </p>
             <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl relative z-10 hover:bg-blue-50 transition-colors">
                Run Simulation
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
