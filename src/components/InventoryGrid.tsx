import React from 'react';
import { Package, MapPin, AlertCircle, ShoppingCart, ChevronRight, MoreVertical } from 'lucide-react';
import { InventoryItem } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface InventoryGridProps {
  inventory: InventoryItem[];
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Optimization</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Inventory Nodes</h1>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
           <ShoppingCart size={16} /> New Replenishment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {inventory.map((item) => {
          const isLow = item.stockLevel < item.reorderPoint;
          const percentage = (item.stockLevel / (item.reorderPoint * 2)) * 100;

          return (
            <div key={item.id} className="glass p-6 group hover:border-blue-500/50 transition-all flex flex-col relative overflow-hidden">
              {isLow && (
                <div className="absolute top-0 right-0 p-2">
                   <div className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">Critical</div>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "p-3 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                  isLow ? "bg-red-50 text-red-600 shadow-red-100" : "bg-blue-50 text-blue-600 shadow-blue-100"
                )}>
                  <Package size={22} />
                </div>
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                   <MoreVertical size={16} />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-black text-slate-900 uppercase tracking-tight text-base mb-1">{item.name}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                  <MapPin size={12} className="text-blue-500" /> {item.warehouse}
                </div>
              </div>

              <div className="mt-auto space-y-5">
                <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Current Stock</p>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{item.stockLevel.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Value/Unit</p>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(item.unitPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Performance</span>
                    <span>{Math.round(Math.min(percentage, 100))}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-sm",
                        isLow ? "bg-red-500" : "bg-blue-600"
                      )} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                   <span className="text-slate-400">Category: <span className="text-slate-900">{item.category}</span></span>
                   <span className="text-orange-500">Reorder @ {item.reorderPoint}</span>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-500/50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all">
                Audit Log <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
