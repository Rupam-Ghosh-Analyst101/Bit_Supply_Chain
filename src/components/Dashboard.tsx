import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Package, Truck, Factory, Globe, Search, Bell, MessageSquare, Newspaper,
  ChevronRight, MoreVertical, Filter, ArrowUp, ArrowDown,
  Warehouse, Users, LayoutDashboard, Database, Activity, RefreshCw,
  AlertTriangle, ArrowUpRight, ArrowDownRight, BrainCircuit, X,
  ShieldCheck, DollarSign, Cpu, TrendingUp, UserCheck, Settings, CreditCard, Lock, MapPin, Calendar, Award, Fingerprint, ArrowRight, Zap, Briefcase, ChevronDown, ChevronUp, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Shipment, InventoryItem, PricingRecord, ManufacturingJob, SourcingRecord, ViewType } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { WorldMap } from './WorldMap';
import { ShipmentList } from './ShipmentList';
import { AIInsights } from './AIInsights';
import { getSupplyChainInsights } from '../lib/gemini';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarketStock } from '../types';
import { StrategicInstruments } from './StrategicInstruments';
import { GLOBAL_MARKET_ASSETS } from '../data/marketData';

interface DashboardProps {
  shipments: Shipment[];
  inventory: InventoryItem[];
  pricing: PricingRecord[];
  manufacturing: ManufacturingJob[];
  sourcing: SourcingRecord[];
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
  onViewChange?: (view: ViewType, params?: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ shipments, inventory, pricing, manufacturing, sourcing, onAction, onViewChange }) => {
  const [tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => (prev + 1) % 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const systemProtocols = [
    "PROTOCOL ALPHA: Re-synchronizing North Atlantic logistics nodes...",
    "NEURAL LINK: Optimizing asset distribution for Q3 delta targets...",
    "CYBER GUARD: Monitoring high-frequency trade vectors for variance...",
    "VECTOR OPTIMIZATION: HSCL node reporting 5.6% efficiency gain...",
    "MARKET PULSE: Reliance Industries infrastructure expansion detected..."
  ];

  const { user, role } = useAuth();
  const isOperator = role === 'operator';
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MarketStock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [simulationEvents, setSimulationEvents] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', type: 'order', title: 'Shipment SHP-901 Delayed', message: 'Heavy storms in North Atlantic affecting route velocity.', time: '2m ago', priority: 'high' },
    { id: '2', type: 'market', title: 'Steel Index Pulse', message: 'Global steel prices projected to rise 4.2% next quarter.', time: '15m ago', priority: 'medium' },
  ]);

  // Live Order Notifications listener for the menu
  useEffect(() => {
    if (!user) return;
    
    const ordersQuery = query(
      collection(db, 'client_orders'),
      where('type', '==', 'buy'),
      limit(5)
    );

    const unsub = onSnapshot(ordersQuery, (snap) => {
      const liveNotifs = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: 'market',
          title: `Asset Acquisition: ${data.ticker}`,
          message: `Node successfully acquired at $${data.price.toLocaleString()}. Quantity: ${data.quantity}.`,
          time: 'Active',
          priority: 'medium'
        };
      });
      
      setNotifications(prev => {
        // Simple merge - keeping initial system alerts and adding live orders
        const systemAlerts = prev.filter(n => n.type === 'order');
        return [...liveNotifs, ...systemAlerts].slice(0, 8);
      });
    }, (err) => console.error("Notification listener error:", err));

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const searchStocks = async () => {
      const trimmed = searchTerm.trim();
      if (trimmed.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);
      try {
        // Fetch from DB
        const q = query(
          collection(db, 'market_stocks'),
          limit(100)
        );
        const snap = await getDocs(q);
        let allStocks = snap.docs.map(doc => ({ ...doc.data() as MarketStock, id: doc.id }));
        
        // If DB is empty, use fallbacks
        if (allStocks.length === 0) {
          allStocks = GLOBAL_MARKET_ASSETS;
        }

        const searchPattern = trimmed.toLowerCase();
        const filtered = allStocks.filter(s => 
          (s.name?.toLowerCase() || '').includes(searchPattern) || 
          (s.ticker?.toLowerCase() || '').includes(searchPattern) ||
          (s.category?.toLowerCase() || '').includes(searchPattern)
        );

        // Sort by relevance (ticker matches first)
        const sorted = [...filtered].sort((a, b) => {
          if (a.ticker.toLowerCase() === searchPattern) return -1;
          if (b.ticker.toLowerCase() === searchPattern) return 1;
          return 0;
        });

        setSearchResults(sorted.slice(0, 8));
      } catch (err) {
        console.error("Stock search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchStocks, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const markAllRead = () => {
    setNotifications([]);
    onAction?.("Local notification buffer cleared.", "info");
  };

  React.useEffect(() => {
    fetch('/api/simulation/events')
      .then(res => res.json())
      .then(data => setSimulationEvents(data))
      .catch(err => console.error("Simulation load error:", err));
  }, [isOperator]);

  const [analyzingStrategy, setAnalyzingStrategy] = useState(false);
  const [strategyInsight, setStrategyInsight] = useState<{ analysis: string; recommendations: string[]; riskLevel: string; title?: string; confidence?: string } | null>(null);

  const filteredShipments = shipments.filter(shipment => 
    (shipment.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (shipment.carrier?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (shipment.origin?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (shipment.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (shipment.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const generateStrategy = async () => {
    setAnalyzingStrategy(true);
    try {
      const context = JSON.stringify({
        role,
        shipments: shipments.length,
        inventory: inventory.map(i => ({ name: i.name, stock: i.stockLevel })),
        pendingJobs: manufacturing.filter(j => j.status !== 'completed').length
      });

      const data = await getSupplyChainInsights(context);
      setStrategyInsight(data);
      onAction?.("Strategic Assessment Synthesis Complete.", "success");
    } catch (error) {
      console.error("Strategy AI Error:", error);
      onAction?.("Neural Link Failure: Strategic engine unavailable.", "warning");
    } finally {
      setAnalyzingStrategy(false);
    }
  };

  const kpis = isOperator ? [
    { label: 'GLOBAL FLEET', value: shipments.length.toString(), change: '+12%', trend: 'up', icon: Package, color: 'from-cyber-blue to-blue-600' },
    { label: 'NETWORK LATENCY', value: '1.4d', change: '-4h', trend: 'down', icon: Truck, color: 'from-cyber-purple to-purple-600' },
    { label: 'ASSET VELOCITY', value: (inventory.reduce((acc, curr) => acc + curr.stockLevel, 0) / 1000).toFixed(1) + 'K', change: 'MAX', trend: 'up', icon: Warehouse, color: 'from-cyber-red to-rose-600' },
    { label: 'OPERATIONAL RISK', value: '0.04%', change: 'MIN', trend: 'down', icon: Activity, color: 'from-amber-400 to-orange-600' },
  ] : [
    { label: 'PORTFOLIO STATUS', value: 'ACTIVE', change: 'SECURE', trend: 'up', icon: ShieldCheck, color: 'from-emerald-400 to-teal-600' },
    { label: 'IN TRANSIT', value: shipments.filter(s => s.status === 'in-transit').length.toString(), change: '100%', trend: 'up', icon: Truck, color: 'from-cyber-blue to-blue-600' },
    { label: 'STOCK HEALTH', value: '94%', change: 'EXCELLENT', trend: 'up', icon: Package, color: 'from-cyber-purple to-purple-600' },
    { label: 'MARKET TREND', value: '+2.4%', change: 'BULLISH', trend: 'up', icon: DollarSign, color: 'from-amber-400 to-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 min-h-screen pb-20 cyber-grid">
      {/* Dynamic Header / Command Bridge */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between glass px-8 py-6 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-50"
      >
        <div className="absolute top-0 left-0 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent animate-rainbow-slow" />
        
        <div className="flex items-center gap-6 flex-1">
          <div className="flex flex-col text-left">
            <h1 className="text-3xl font-black tracking-tight rainbow-text uppercase leading-none">
              {isOperator ? "BS - CORE" : "BITS SUPPLY"}
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-ping" /> GLOBAL SYNC ACTIVE • {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="relative flex-1 max-w-xl mx-10">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-blue transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={isOperator ? "Query neural network assets (e.g. NVDA, HSCL)..." : "Search logistics assets..."} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue/30 focus:border-cyber-blue/50 transition-all font-mono placeholder:opacity-30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
              />
            </div>

            <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
              {['NVDA', 'RELIANCE', 'HSCL', 'BTCUSD', 'GOLD-X'].map(t => (
                <button 
                  key={t}
                  onClick={() => setSearchTerm(t)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest hover:border-cyber-blue hover:text-white transition-all shrink-0"
                >
                  {t}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {showResults && (searchTerm.length >= 2) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Asset Search Results</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-8 text-center">
                        <RefreshCw className="animate-spin text-cyber-blue mx-auto mb-2" size={20} />
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Synchronizing with Node Grid...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(stock => (
                        <div 
                          key={stock.id}
                          className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group flex justify-between items-center"
                          onClick={() => {
                            if (onViewChange) {
                              onViewChange('market', { ticker: stock.ticker });
                              onAction?.(`Directing to ${stock.name} Node...`, "success");
                            } else {
                              onAction?.(`Selected ${stock.name} (${stock.ticker})`, "info");
                            }
                            setShowResults(false);
                            setSearchTerm('');
                          }}
                        >
                          <div className="text-left">
                            <p className="text-xs font-black text-white uppercase">{stock.name}</p>
                            <p className="text-[9px] font-bold text-cyber-blue uppercase">{stock.ticker}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-mono font-black text-white">${stock.price.toLocaleString()}</p>
                             <p className={cn("text-[9px] font-black", stock.change >= 0 ? "text-emerald-400" : "text-cyber-red")}>
                               {stock.change >= 0 ? '+' : ''}{stock.change}%
                             </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <p className="text-[10px] font-bold uppercase tracking-widest">No matching neural assets found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isOperator && (
            <motion.button 
              onClick={generateStrategy}
              disabled={analyzingStrategy}
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 242, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyber-blue to-blue-600 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
            >
              {analyzingStrategy ? <RefreshCw className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
              {analyzingStrategy ? 'Synthesizing...' : 'RUN AI ANALYSIS'}
            </motion.button>
          )}
          
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <Bell size={24} className={cn(showNotifications ? "text-cyber-blue" : "text-slate-400")} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyber-red rounded-full text-[8px] font-black flex items-center justify-center text-white border-2 border-bg-deep animate-pulse">
                  {notifications.length}
                </span>
              )}
            </motion.div>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-96 bg-slate-950/98 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-[100] rounded-3xl overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOperator ? "bg-cyber-blue" : "bg-emerald-500")} />
                       {isOperator ? "Neural Logs" : "Activity Logs"}
                    </h3>
                    <button 
                      onClick={markAllRead}
                      className="text-[9px] font-black text-cyber-blue uppercase tracking-widest hover:text-white transition-colors"
                    >
                      CLEAR ALL
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No active logs in buffer</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-default text-left">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              n.type === 'order' ? "bg-cyber-blue/10 text-cyber-blue" : "bg-cyber-purple/10 text-cyber-purple"
                            )}>
                              {n.type === 'order' ? <Package size={14} /> : <TrendingUp size={14} />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black text-white uppercase tracking-tight">{n.title}</h4>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">{n.time}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-2 pt-2">
                                <span className={cn(
                                  "w-1 h-1 rounded-full",
                                  n.priority === 'high' ? "bg-cyber-red" : n.priority === 'medium' ? "bg-amber-400" : "bg-emerald-400"
                                )} />
                                <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">{n.priority} PRIORITY</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 bg-white/[0.02] flex justify-center border-t border-white/5">
                    <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-cyber-blue transition-colors">
                      VIEW ALL ACTIVITY →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* AI Intelligence Block */}
      <AnimatePresence>
        {strategyInsight && isOperator && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass p-8 bg-gradient-to-r from-cyber-purple/20 to-transparent border-cyber-purple/30 overflow-hidden mb-8"
          >
            <div className="flex items-start gap-8 text-left">
               <div className="w-16 h-16 rounded-3xl bg-cyber-purple/20 border border-cyber-purple/50 flex items-center justify-center shrink-0">
                  <BrainCircuit className="text-cyber-purple" size={32} />
               </div>
               <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                     <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{strategyInsight.title || 'NEURAL INSIGHT'}</h2>
                     <div className="flex gap-4">
                        <span className="text-[10px] font-black text-cyber-purple bg-cyber-purple/10 px-3 py-1 rounded-full border border-cyber-purple/20">CONFIDENCE: {strategyInsight.confidence || '94%'}</span>
                        <button onClick={() => setStrategyInsight(null)} className="text-slate-500 hover:text-white transition-colors">
                           <X size={20} />
                        </button>
                     </div>
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed max-w-4xl font-medium">{strategyInsight.analysis}</p>
                  <div className="flex gap-4 mt-6">
                     <button 
                      onClick={() => onAction?.("Strategic Pivot Approved: Network nodes re-synchronizing for optimal through-put.", "success")}
                      className="px-6 py-2.5 bg-cyber-purple text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-cyber-purple/20 hover:scale-105 transition-all"
                     >
                       APPROVE RE-ROUTE
                     </button>
                     <button 
                      onClick={() => setStrategyInsight(null)}
                      className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                     >
                       DISMISS
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extreme KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-8 relative group overflow-hidden"
          >
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2", kpi.color)} />
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-4 rounded-2xl bg-gradient-to-br shadow-xl", kpi.color)}>
                <kpi.icon className="text-white" size={24} />
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg border border-white/5",
                kpi.trend === 'up' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-500"
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {kpi.change}
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h4 className="text-3xl font-black text-white tracking-tighter tabular-nums">{kpi.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strategic Neural Instruments */}
      <section className="px-4 md:px-0">
         <StrategicInstruments />
      </section>


      {/* Main Grid: Map and Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <motion.div 
            whileHover={{ boxShadow: "0 0 50px rgba(0, 242, 255, 0.1)" }}
            className="glass flex flex-col h-[550px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 z-20">
               <div className="flex flex-col items-end gap-2">
                  {simulationEvents.slice(0, 3).map((evt: any) => (
                    <motion.div 
                      key={evt.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 bg-bg-deep/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-mono text-cyber-blue shadow-xl"
                    >
                      <span className="opacity-40">{new Date().toLocaleTimeString()}</span>
                      <span className="font-black tracking-widest uppercase">{evt.type || 'PULSE'}</span>
                      <span className="text-white">+{evt.value || '0.00'}%</span>
                    </motion.div>
                  ))}
               </div>
            </div>

            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] z-10 sticky top-0">
              <div className="flex flex-col text-left">
                <h3 className="text-lg font-black text-white tracking-widest uppercase flex items-center gap-3">
                  <Globe size={18} className="text-cyber-blue" /> ASSET GEOGRAPHY
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Telemetry Synchronized</span>
              </div>
              <div className="flex gap-3">
                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-black text-white focus:outline-none focus:border-cyber-blue transition-all">
                  <option>ALL REGIONS</option>
                  <option>PACIFIC RIM</option>
                  <option>EU CORRIDOR</option>
                </select>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                   <div className="w-1.5 h-1.5 bg-cyber-blue rounded-full animate-pulse" />
                   <span className="text-[10px] font-black text-cyber-blue uppercase tracking-widest text-left">REALTIME</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-black/40 relative">
               <WorldMap shipments={filteredShipments} />
               <div className="absolute bottom-6 left-6 flex gap-6 z-10">
                 <div className="flex items-center gap-3 bg-bg-deep/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="w-10 h-10 rounded-xl bg-cyber-blue/20 flex items-center justify-center">
                       <Truck className="text-cyber-blue" size={20} />
                    </div>
                    <div className="text-left">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IN TRANSIT</p>
                       <p className="text-lg font-black text-white leading-none">{shipments.filter(s => s.status === 'in-transit').length} UNITS</p>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>

          <ShipmentList shipments={filteredShipments} />
        </div>

        {/* Intelligence Sidebars */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {isOperator && <AIInsights compact contextData={{ shipments, inventory, pricing, sourcing, manufacturing }} />}
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass p-8 bg-black/40 border-white/5 flex flex-col h-full relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue via-transparent to-transparent opacity-30" />
            
            <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Newspaper className="text-amber-500" size={24} />
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">Flash Intelligence</h3>
                  </div>
                  <button 
                    onClick={() => onViewChange?.('intelligence')}
                    className="text-[10px] font-black text-cyber-blue uppercase tracking-widest hover:text-white transition-colors"
                  >
                    FULL INTEL →
                  </button>
               </div>
               
               <div className="space-y-8 text-left">
                  {[
                    { title: 'Global Logistics Index Hits Stability', time: '1h ago', category: 'logistics' },
                    { title: 'Silicon Carbide Demand Surges in Tech', time: '3h ago', category: 'tech' },
                    { title: 'Commodity Reserves Strategy Shift', time: '5h ago', category: 'commodity' },
                  ].map((news, i) => (
                    <div 
                      key={i} 
                      className="group cursor-pointer border-b border-white/5 pb-5 last:border-0 last:pb-0"
                      onClick={() => onViewChange?.('intelligence')}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          news.category === 'logistics' ? "bg-cyber-blue/10 text-cyber-blue" :
                          news.category === 'tech' ? "bg-cyber-purple/10 text-cyber-purple" :
                          "bg-amber-500/10 text-amber-500"
                        )}>{news.category}</span>
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{news.time}</span>
                      </div>
                      <h4 className="text-xs font-black text-white uppercase leading-tight group-hover:text-amber-400 transition-colors">
                        {news.title}
                      </h4>
                    </div>
                  ))}
               </div>
            </div>

            {/* Neural Ticker */}
            <div className="mt-10 overflow-hidden bg-white/5 rounded-xl py-3 border border-white/5">
                <motion.div 
                  className="flex whitespace-nowrap gap-8 px-4"
                  animate={{ x: [0, -1000] }}
                  transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                >
                   {systemProtocols.map((p, i) => (
                     <span key={i} className="text-[9px] font-bold font-mono text-emerald-500 uppercase tracking-widest opacity-60">
                       <span className="text-white/30 mr-2">[{i}]</span> {p}
                     </span>
                   ))}
                   {/* Duplicate for seamless loop */}
                   {systemProtocols.map((p, i) => (
                     <span key={`dup-${i}`} className="text-[9px] font-bold font-mono text-emerald-500 uppercase tracking-widest opacity-60">
                       <span className="text-white/30 mr-2">[{i}]</span> {p}
                     </span>
                   ))}
                </motion.div>
            </div>
            
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Neural Grid Connect</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-bg-deep border border-emerald-500/30 flex items-center justify-center">
                      <Globe size={20} className="text-emerald-500 animate-pulse" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-white tracking-widest uppercase">NODE OPTIMIZED</p>
                      <p className="text-[10px] font-bold text-emerald-500/80">LATENCY: 1.4ms</p>
                   </div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Professional Market Footer (TradingView Inspired) */}
      <footer className="mt-32 pt-20 pb-20 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 text-left">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Market Products</h4>
              <ul className="space-y-4">
                {['Supercharts', 'Stocks', 'ETFs', 'Bonds', 'Crypto pairs', 'CEX pairs', 'DEX pairs'].map(item => (
                  <li key={item}><a href="#" className="text-xs font-bold text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Tools & Subs</h4>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'Market data', 'Gift plans', 'Overview', 'Top brokers'].map(item => (
                  <li key={item}><a href="#" className="text-xs font-bold text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Community</h4>
              <ul className="space-y-4">
                {['Social network', 'Wall of Love', 'Refer a friend', 'House Rules', 'Moderators'].map(item => (
                  <li key={item}><a href="#" className="text-xs font-bold text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Policies</h4>
              <ul className="space-y-4">
                {['Terms of Use', 'Disclaimer', 'Privacy Policy', 'Cookies Policy', 'Security tips', 'Status page'].map(item => (
                  <li key={item}><a href="#" className="text-xs font-bold text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest">{item}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Solutions</h4>
              <ul className="space-y-4">
                {['Widgets', 'Charting libraries', 'Lightweight Charts', 'Advanced Charts', 'Trading Platform'].map(item => (
                  <li key={item}><a href="#" className="text-xs font-bold text-slate-500 hover:text-cyber-blue transition-colors uppercase tracking-widest">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-white tracking-widest italic text-xs">AI</div>
               <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">NEURAL TERMINAL v4.2</p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.3em] mt-1">© 2026 LOGISTICS CORE • LOOK FIRST / THEN LEAP.</p>
               </div>
            </div>
            <div className="flex gap-6">
               {[Globe, MessageSquare, Bell].map((Icon, i) => (
                 <a key={i} href="#" className="text-slate-600 hover:text-white transition-colors">
                    <Icon size={18} />
                 </a>
               ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
