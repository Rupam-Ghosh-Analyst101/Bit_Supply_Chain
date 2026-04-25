import React, { useState } from 'react';
import { Truck, MapPin, Calendar, AlertTriangle, Info, Sparkles, Filter, ChevronRight, MoreVertical, ChevronDown, Map as MapIcon, Activity, RefreshCw, Box, ArrowUpRight, Zap, Cpu, X, Globe, Shield, Server } from 'lucide-react';
import { Shipment } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShipmentMap } from './ShipmentMap';
import { predictShipmentETA } from '../lib/gemini';

import { useAuth } from '../AuthContext';

interface ShipmentListProps {
  shipments: Shipment[];
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({ shipments, onAction }) => {
  const { role, isAdmin } = useAuth();
  const isOperator = role === 'operator' && isAdmin;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, any>>({});

  const predictETA = async (shipment: Shipment) => {
    setPredictingId(shipment.id);
    try {
      const data = await predictShipmentETA(JSON.stringify(shipment));
      setPredictions(prev => ({ ...prev, [shipment.id]: data }));
      onAction?.(`Neural Prediction Complete for ${shipment.id}`, 'success');
    } catch (e) {
      console.error(e);
      onAction?.(`Neural Link Error: Could not synchronize with prediction node.`, 'warning');
    } finally {
      setPredictingId(null);
    }
  };

  const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
      case 'in-transit': return 'bg-cyber-blue shadow-cyber-blue/40';
      case 'delivered': return 'bg-emerald-500 shadow-emerald-500/40';
      case 'delayed': return 'bg-cyber-red shadow-cyber-red/40';
      case 'pending': return 'bg-amber-400 shadow-amber-400/40';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityStyle = (priority: Shipment['priority']) => {
    switch (priority) {
      case 'critical': return 'text-cyber-red font-black drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]';
      case 'high': return 'text-amber-400 font-bold';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="text-left">
          <h2 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.3em] mb-1">Fleet Telemetry</h2>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Global Shipments</h1>
        </div>
        <div className="flex gap-4">
           {/* Secondary filter if needed, but keeping UI clean */}
           <button 
            onClick={() => {
              onAction?.("Initializing Neural Logistics Stream: Preparing assets for Global Deployment...");
              setShowDeploymentModal(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-cyber-blue to-blue-600 rounded-xl text-[10px] font-black text-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
           >
              New Deployment
           </button>
        </div>
      </div>

      <div className="glass overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Node</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Vector Path</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{isOperator ? "Neural Prediction" : "Estimated Arrival"}</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shipments.map((shipment, idx) => (
                <React.Fragment key={`${shipment.id}-${idx}`}>
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                    className={cn(
                      "transition-colors group cursor-pointer relative",
                      expandedId === shipment.id && "bg-white/[0.04]"
                    )}
                    onClick={() => setExpandedId(expandedId === shipment.id ? null : shipment.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="group-hover:scale-110 transition-transform relative">
                           <div className={cn("absolute inset-0 blur-lg opacity-40 animate-pulse", getStatusColor(shipment.status))} />
                           <div className="w-12 h-12 rounded-2xl bg-bg-deep border border-white/10 flex items-center justify-center relative z-10">
                              <Box className="text-white" size={20} />
                           </div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white font-mono tracking-tighter uppercase leading-none mb-1.5">{shipment.id}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{shipment.carrier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{shipment.origin.split(',')[0]}</span>
                        <div className="flex items-center gap-1 opacity-40">
                           <div className="w-1 h-1 rounded-full bg-cyber-blue" />
                           <div className="w-1 h-1 rounded-full bg-cyber-blue animate-ping" />
                           <div className="w-1 h-1 rounded-full bg-cyber-blue" />
                        </div>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{shipment.destination.split(',')[0]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-lg relative overflow-hidden group-hover:border-cyber-blue/30 transition-all">
                         <div className={cn("w-2 h-2 rounded-full", getStatusColor(shipment.status))} />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest relative z-10">{shipment.status.replace('-', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-2">
                          {shipment.predictedEta ? (
                            <div className="flex items-center gap-3 text-[11px] font-black text-cyber-blue font-mono uppercase tracking-widest">
                               <Sparkles size={12} className="text-cyber-blue animate-pulse" />
                               {formatDate(shipment.predictedEta)}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse italic">RECALCULATING...</span>
                          )}
                          <div className="h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ x: '-100%' }}
                               animate={{ x: '0%' }}
                               transition={{ duration: 1.5 }}
                               className="h-full bg-gradient-to-r from-transparent via-cyber-blue to-transparent" 
                               style={{ width: '100%' }}
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn("text-[10px] uppercase tracking-[0.2em]", getPriorityStyle(shipment.priority))}>
                        {shipment.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <MoreVertical size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                    </td>
                  </motion.tr>
                  
                  <AnimatePresence>
                    {expandedId === shipment.id && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={6} className="px-8 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="py-10 flex flex-col lg:flex-row gap-12">
                               <div className="flex-1 min-h-[400px] glass relative overflow-hidden bg-black/40 border-white/5 rounded-3xl shadow-inner scrollbar-hide">
                                 <ShipmentMap shipment={shipment} />
                               </div>
                               <div className="w-full lg:w-96 flex flex-col gap-8">
                                  <div className="glass p-8 bg-white/5 relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Cpu size={40} className="text-cyber-blue" />
                                     </div>
                                     <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Real-time Telemetry</h5>
                                     <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Coordinates</span>
                                           <span className="text-xs font-black text-white font-mono">{shipment.currentLat?.toFixed(4)}, {shipment.currentLng?.toFixed(4)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Last Sync</span>
                                           <span className="text-xs font-black text-white uppercase">{new Date(shipment.lastUpdated).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Network Cluster</span>
                                           <span className="text-xs font-black text-cyber-blue uppercase">{shipment.carrier}</span>
                                        </div>
                                     </div>
                                  </div>

                                  <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="p-8 rounded-3xl bg-cyber-blue text-black shadow-2xl shadow-cyber-blue/20 relative overflow-hidden"
                                  >
                                     <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/20 blur-[50px] rounded-full" />
                                     <div className="relative z-10 flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                           <div className="flex items-center gap-3">
                                              <Zap size={20} className="text-black" />
                                              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isOperator ? "Neural Predictor" : "Route Optimizer"}</span>
                                           </div>
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); predictETA(shipment); }}
                                             disabled={predictingId === shipment.id}
                                             className="px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-zinc-900 transition-colors"
                                           >
                                              {predictingId === shipment.id ? <RefreshCw className="animate-spin" size={14} /> : <Activity size={14} />}
                                              RE-SOLVE
                                           </button>
                                        </div>
                                        
                                        {predictions[shipment.id] ? (
                                           <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                              <div className="flex justify-between items-end border-b border-black/10 pb-4">
                                                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">ETA Result</span>
                                                 <span className="text-2xl font-black tabular-nums">{new Date(predictions[shipment.id].predictedEta).toLocaleDateString()}</span>
                                              </div>
                                              <div className="flex flex-wrap gap-2 pt-2">
                                                 {predictions[shipment.id].factors.slice(0, 3).map((f: string, i: number) => (
                                                   <span key={i} className="px-3 py-1 bg-black/5 border border-black/10 rounded-lg text-[9px] font-black uppercase">{f}</span>
                                                 ))}
                                              </div>
                                           </div>
                                        ) : (
                                           <p className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest line-clamp-3">
                                              Optimization engine suggesting ultra-fast route via North Corridor. Zero friction expected.
                                           </p>
                                        )}
                                     </div>
                                  </motion.div>
                               </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center group">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Data Segments: {shipments.length}</p>
           <div className="flex gap-2">
              {[1, 2, 3].map((p, i) => (
                <button key={i} className={cn(
                  "w-10 h-10 rounded-xl border font-black text-[11px] transition-all flex items-center justify-center",
                  p === 1 ? "bg-cyber-blue text-black border-cyber-blue shadow-lg shadow-cyber-blue/20" : "bg-transparent text-slate-500 border-white/10 hover:border-white/30"
                )}>
                  {p}
                </button>
              ))}
           </div>
        </div>
      </div>
      <AnimatePresence>
        {showDeploymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeploying && setShowDeploymentModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-4xl glass bg-slate-900 border-white/10 shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-white/5 bg-cyber-blue text-black flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                   <Globe size={200} />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                   <div className="p-3 bg-black text-white rounded-2xl">
                      <Truck size={32} />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black tracking-tighter uppercase mb-1">Logistics Strategy Configurator</h3>
                     <p className="text-[10px] font-black text-black/60 uppercase tracking-[0.4em]">Autonomous Fleet Deployment Matrix v1.2</p>
                   </div>
                </div>
                <button onClick={() => !isDeploying && setShowDeploymentModal(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors relative z-10">
                  <X size={32} />
                </button>
              </div>

              <div className="p-10 space-y-12 overflow-y-auto bg-black/40 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass p-8 bg-white/5 flex flex-col gap-4 group hover:border-cyber-blue/50 transition-all">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={14} className="text-cyber-blue" /> Transit Velocity
                    </h4>
                    <span className="text-4xl font-black tracking-tighter">Ultra-Lite</span>
                    <p className="text-[11px] text-slate-500 font-bold uppercase">Average TTD: 14.2 Hours</p>
                  </div>
                  <div className="glass p-8 bg-white/5 flex flex-col gap-4 group hover:border-cyber-blue/50 transition-all">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Shield size={14} className="text-emerald-400" /> Security Overlay
                    </h4>
                    <span className="text-4xl font-black tracking-tighter">Level-4</span>
                    <p className="text-[11px] text-slate-500 font-bold uppercase">Biometric Chain-of-Custody</p>
                  </div>
                  <div className="glass p-8 bg-white/5 border-cyber-blue/40 flex flex-col gap-4 group hover:border-cyber-blue/50 transition-all">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Server size={14} className="text-blue-400" /> Compute Node
                    </h4>
                    <span className="text-4xl font-black tracking-tighter">Edge-Grid</span>
                    <p className="text-[11px] text-slate-400 font-bold uppercase">Adaptive Re-routing Active</p>
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-xs font-black text-cyber-blue uppercase tracking-[0.3em]">Sector Deployment Mapping</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { sector: 'Pacific Central', status: 'Optimal', capacity: '92%' },
                        { sector: 'North Coridorn', status: 'Congested', capacity: '100%' },
                        { sector: 'South Link', status: 'Optimal', capacity: '64%' },
                        { sector: 'Euro-Mesh', status: 'Scaling', capacity: '45%' },
                      ].map((s, i) => (
                        <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.sector}</p>
                           <div className="flex justify-between items-end">
                              <span className="text-sm font-black uppercase">{s.status}</span>
                              <span className="text-[10px] font-mono text-cyber-blue">{s.capacity}</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-cyber-blue animate-ping" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Strategy Matrix Summary</h4>
                   </div>
                   <p className="text-base text-slate-300 leading-relaxed font-medium max-w-3xl italic">
                     Neural fleet deployment will prioritize <span className="text-white font-black underline">high-velocity corridors</span>. We are currently observing a 22% increase in North Atlantic throughput. Adaptive rerouting protocol <span className="text-cyber-blue">EXCALIBUR v3</span> is authorized for this segment.
                   </p>
                </div>
              </div>

              <div className="p-8 bg-black border-t border-white/5 mt-auto flex justify-end gap-6">
                 <button 
                  disabled={isDeploying}
                  onClick={() => setShowDeploymentModal(false)}
                  className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                 >
                   Discard Strategy
                 </button>
                 <button 
                  disabled={isDeploying}
                  onClick={() => {
                    setIsDeploying(true);
                    onAction?.("Logic Layer Synchronization: Fleet assets receiving new vector instructions...");
                    setTimeout(() => {
                      setIsDeploying(false);
                      setShowDeploymentModal(false);
                      onAction?.("Global Deployment Successful: 1,420 assets re-routed.", "success");
                    }, 4000);
                  }}
                  className="px-10 py-4 bg-cyber-blue text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyber-blue/20 flex items-center gap-3"
                 >
                   {isDeploying ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                   {isDeploying ? "Deploying Assets..." : "Execute Global Deployment"}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
