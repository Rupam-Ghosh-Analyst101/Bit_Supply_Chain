import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RotateCcw, AlertCircle, Zap, RefreshCw, Brain, TrendingUp, Map, BarChart3, ShieldCheck, Activity } from 'lucide-react';
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Intelligence Layer</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Predictive Policy Engine</h1>
        </div>
        <div className="flex gap-4">
           <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">Audit Logs</button>
           <button 
             onClick={generateInsights}
             disabled={loading}
             className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
           >
             {loading ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
             Run Neural Scan
           </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-widest">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Intelligence Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          { label: 'Demand Forecast', icon: TrendingUp, val: '94%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Supply Planning', icon: RefreshCw, val: 'Synced', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inventory Opt', icon: Zap, color: 'text-orange-500', val: 'Active', bg: 'bg-orange-50' },
          { label: 'Network Design', icon: Map, color: 'text-indigo-400', val: 'Optimized', bg: 'bg-indigo-50' },
          { label: 'Risk Mitigation', icon: ShieldCheck, color: 'text-red-400', val: 'Scanning', bg: 'bg-red-50' },
          { label: 'Decision Auto', icon: BrainCircuit, color: 'text-blue-400', val: 'Tier 3', bg: 'bg-blue-50' }
        ].map((d, i) => (
          <div key={i} className="glass p-5 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-all">
             <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110", d.bg, d.color)}>
                <d.icon size={20} />
             </div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{d.label}</span>
             <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{d.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Display */}
        <div className="lg:col-span-8 glass flex flex-col min-h-[600px] relative overflow-hidden bg-white">
          <div className="p-6 border-b border-border bg-slate-50/50 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">Autonomous Analysis Output</h4>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
               Ref: #{new Date().getTime().toString(16).slice(-8)}
            </div>
          </div>

          <div className="flex-1 p-8 relative z-10 overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-slate-100 rounded-full" />
                  <div className="absolute inset-0 w-24 h-24 border-t-4 border-blue-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="text-blue-200" size={32} />
                  </div>
                </div>
                <div className="text-center space-y-2">
                   <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">Running Neural Inference...</p>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Coordinating global node data</p>
                </div>
              </div>
            ) : insight ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                     <Brain size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Intelligence Summary</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Confidence Rating: 94.2%</p>
                  </div>
                  <div className={cn(
                    "ml-auto px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest leading-none",
                    insight.riskLevel === 'low' && "bg-emerald-50 text-emerald-600",
                    insight.riskLevel === 'medium' && "bg-orange-50 text-orange-500",
                    insight.riskLevel === 'high' && "bg-red-50 text-red-600",
                    insight.riskLevel === 'critical' && "bg-red-100 text-red-600 animate-pulse"
                  )}>
                    Risk Factor: {insight.riskLevel}
                  </div>
                </div>
                
                <div className="prose prose-slate max-w-none mb-12">
                   <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
                      <ReactMarkdown>{insight.analysis}</ReactMarkdown>
                   </div>

                   <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                     <ChevronRight className="text-blue-600" size={16} /> Actionable Vectors
                   </h5>
                   <div className="grid grid-cols-1 gap-4">
                      {insight.recommendations.map((rec, i) => (
                        <div key={i} className="p-5 bg-white border border-slate-100 rounded-xl flex gap-5 items-start group hover:border-blue-500/30 hover:shadow-md transition-all">
                           <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                           <p className="text-sm text-slate-600 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{rec}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                 <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                    <Zap size={32} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Engine on Standby</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-xs">Initialize neural scan to process end-to-end supply chain telemetry.</p>
                 </div>
                 <button 
                  onClick={generateInsights}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-3"
                 >
                    <Activity size={18} /> Run Diagnostics
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="glass p-6">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Parameters</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Regional Focus', val: 'Global Architecture' },
                   { label: 'Time Horizon', val: '96 Hours Predictive' },
                   { label: 'Optimization Mode', val: 'Resilience Balanced' },
                   { label: 'Model Accuracy', val: '0.12% Latency' }
                 ].map((p, i) => (
                   <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-xs font-bold text-slate-400">{p.label}</span>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{p.val}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass p-6 flex-1 flex flex-col">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Network Health Telemetry</h4>
              <div className="flex-1 min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <motion.div className="flex items-end justify-between h-full gap-2 pt-10">
                      {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative group">
                           <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              className="absolute bottom-0 left-0 right-0 bg-blue-600/20 group-hover:bg-blue-600 transition-all"
                           />
                        </div>
                      ))}
                   </motion.div>
                 </ResponsiveContainer>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Global Stability</p>
                    <h3 className="text-2xl font-black text-slate-900 leading-none">98.4%</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 justify-end"><TrendingUp size={10} /> +1.2%</p>
                    <p className="text-[10px] text-slate-400 font-bold">vs last audit</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = (props: any) => (
   <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
