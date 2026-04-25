import React from 'react';
import { Package, ShieldCheck, AlertCircle, Clock, Factory, Search, ChevronRight, MoreVertical, Star, CheckCircle2, RefreshCw, Zap, Sparkles, History, X, Globe, Activity, TrendingUp, BarChart3, Shield } from 'lucide-react';
import { SourcingRecord, AuditEntry } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getSupplyChainInsights } from '../lib/gemini';

interface SourcingOperatorProps {
  sourcing: SourcingRecord[];
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const SourcingOperator: React.FC<SourcingOperatorProps> = ({ sourcing, onAction }) => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [riskReport, setRiskReport] = React.useState<any[]>([]);
  const [viewingAudit, setViewingAudit] = React.useState<SourcingRecord | null>(null);
  const [showStressTest, setShowStressTest] = React.useState(false);

  const getMockAuditTrail = (vendor: SourcingRecord): AuditEntry[] => {
    if (vendor.auditTrail) return vendor.auditTrail;
    return [
      { id: '1', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), action: 'Lead Time Update', change: '14 days -> 12 days', author: 'System AI' },
      { id: '2', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), action: 'Reliability Recalibration', change: '85% -> 88%', author: 'Operational Analyst' },
      { id: '3', timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), action: 'Risk Level Update', change: 'medium -> low', author: 'Procurement Manager' },
    ];
  };

  const runRiskAssessment = async () => {
    setAnalyzing(true);
    try {
      if (sourcing.length === 0) {
        setRiskReport([{
          name: "SYSTEM",
          riskScore: 0,
          recommendation: "Insufficient vendor telemetry to run assessment. Register vendors first."
        }]);
        return;
      }
      const context = JSON.stringify({
        task: 'vendor-risk-assessment',
        vendors: sourcing.map(v => ({ name: v.vendorName, material: v.material, reliabilty: v.reliabilityRating, leadTime: v.leadTime }))
      });
      const data = await getSupplyChainInsights(context);
      onAction?.(`Neural Risk Profile Generated: Supplier network resilience analyzed.`, 'success');
      // Transform AI insight into risk report format
      setRiskReport(data.recommendations.map((rec: string, i: number) => ({
        name: sourcing.length > 0 ? sourcing[i % sourcing.length].vendorName : "Unknown Vendor",
        riskScore: Math.floor(Math.random() * 40) + 60, // Mocking score for UI since insight doesn't provide specific scores per vendor easily
        recommendation: rec
      })));
    } catch (error) {
      console.error("Risk Assessment Error:", error);
      onAction?.(`Internal Link Failure: Could not synchronize with risk assessment node.`, 'warning');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Strategic Supply</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sourcing Control Center</h1>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => {
               onAction?.("Launching Supply Chain Stress Test: Initializing nodal failure simulations...");
               setShowStressTest(true);
             }}
             disabled={analyzing}
             className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
           >
              <Zap size={16} />
              Stress Test
           </button>
           <button 
            onClick={() => onAction?.("Initializing Vendor Onboarding: Protocol V-1 established. Verify node credentials.")}
            className="px-4 py-2 bg-blue-600 text-white border border-blue-700 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
           >
             <Factory size={16} /> New Vendor
           </button>
        </div>
      </header>

      {riskReport.length > 0 && (
        <div className="glass p-6 border-l-4 border-l-red-500 bg-white shadow-xl animate-in fade-in slide-in-from-left-4 duration-500">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                 <AlertCircle className="text-red-600" size={18} /> High-Risk Node Analysis
              </h4>
              <button onClick={() => setRiskReport([])} className="text-slate-400 hover:text-slate-900">
                 <ShieldCheck size={18} /> Dismiss
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {riskReport.slice(0, 3).map((r, i) => (
                <div key={i} className="space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{r.name}</span>
                      <span className="text-xs font-black text-red-600 font-mono">{r.riskScore}% Risk</span>
                   </div>
                   <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${r.riskScore}%` }} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-500 italic">Recommendation: {r.recommendation}</p>
                </div>
              ))}
           </div>
        </div>
      )}

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
                       <div className="flex justify-end gap-2">
                         <button 
                            onClick={() => {
                              onAction?.(`Retrieving immutable audit records for ${s.vendorName}...`);
                              setViewingAudit(s);
                            }}
                            title="View Audit Trail"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                         >
                            <History size={16} />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <MoreVertical size={16} />
                         </button>
                       </div>
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
                <button 
                  onClick={() => onAction?.("Rerouting Procurement Flow: Backup supplier node activated. Lead time recalibrated.")}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest rounded-lg shadow-lg shadow-red-600/20 transition-all"
                >
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
             <button 
                onClick={() => onAction?.("Neural Simulation Launching: Assessing market volatility vs supply-chain resilience...")}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl relative z-10 hover:bg-blue-50 transition-colors"
             >
                Run Simulation
             </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStressTest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStressTest(false)}
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
                  <div className="p-3 bg-red-600 text-white rounded-2xl">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Nodal Stress Simulation</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.34em]">Stability Protocol: TITAN-X ALPHA</p>
                  </div>
                </div>
                <button onClick={() => setShowStressTest(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-12 overflow-y-auto bg-slate-50/30">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-red-600">
                       <Shield size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Resilience Factor</span>
                    </div>
                    <span className="text-4xl font-black text-slate-900">84.2%</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">System Integrity Matrix</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-blue-600">
                       <Globe size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Exposure Node</span>
                    </div>
                    <span className="text-4xl font-black text-slate-900">12 Nodes</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Critical Single-Points</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-orange-500">
                       <TrendingUp size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Volatility Index</span>
                    </div>
                    <span className="text-4xl font-black text-slate-900">Med-High</span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Market Correlation</p>
                  </div>
                </section>

                <section className="space-y-6">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                     <BarChart3 size={18} className="text-blue-600" />
                     Failure Cascade Simulation
                   </h4>
                   <div className="h-[200px] w-full bg-white rounded-[2rem] border border-slate-200 flex items-end justify-between p-10 gap-2">
                      {[40, 60, 35, 90, 50, 75, 45, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-100 rounded-t-lg relative group">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: `${h}%` }}
                             className={cn(
                               "w-full rounded-t-lg transition-all",
                               h > 70 ? 'bg-red-500' : h > 50 ? 'bg-orange-500' : 'bg-blue-600'
                             )}
                           />
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                             NODE-{i+1}: {h}%
                           </div>
                        </div>
                      ))}
                   </div>
                </section>

                <div className="bg-slate-900 text-white p-10 rounded-[3rem] border border-border space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-600 text-white rounded-2xl">
                         <AlertCircle size={24} />
                      </div>
                      <div>
                         <h4 className="text-lg font-black uppercase tracking-tight">AI Strategy Injection</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Neural Recommendation Engine</p>
                      </div>
                   </div>
                   <p className="text-base text-slate-300 leading-relaxed font-medium italic border-l-2 border-red-600 pl-6">
                     "Diversification of lithium sourcing via the North Corridor is prioritized. Current vendor reliance on Node-X presents a 14% higher likelihood of cascade failure during market contraction pulses. Recommend immediate pivot to alternate material logic."
                   </p>
                   <div className="flex gap-4">
                     <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                       Accept Diversification
                     </button>
                     <button className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20">
                       Trigger Manual Reset
                     </button>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-border mt-auto flex justify-end gap-4">
                 <button className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                   Export Data
                 </button>
                 <button 
                  onClick={() => setShowStressTest(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
                 >
                   Clear & Close
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {viewingAudit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingAudit(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Audit Trail</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{viewingAudit.vendorName}</p>
                  </div>
                </div>
                <button onClick={() => setViewingAudit(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {getMockAuditTrail(viewingAudit).map((entry, idx) => (
                  <div key={entry.id} className="relative pl-8 border-l border-slate-100 last:border-0 pb-6 last:pb-0">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full z-10" />
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                        {entry.action}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
                      <p className="text-sm font-bold text-slate-900 mb-2">{entry.change}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black uppercase">
                          {entry.author.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 italic">Modified by {entry.author}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 border-t border-border mt-auto">
                <button 
                  onClick={() => setViewingAudit(null)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
                >
                  Close Records
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
