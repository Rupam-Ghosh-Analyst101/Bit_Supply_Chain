import React from 'react';
import { Package, MapPin, AlertCircle, ShoppingCart, ChevronRight, MoreVertical, RefreshCw, Zap, Sparkles, X, Shield, History, BarChart3, TrendingUp } from 'lucide-react';
import { InventoryItem, AuditEntry } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeInventoryOptimization } from '../lib/gemini';

interface InventoryGridProps {
  inventory: InventoryItem[];
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory, onAction }) => {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState<any[]>([]);
  const [showReplenishmentModal, setShowReplenishmentModal] = React.useState(false);
  const [viewingAuditItem, setViewingAuditItem] = React.useState<InventoryItem | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === inventory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inventory.map(item => item.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkReorder = () => {
    onAction?.(`Initiating Bulk Replenishment for ${selectedIds.size} assets: Generating consolidated PO requirements...`, 'info');
    setShowReplenishmentModal(true);
  };

  const handleBulkStatusUpdate = () => {
    onAction?.(`Bulk Asset Re-synchronization: Updating status for ${selectedIds.size} nodes...`, 'success');
    setSelectedIds(new Set());
  };

  const getMockAuditTrail = (item: InventoryItem): AuditEntry[] => {
    return [
      { id: '1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), action: 'Stock Level Reconciled', change: `${item.stockLevel + 50} -> ${item.stockLevel}`, author: 'Warehouse Bot Alpha' },
      { id: '2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), action: 'Unit Price Recalibrated', change: `$${(item.unitPrice * 0.9).toFixed(2)} -> $${item.unitPrice}`, author: 'Market Engine' },
      { id: '3', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), action: 'Warehouse Transfer', change: 'Node-02 -> Node-01', author: 'Systems Admin' },
    ];
  };

  const runReorderAnalysis = async () => {
    setAnalyzing(true);
    try {
      const simplifiedItems = JSON.stringify(inventory.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.stockLevel,
        reorderPoint: item.reorderPoint
      })));

      const data = await analyzeInventoryOptimization(simplifiedItems);
      setRecommendations(data.filter((d: any) => d.optimizationAction === 'reorder'));
      onAction?.(`Optimization Simulation Complete: Identified stock anomalies in ${data.length} clusters.`, 'success');
    } catch (error) {
      console.error("Analysis Error:", error);
      onAction?.(`Analysis Logic Error: Simulation failure in Reorder Node.`, 'warning');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Stock Portfolio</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Product Inventory</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={toggleSelectAll}
            className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            {selectedIds.size === inventory.length ? "Deselect All" : "Select All"}
          </button>
          <button 
            onClick={runReorderAnalysis}
            disabled={analyzing}
            className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            {analyzing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
            Optimize Stock
          </button>
          <button 
            onClick={() => {
              onAction?.("Initiating Global Replenishment: Optimizing procurement routes for stock injection...");
              setShowReplenishmentModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <ShoppingCart size={16} /> New Replenishment
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="p-6 bg-blue-900 text-white rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-800/50 flex items-center justify-center">
                    <Sparkles size={20} className="text-blue-300" />
                 </div>
                 <div>
                    <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1 text-blue-100">Critical Replenishment Nodes Identified</h4>
                    <p className="text-xs text-blue-200/70 font-medium">System recommendation based on real-time consumption velocity.</p>
                 </div>
              </div>
              <button 
                onClick={() => setRecommendations([])}
                className="text-blue-300 hover:text-white transition-colors"
              >
                <AlertCircle size={20} />
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.slice(0, 4).map((rec, idx) => (
                <div key={`rec-${rec.id || idx}`} className="bg-blue-800/40 border border-blue-700/50 p-4 rounded-xl backdrop-blur-sm">
                   <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase text-blue-300/80">{rec.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-black uppercase border border-red-500/30">Priority: {rec.priority}</span>
                   </div>
                   <h5 className="text-sm font-black text-white mb-2">{rec.name}</h5>
                   <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-blue-300/60 uppercase">Suggested Order</span>
                      <span className="text-emerald-400">+{rec.suggestedReorder} units</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {inventory.map((item) => {
          const isLow = item.stockLevel < item.reorderPoint;
          const percentage = (item.stockLevel / (item.reorderPoint * 2)) * 100;
          const isSelected = selectedIds.has(item.id);

          return (
            <div 
              key={item.id} 
              onClick={() => toggleSelect(item.id)}
              className={cn(
                "glass p-6 group hover:border-blue-500/50 transition-all flex flex-col relative overflow-hidden cursor-pointer",
                isSelected && "border-blue-500 bg-blue-50/30"
              )}
            >
              <div className="absolute top-4 left-4 z-10">
                <div className={cn(
                  "w-5 h-5 rounded border transition-all flex items-center justify-center",
                  isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300 group-hover:border-blue-400"
                )}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                </div>
              </div>

              {isLow && (
                <div className="absolute top-0 right-0 p-2">
                   <div className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-bl-lg">Critical</div>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6 pt-4">
                <div className={cn(
                  "p-3 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                  isLow ? "bg-red-50 text-red-600 shadow-red-100" : "bg-blue-50 text-blue-600 shadow-blue-100"
                )}>
                  <Package size={22} />
                </div>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                >
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

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(`Accessing Immutable Asset Ledger: Audit history for ${item.name} retrieving...`);
                  setViewingAuditItem(item);
                }}
                className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 hover:border-blue-500/50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all"
              >
                Audit Log <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-10 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 pr-10 border-r border-white/10">
               <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-lg font-black italic">
                 {selectedIds.size}
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Assets Selected</p>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Bulk Management Mode</p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={handleBulkReorder}
                className="flex items-center gap-3 px-6 py-3 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
               >
                 <ShoppingCart size={16} /> Bulk Reorder
               </button>
               <button 
                onClick={handleBulkStatusUpdate}
                className="flex items-center gap-3 px-6 py-3 bg-white/10 text-white border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
               >
                 <RefreshCw size={16} /> Sync Status
               </button>
               <button 
                onClick={() => setSelectedIds(new Set())}
                className="p-3 text-slate-500 hover:text-white transition-colors"
               >
                 <X size={20} />
               </button>
            </div>
          </motion.div>
        )}
        {showReplenishmentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReplenishmentModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl glass bg-white shadow-2xl rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border flex justify-between items-center bg-blue-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 text-white rounded-2xl">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter uppercase">Replenishment Logic Engine</h3>
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.34em]">Global Procurement Simulation V3.0</p>
                  </div>
                </div>
                <button onClick={() => setShowReplenishmentModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-12 overflow-y-auto bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-6">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-600" />
                      Consumption Velocity
                    </h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                         <span className="text-xs font-bold text-slate-400">Projected Demand</span>
                         <span className="text-2xl font-black text-slate-900">4,280 Units</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                         <span className="text-xs font-bold text-slate-400">Current Velocity</span>
                         <span className="text-2xl font-black text-blue-600">842 / Day</span>
                       </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white p-8 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col gap-6">
                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-wider flex items-center gap-2">
                       <Shield size={18} className="text-blue-400" />
                       Risk Profile
                    </h4>
                    <div className="space-y-3">
                       <p className="text-sm text-slate-300 leading-relaxed font-medium">
                         Procurement paths via Singapore are currently experiencing <span className="text-orange-400 font-bold">12% latency</span> due to port congestion.
                       </p>
                       <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                          <AlertCircle size={14} className="text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alternative Route Alpha Proposed</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Procurement Node Authorization</h4>
                   <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Asset Node</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Suggested Injection</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Lead Time</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Total Capital</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {inventory.filter(i => i.stockLevel < i.reorderPoint * 1.5).slice(0, 4).map((item, idx) => (
                            <tr key={`replenish-${item.id || idx}`}>
                              <td className="px-6 py-4 text-xs font-black text-slate-900">{item.name}</td>
                              <td className="px-6 py-4 text-xs font-bold text-blue-600">+{item.reorderPoint * 2}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono">12d</td>
                              <td className="px-6 py-4 text-xs font-black text-slate-950 font-mono">{formatCurrency(item.unitPrice * item.reorderPoint * 2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-border mt-auto flex justify-end gap-4">
                 <button className="px-8 py-3 bg-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                   Save Simulation
                 </button>
                 <button 
                  onClick={() => {
                    setShowReplenishmentModal(false);
                    onAction?.("Replenishment Strategy Synchronized: Purchase Orders queued for verification.", "success");
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                 >
                   Authorize Orders
                 </button>
              </div>
            </motion.div>
          </div>
        )}

        {viewingAuditItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingAuditItem(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-lg glass bg-white shadow-2xl rounded-[3rem] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                    <History size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 leading-none mb-1">Asset Audit Log</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewingAuditItem.name}</p>
                  </div>
                </div>
                <button onClick={() => setViewingAuditItem(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {getMockAuditTrail(viewingAuditItem).map((entry, idx) => (
                  <div key={`audit-${viewingAuditItem.id}-${entry.id || idx}`} className="relative pl-8 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 bg-white border-2 border-blue-600 rounded-full z-10" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{entry.action}</span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-sm font-bold text-slate-900 mb-3">{entry.change}</p>
                       <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">
                            {entry.author.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">Modified by {entry.author}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-border mt-auto">
                <button 
                  onClick={() => setViewingAuditItem(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl"
                >
                  Verify & Minimize
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
