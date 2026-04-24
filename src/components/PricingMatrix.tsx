import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Info, ShoppingCart, Sparkles, Loader2, Check, X, BrainCircuit, BarChart3, ChevronRight } from 'lucide-react';
import { PricingRecord } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getDynamicPricingSuggestion } from '../lib/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

interface PricingMatrixProps {
  pricing: PricingRecord[];
}

export const PricingMatrix: React.FC<PricingMatrixProps> = ({ pricing }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ item: PricingRecord; suggestedPrice: number; reasoning: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const handleAIScan = async (item: PricingRecord) => {
    setAnalyzingId(item.id);
    try {
      const result = await getDynamicPricingSuggestion(JSON.stringify({
        productId: item.productId,
        basePrice: item.basePrice,
        currentPrice: item.currentPrice,
        demandFactor: item.demandFactor,
        supplyFactor: item.supplyFactor,
        competitorPrice: item.competitorPrice
      }));
      setSuggestion({ item, ...result });
    } catch (error) {
      console.error("AI Scan failed", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const applySuggestedPrice = async () => {
    if (!suggestion) return;
    setApplying(true);
    try {
      const pricingDoc = doc(db, 'pricing', suggestion.item.id);
      await updateDoc(pricingDoc, {
        currentPrice: suggestion.suggestedPrice,
        lastAdjustmentReason: suggestion.reasoning,
        updatedAt: new Date().toISOString()
      });
      setSuggestion(null);
    } catch (error) {
      handleFirestoreError(error, 'update', `pricing/${suggestion.item.id}`);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Commercial Strategy</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dynamic Pricing Control</h1>
        </div>
        <div className="flex gap-4">
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">Export Matrix</button>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
             <BarChart3 size={16} /> Global Report
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {pricing.map((item) => {
          const diff = ((item.currentPrice - item.basePrice) / item.basePrice) * 100;
          const isAnalyzing = analyzingId === item.id;

          return (
            <div key={item.id} className="glass group hover:border-blue-500/50 transition-all flex flex-col overflow-hidden bg-white">
              <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-start">
                <div>
                   <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Asset Node</span>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">{item.productId}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase font-mono mt-1 tracking-tighter">Updated: {new Date(item.updatedAt).toLocaleTimeString()}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border",
                  diff >= 0 ? "border-emerald-100 text-emerald-600 bg-emerald-50" : "border-red-100 text-red-600 bg-red-50"
                )}>
                  {diff >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-8">
                <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Price</p>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{formatCurrency(item.currentPrice)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delta</p>
                    <span className={cn(
                      "text-xs font-black px-2 py-0.5 rounded-full",
                      diff >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                    )}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Demand Multiplier</span>
                          <span className="text-blue-600">{item.demandFactor}x</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.demandFactor / 2) * 100}%` }}
                            className="h-full bg-blue-600 rounded-full" 
                          />
                       </div>
                   </div>
                   <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Supply Constaint</span>
                          <span className="text-orange-600">{item.supplyFactor}x</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.supplyFactor / 2) * 100}%` }}
                            className="h-full bg-orange-500 rounded-full" 
                          />
                       </div>
                   </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-auto">
                   <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Sparkles size={12} className="text-blue-600" />
                      <span>Last Action Narrative</span>
                   </div>
                   <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                     "{item.lastAdjustmentReason}"
                   </p>
                </div>

                <button 
                  onClick={() => handleAIScan(item)}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SIMULATING...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={16} />
                      Neural Price Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {suggestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setSuggestion(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors z-20"
              >
                <X size={24} />
              </button>

              <div className="p-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Policy Proposal Generated</h4>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">Dynamic Price Pivot</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 mb-10 pb-10 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block font-mono">Current Policy</span>
                    <p className="text-2xl font-bold text-slate-400 line-through">{formatCurrency(suggestion.item.currentPrice)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest block font-mono">Proposed Rate</span>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(suggestion.suggestedPrice)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <BrainCircuit size={18} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Adjustment Rationale</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                    "{suggestion.reasoning}"
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSuggestion(null)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest rounded-xl"
                  >
                    Reject Pivot
                  </button>
                  <button 
                    onClick={applySuggestedPrice}
                    disabled={applying}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
                  >
                    {applying ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={18} />
                        Apply Strategy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
