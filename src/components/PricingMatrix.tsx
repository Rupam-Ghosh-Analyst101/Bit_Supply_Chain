import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Info, ShoppingCart } from 'lucide-react';
import { PricingRecord } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PricingMatrixProps {
  pricing: PricingRecord[];
}

export const PricingMatrix: React.FC<PricingMatrixProps> = ({ pricing }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">Market Dynamics Architecture</h2>
        <h3 className="text-3xl font-black text-white leading-none glow-text uppercase">Pricing Engine</h3>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {pricing.map((item) => {
          const diff = ((item.currentPrice - item.basePrice) / item.basePrice) * 100;
          return (
            <div key={item.id} className="glass p-6 group hover:border-cyan-500/50 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Asset Node</span>
                  <h4 className="font-black text-white uppercase tracking-tighter text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{item.productId}</h4>
                  <p className="data-mono text-cyan-500/50 mt-1">Sync: {new Date(item.updatedAt).toLocaleTimeString()}</p>
                </div>
                <div className={cn(
                  "p-2.5 rounded-sm flex items-center justify-center border",
                  diff >= 0 ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" : "border-rose-500/30 text-rose-400 bg-rose-500/5"
                )}>
                  {diff >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
              </div>

              <div className="space-y-6 mt-auto">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Current Evaluation</span>
                    <span className="text-3xl font-light text-white leading-none font-mono tracking-tighter">{formatCurrency(item.currentPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Delta</span>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-sm font-mono tracking-tighter",
                      diff >= 0 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                    )}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 bg-white/2 overflow-hidden relative">
                  <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
                  <div className="relative z-10">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Demand Factor</span>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.demandFactor / 2) * 100}%` }}
                          className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)]" 
                        />
                       </div>
                       <span className="data-mono text-white/50">{item.demandFactor}x</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Supply Risk</span>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.supplyFactor / 2) * 100}%` }}
                          className="h-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" 
                        />
                       </div>
                       <span className="data-mono text-white/50">{item.supplyFactor}x</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/2 rounded-sm border border-white/5 mt-4">
                  <div className="flex items-center gap-2 mb-1.5 opacity-40 uppercase tracking-widest text-[9px] font-bold">
                    <Info size={10} />
                    <span>AI Determinism</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold tracking-tight italic opacity-70">
                    "{item.lastAdjustmentReason}"
                  </p>
                </div>

                <button className="w-full py-3 bg-cyan-600/10 hover:bg-cyan-500 hover:text-black transition-all text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px] border border-cyan-500/30 rounded-sm shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]">
                  FORCE OVERRIDE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
