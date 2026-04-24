import React from 'react';
import { Package, MapPin, AlertCircle, ShoppingCart } from 'lucide-react';
import { InventoryItem } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface InventoryGridProps {
  inventory: InventoryItem[];
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">Resource Distribution</h2>
        <h3 className="text-3xl font-black text-white leading-none glow-text uppercase">Inventory Nodes</h3>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {inventory.map((item) => {
          const isLow = item.stockLevel < item.reorderPoint;
          const percentage = (item.stockLevel / (item.reorderPoint * 2)) * 100;

          return (
            <div key={item.id} className="glass p-5 group hover:border-cyan-500/50 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "p-2.5 rounded-sm rotate-45 border border-white/5 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]",
                  isLow ? "bg-rose-500/10 text-rose-500" : "bg-cyan-500/10 text-cyan-400"
                )}>
                  <Package size={18} className="-rotate-45" />
                </div>
                {isLow && (
                  <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-sm border border-rose-500/20 uppercase tracking-widest animate-pulse">
                    <AlertCircle size={8} /> CRITICAL LEVEL
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate text-sm">{item.name}</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">
                  <MapPin size={10} className="text-cyan-600" /> {item.warehouse}
                </div>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-light text-white font-mono tracking-tighter leading-none">{item.stockLevel}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Units</span>
                </div>

                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isLow ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" : "bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.6)]"
                    )} 
                  />
                </div>

                <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 font-mono">
                  <span>Threshold: {item.reorderPoint}</span>
                  <span>{formatCurrency(item.unitPrice)}</span>
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 bg-white/5 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white/40 hover:text-cyan-400 rounded-sm text-[9px] font-black uppercase tracking-[0.3em] transition-all">
                INIT REPLENISHMENT
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
