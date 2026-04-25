import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Info, ShoppingCart, Sparkles, Loader2, Check, X, BrainCircuit, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PricingRecord } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getDynamicPricingSuggestion } from '../lib/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

interface PricingMatrixProps {
  pricing: PricingRecord[];
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const PricingMatrix: React.FC<PricingMatrixProps> = ({ pricing, onAction }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ item: PricingRecord; suggestedPrice: number; reasoning: string } | null>(null);
  const [applying, setApplying] = useState(false);
  const [showGlobalReport, setShowGlobalReport] = useState(false);

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
      onAction?.(`Neural Price Analysis Complete: Optimized rate identified for ${item.productId}`, 'success');
    } catch (error) {
      console.error("AI Scan failed", error);
      onAction?.(`Neural Scan Error: Failed to synchronize with demand nodes.`, 'warning');
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
      onAction?.(`Commercial Strategy Applied: Price point recalibrated successfully.`, 'success');
    } catch (error) {
      handleFirestoreError(error, 'update', `pricing/${suggestion.item.id}`);
      onAction?.(`Error applying strategy: Insufficient permissions for ledger mutation.`, 'warning');
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
           <button 
            onClick={() => onAction?.("Generating Secure Pricing Ledger: CSV export starting in 3.2s...")}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
           >
              Export Matrix
           </button>
           <button 
            onClick={() => {
              onAction?.("Synthesizing Global Value Analysis: Strategy report compilation in progress.");
              setShowGlobalReport(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
           >
             <BarChart3 size={16} /> Global Report
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 bg-white border-l-4 border-l-blue-600">
           <p className="text-[10px] font-black text-slate-400 gap-2 flex items-center uppercase tracking-widest mb-2">
              <DollarSign size={10} className="text-blue-600" /> Total Active Value
           </p>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(pricing.reduce((acc, curr) => acc + curr.currentPrice, 0))}
           </h3>
        </div>
        <div className="glass p-6 bg-white border-l-4 border-l-emerald-500">
           <p className="text-[10px] font-black text-slate-400 gap-2 flex items-center uppercase tracking-widest mb-2">
              <TrendingUp size={10} className="text-emerald-500" /> Avg Delta
           </p>
           <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
              +{(pricing.reduce((acc, curr) => acc + ((curr.currentPrice - curr.basePrice) / curr.basePrice), 0) / pricing.length * 100).toFixed(2)}%
           </h3>
        </div>
        <div className="glass p-6 bg-white border-l-4 border-l-purple-500">
           <p className="text-[10px] font-black text-slate-400 gap-2 flex items-center uppercase tracking-widest mb-2">
              <Sparkles size={10} className="text-purple-500" /> Strategy Coverage
           </p>
           <h3 className="text-2xl font-black text-purple-600 tracking-tight">100%</h3>
        </div>
        <div className="glass p-6 bg-white border-l-4 border-l-orange-500">
           <p className="text-[10px] font-black text-slate-400 gap-2 flex items-center uppercase tracking-widest mb-2">
              <Info size={10} className="text-orange-500" /> Pending Updates
           </p>
           <h3 className="text-2xl font-black text-orange-600 tracking-tight">0</h3>
        </div>
      </div>

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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
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

        {showGlobalReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGlobalReport(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl glass bg-white shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter">Global Value Analysis</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Commercial Intelligence Report - Q2 2026</p>
                  </div>
                </div>
                <button onClick={() => setShowGlobalReport(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-12 overflow-y-auto">
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: '$1.4M', color: 'text-emerald-600' },
                    { label: 'Forecasted Gain', value: '+14%', color: 'text-blue-600' },
                    { label: 'Market Resilience', value: 'High', color: 'text-indigo-600' },
                    { label: 'Risk Score', value: 'LOW', color: 'text-emerald-600' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                       <span className={cn("text-2xl font-black", stat.color)}>{stat.value}</span>
                    </div>
                  ))}
                </section>

                <section>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    Demand Distribution Analytics
                  </h4>
                  <div className="h-[200px] w-full bg-slate-50 rounded-[2rem] border border-slate-100 flex items-end justify-between p-8 gap-4 px-12">
                    {[65, 45, 85, 70, 95, 55, 75, 60, 80, 50].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl group relative cursor-pointer"
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                           {h}%
                         </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 px-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-[2rem] border border-border">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Competitor Correlation</h5>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Market nodes are currently oscillating within a 4.2% parity variance. Neural analysis suggests a deliberate pivot toward premium positioning on Node-Alpha categories to leverage supply-chain scarcity.
                    </p>
                  </div>
                  <div className="glass p-8 rounded-[2rem] border border-border bg-slate-900 text-white">
                    <h5 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Strategic Outlook</h5>
                    <ul className="space-y-3">
                      {[
                        'Increase throughput on Item-B lines by 15%',
                        'Hedge lithium procurement via alternate routes',
                        'Maintain 3.2% margin buffer on seasonal assets'
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-300">
                          <CheckCircle2 size={14} className="text-blue-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-border mt-auto flex justify-end gap-4">
                 <button className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all">
                   Download Report
                 </button>
                 <button 
                  onClick={() => setShowGlobalReport(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                 >
                   Dismiss
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
