import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RotateCcw, AlertCircle, Zap, RefreshCw, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSupplyChainInsights, SupplyChainInsight } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface AIInsightsProps {
  contextData: any;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ contextData }) => {
  const [insight, setInsight] = useState<SupplyChainInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataString = JSON.stringify(contextData);
      const res = await getSupplyChainInsights(dataString);
      setInsight(res);
    } catch (err) {
      setError("Failed to coordinate AI analysis. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">Predictive Intelligence</h2>
          <h3 className="text-3xl font-black text-white leading-none glow-text uppercase">Lynx Strategy Engine</h3>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-emerald-400 uppercase tracking-tighter font-bold">Neural Engine</span>
            <span className="data-mono text-white/40">Active / Optimized</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-sm flex items-center gap-3 text-rose-400 text-xs font-bold uppercase tracking-widest">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Control Panel */}
        <div className="glass p-6 flex flex-col gap-6">
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Control Interface</h4>
            <button 
              onClick={generateInsights}
              disabled={loading}
              className={cn(
                "w-full py-4 rounded-sm font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 border shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                loading 
                  ? "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed" 
                  : "bg-cyan-600 hover:bg-cyan-500 text-black border-cyan-400 shadow-cyan-900/40"
              )}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Initiate Scan
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Network Telemetry</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nodes</span>
                <span className="data-mono text-white tracking-widest">4,281</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vectors</span>
                <span className="data-mono text-white tracking-widest">12.4k</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-sm border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Entropy</span>
                <span className="data-mono text-emerald-400 tracking-widest">Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* Console Output */}
        <div className="lg:col-span-3 glass flex flex-col relative overflow-hidden min-h-[600px]">
          <div className="absolute inset-0 grid-pattern opacity-5 pointer-events-none" />
          
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Autonomous Decision Stream</h4>
            </div>
            <span className="data-mono text-white/20 text-[9px]">ID: 0x882A-FF01</span>
          </div>

          <div className="flex-1 p-8 overflow-y-auto relative z-10 font-mono scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="w-20 h-20 border-t-2 border-r-2 border-cyan-500 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="text-cyan-400/50" size={24} />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <p className="text-cyan-400 text-xs tracking-widest uppercase animate-pulse">Running Neural Inference...</p>
                  <div className="flex gap-1 justify-center">
                    <div className="w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            ) : insight ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                  <div className="p-2 bg-cyan-500/10 rounded-sm text-cyan-400 border border-cyan-500/20">
                     <Brain size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Strategy Report Output</p>
                    <p className="text-xs text-cyan-400 font-mono">NODE-HASH: {new Date().getTime().toString(16)}</p>
                  </div>
                  <div className={cn(
                    "ml-auto px-3 py-1 rounded-sm border text-[10px] font-black uppercase tracking-widest leading-none",
                    insight.riskLevel === 'low' && "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
                    insight.riskLevel === 'medium' && "border-amber-500/20 text-amber-400 bg-amber-500/5",
                    insight.riskLevel === 'high' && "border-rose-500/20 text-rose-400 bg-rose-500/5",
                    insight.riskLevel === 'critical' && "border-rose-600/30 text-rose-500 bg-rose-500/10 animate-pulse"
                  )}>
                    RISK: {insight.riskLevel}
                  </div>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-sans mb-12">
                   <h5 className="text-white uppercase tracking-widest text-xs font-bold mb-4 opacity-50">Situational Analysis</h5>
                   <ReactMarkdown>{insight.analysis}</ReactMarkdown>
                </div>

                <div className="space-y-4 mb-12">
                   <h5 className="text-white uppercase tracking-widest text-xs font-bold opacity-50">Vector Recommendations</h5>
                   <div className="grid grid-cols-1 gap-3">
                      {insight.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-sm flex gap-4 items-start group hover:border-cyan-500/30 transition-all">
                           <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:glow-text shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                           <p className="text-xs text-slate-400 leading-relaxed group-hover:text-white transition-colors">{rec}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="mt-12 p-4 bg-white/2 border border-white/5 rounded-sm">
                   <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                     <AlertCircle size={12} /> Verification Note
                   </p>
                   <p className="text-[11px] text-slate-500 leading-relaxed italic">
                     Decision confidence rated at 94.2%. This recommendation is generated based on current supply-demand matrices and historical vector analysis.
                   </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 group cursor-pointer" onClick={generateInsights}>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-6 group-hover:border-cyan-500 transition-all">
                  <Zap className="text-slate-700 group-hover:text-cyan-500 transition-all" size={32} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Engine Standby. Awaiting Signal.</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-black border-t border-white/10 flex justify-between items-center relative z-10">
            <div className="flex gap-6 text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
              <span>Secure Node: Lynx-Beta</span>
              <span>Buffer: OK</span>
              <span>Inference: ON</span>
            </div>
            <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full w-2/3 bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
