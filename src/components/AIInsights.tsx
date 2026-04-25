import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RotateCcw, AlertCircle, Zap, RefreshCw, Brain, TrendingUp, Map, BarChart3, ShieldCheck, Activity, Cpu, Globe, ChevronRight, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getSupplyChainInsights, SupplyChainInsight } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer } from 'recharts';

interface AIInsightsProps {
  contextData: any;
  compact?: boolean;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ contextData, compact = false }) => {
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
      setError("NEURAL LINK FAILURE: COORDINATION INTERRUPTED.");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="text-left">
            <h2 className="text-[9px] font-black text-cyber-purple uppercase tracking-[0.2em] mb-1 leading-none">Intelligence</h2>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Neural Core</h1>
          </div>
          <button 
            onClick={generateInsights}
            disabled={loading}
            className="p-3 bg-white/5 border border-white/10 text-white rounded-xl hover:border-cyber-purple hover:bg-cyber-purple/10 disabled:opacity-50 transition-all"
          >
            {loading ? <RefreshCw className="animate-spin text-cyber-purple" size={14} /> : <Zap size={14} className="text-cyber-purple" />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Demand', icon: TrendingUp, val: '98.2%', color: 'from-cyber-blue to-blue-600' },
            { label: 'Asset Sync', icon: RefreshCw, val: 'ACTIVE', color: 'from-emerald-400 to-teal-600' },
          ].map((d, i) => (
            <div key={i} className="glass p-4 flex flex-col items-start text-left border-white/5 bg-white/[0.02]">
               <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-gradient-to-br", d.color)}>
                  <d.icon className="text-white" size={16} />
               </div>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{d.label}</span>
               <span className="text-[10px] font-black text-white uppercase tracking-tighter">{d.val}</span>
            </div>
          ))}
        </div>

        <div className="glass flex flex-col min-h-[300px] relative overflow-hidden bg-white/[0.01] border-white/5">
           <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <span className="text-[9px] font-black text-white tracking-[0.1em] uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyber-purple rounded-full animate-ping" />
                OUTPUT STREAM
              </span>
              <span className="text-[9px] font-mono text-cyber-purple/60">v2.0</span>
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto scrollbar-hide text-left">
              <AnimatePresence mode="wait">
                {loading ? (
                   <div className="h-full flex flex-col items-center justify-center gap-4">
                      <RefreshCw className="animate-spin text-cyber-purple" size={24} />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest text-center">Processing Neural Pathways...</p>
                   </div>
                ) : insight ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{insight.analysis.substring(0, 150)}...</p>
                    <div className="space-y-2">
                      {insight.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex gap-3 items-start">
                           <ChevronRight size={14} className="text-cyber-purple shrink-0 mt-0.5" />
                           <p className="text-[10px] font-medium text-slate-400 group-hover:text-white transition-colors">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
                     <Zap size={32} className="text-slate-700 animate-pulse" />
                     <button 
                      onClick={generateInsights}
                      className="px-6 py-2.5 bg-cyber-purple text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                     >
                        SCAN CORE
                     </button>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <header className="flex justify-between items-end px-2">
        <div className="text-left">
          <h2 className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.4em] mb-1">Intelligence Layer</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Neural Policy Engine</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={generateInsights}
             disabled={loading}
             className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-cyber-purple hover:bg-cyber-purple/10 transition-all flex items-center gap-3 disabled:opacity-50 group shadow-2xl"
           >
             {loading ? <RefreshCw className="animate-spin text-cyber-purple" size={16} /> : <Zap size={16} className="text-cyber-purple group-hover:scale-125 transition-transform" />}
             {loading ? 'CALCULATING...' : 'INITIATE NEURAL SCAN'}
           </button>
        </div>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-cyber-red/10 border border-cyber-red/30 rounded-2xl flex items-center gap-4 text-cyber-red text-[11px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,0,60,0.1)]"
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {/* Intelligence Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: 'Demand Radius', icon: TrendingUp, val: '98.2%', color: 'from-cyber-blue to-blue-600' },
          { label: 'Asset Sync', icon: RefreshCw, val: 'ACTIVE', color: 'from-emerald-400 to-teal-600' },
          { label: 'Node Velocity', icon: Zap, val: 'MAX', color: 'from-amber-400 to-orange-600' },
          { label: 'Grid Shield', icon: ShieldCheck, color: 'from-cyber-purple to-purple-600', val: 'SECURE' },
          { label: 'Core Integrity', icon: Globe, color: 'from-cyber-blue to-blue-600', val: 'LOCAL' },
          { label: 'Neural Version', icon: Cpu, color: 'from-cyber-purple to-purple-600', val: 'v9.2.4' }
        ].map((d, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5, scale: 1.05 }}
            className="glass p-6 flex flex-col items-center justify-center text-center group border-white/5 bg-white/[0.02]"
          >
             <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-xl group-hover:shadow-white/5 transition-all", d.color)}>
                <d.icon className="text-white" size={24} />
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{d.label}</span>
             <span className="text-[11px] font-black text-white uppercase tracking-tighter">{d.val}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Intelligence Display */}
        <div className="lg:col-span-8 glass flex flex-col min-h-[650px] relative overflow-hidden bg-white/[0.01] border-white/5">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-purple to-transparent opacity-30" />
          
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4 text-left">
              <div className="w-2 h-2 bg-cyber-purple rounded-full animate-ping" />
              <div>
                <h4 className="text-sm font-black text-white tracking-[0.2em] uppercase">NEURAL OUTPUT STREAM</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Vector Processing Pipeline v2.0</p>
              </div>
            </div>
            <div className="text-[10px] font-mono text-cyber-purple/60 tracking-wider">
               TERMINAL: {new Date().getTime().toString(16).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 p-10 overflow-y-auto scrollbar-hide text-left">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center space-y-12"
                >
                  <div className="relative">
                    <div className="w-32 h-32 border border-white/5 rounded-full" />
                    <motion.div 
                       animate={{ rotate: 360 }}
                       transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                       className="absolute inset-0 w-32 h-32 border-t-2 border-cyber-purple rounded-full shadow-[0_0_20px_rgba(188,0,255,0.4)]" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <BrainCircuit className="text-white/20 animate-pulse" size={40} />
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                     <p className="text-lg font-black text-white uppercase tracking-[0.3em] rainbow-text">Decrypting Grid Patterns...</p>
                     <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3].map(j => (
                          <motion.div 
                            key={j}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                            className="w-1.5 h-1.5 bg-cyber-purple rounded-full" 
                          />
                        ))}
                     </div>
                  </div>
                </motion.div>
              ) : insight ? (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto space-y-12"
                >
                  <div className="flex items-center gap-6 p-8 glass bg-gradient-to-r from-cyber-purple/10 to-transparent border-white/5 group">
                    <div className="w-16 h-16 rounded-3xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple shadow-[0_0_30px_rgba(188,0,255,0.2)] group-hover:scale-110 transition-transform">
                       <Brain size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Decision Insight</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.2em]">{insight.riskLevel || 'ANALYTICAL'} Priority</span>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Confidence Optimized</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-12 pb-20">
                    <div className="relative">
                       <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-cyber-purple to-transparent opacity-30" />
                       <div className="markdown-body text-slate-300">
                          <ReactMarkdown>{insight.analysis}</ReactMarkdown>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h5 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-4">
                         <span className="w-8 h-[1px] bg-cyber-purple" /> ACTIONABLE DIRECTIVES
                       </h5>
                       <div className="grid grid-cols-1 gap-6">
                          {insight.recommendations.map((rec, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ x: 10 }}
                              className="p-8 glass bg-white/[0.02] border-white/5 rounded-3xl flex gap-8 items-start group hover:border-cyber-purple/30 transition-all shadow-2xl"
                            >
                               <div className="w-10 h-10 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/20 flex items-center justify-center text-cyber-purple shrink-0 group-hover:bg-cyber-purple group-hover:text-black transition-all">
                                  <ChevronRight size={20} />
                               </div>
                               <p className="text-lg font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">{rec}</p>
                            </motion.div>
                          ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-10 group">
                   <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-slate-700 group-hover:text-cyber-purple group-hover:border-cyber-purple/30 transition-all duration-700">
                      <Zap size={48} className="animate-pulse" />
                   </div>
                   <div className="text-center">
                      <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3">Neural Core Standby</h3>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">System ready for end-to-end grid decryption and policy modeling.</p>
                   </div>
                   <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateInsights}
                    className="px-12 py-4 bg-gradient-to-r from-cyber-purple to-purple-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-cyber-purple/20 flex items-center gap-4"
                   >
                      <Activity size={18} /> INITIALIZE SCAN
                   </motion.button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Intelligence Telemetry Sidebars */}
        <div className="lg:col-span-4 flex flex-col gap-10">
           <div className="glass p-8 bg-white/[0.01] border-white/5 text-left">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">System Constellations</h4>
              <div className="space-y-6">
                 {[
                   { label: 'Inference Load', val: 'GLOBAL CLUSTER', color: 'text-cyber-blue' },
                   { label: 'Temporal Skew', val: '96H PREDICTIVE', color: 'text-cyber-purple' },
                   { label: 'Synapse Latency', val: 'MINIMAL (1.4ms)', color: 'text-emerald-400' },
                   { label: 'Encryption Layer', val: 'AES-QUAD 512', color: 'text-slate-300' }
                 ].map((p, i) => (
                   <div key={i} className="flex justify-between items-center group">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{p.label}</span>
                      <span className={cn("text-[11px] font-black uppercase tracking-tighter font-mono", p.color)}>{p.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass p-8 flex-1 flex flex-col bg-gradient-to-b from-white/[0.02] to-transparent border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 text-left">GRID STABILITY PULSE</h4>
              <div className="flex-1 min-h-[250px] relative">
                 <div className="absolute inset-0 flex items-end justify-between gap-3">
                    {[45, 80, 55, 95, 75, 90, 60, 40, 85, 70].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/[0.03] rounded-t-lg relative group overflow-hidden">
                         <div className="absolute inset-0 bg-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                            className="absolute bottom-0 left-0 right-0 bg-cyber-purple/20 group-hover:bg-cyber-purple transition-all shadow-[0_0_15px_rgba(188,0,255,0.3)]" 
                         />
                      </div>
                    ))}
                 </div>
              </div>
              <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
                 <div className="text-left">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">NEURAL INTEGRITY</p>
                    <h3 className="text-4xl font-black text-white leading-none tracking-tighter rainbow-text">98.4%</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-black text-emerald-400 flex items-center justify-end gap-2"><ArrowUpRight size={14} /> +1.2%</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Audit Sync</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
