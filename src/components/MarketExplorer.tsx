import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Filter, ShoppingCart, Info, Activity, Globe, Zap, Plus, Minus, X, Check, Calendar, BarChart3, Clock, RefreshCw, Newspaper } from 'lucide-react';
import { MarketStock, ClientOrder, Shipment, InventoryItem } from '../types';
import { collection, query, getDocs, limit, addDoc, doc, getDoc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { StockNewsFeed } from './StockNews';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Bar, ComposedChart } from 'recharts';
import { GLOBAL_MARKET_ASSETS } from '../data/marketData';

interface MarketExplorerProps {
  startingTicker?: string;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({ startingTicker }) => {
  const [stocks, setStocks] = useState<MarketStock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  
  // Trading State
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);
  const [analyticsStock, setAnalyticsStock] = useState<MarketStock | null>(null);

  useEffect(() => {
    if (startingTicker && stocks.length > 0) {
      const found = stocks.find(s => s.ticker === startingTicker);
      if (found) {
        setAnalyticsStock(found);
        // Scroll to top or clear search to ensure it's visible if needed, 
        // though analytics modal covers the screen anyway.
      }
    }
  }, [startingTicker, stocks]);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Mock Historical Data Generator
  const chartData = useMemo(() => {
    if (!analyticsStock) return [];
    
    const data = [];
    let currentPrice = analyticsStock.price * 0.9;
    const points = 30; // 30 days
    
    for (let i = points; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const volatility = currentPrice * 0.02;
      currentPrice += (Math.random() - 0.45) * volatility;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.floor(currentPrice),
        volume: Math.floor(Math.random() * 50000) + 10000
      });
    }
    
    // Ensure last point matches current price
    data[data.length - 1].price = analyticsStock.price;
    return data;
  }, [analyticsStock]);

  const mtdPerformance = useMemo(() => {
    if (!chartData.length) return 0;
    const startPrice = chartData[0].price;
    const endPrice = chartData[chartData.length - 1].price;
    return (((endPrice - startPrice) / startPrice) * 100).toFixed(2);
  }, [chartData]);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'market_stocks'), limit(250)));
        if (snap.empty) {
          setStocks(GLOBAL_MARKET_ASSETS);
        } else {
          setStocks(snap.docs.map(doc => ({ ...doc.data() as MarketStock, id: doc.id })));
        }
      } catch (err) {
        console.error("Market load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, []);

  const [seeding, setSeeding] = useState(false);
  const seedMarket = async () => {
    setSeeding(true);
    try {
      for (const stock of GLOBAL_MARKET_ASSETS) {
        await addDoc(collection(db, 'market_stocks'), stock);
      }
      
      const snap = await getDocs(query(collection(db, 'market_stocks'), limit(250)));
      setStocks(snap.docs.map(doc => ({ ...doc.data() as MarketStock, id: doc.id })));
    } catch (err) {
       console.error("Seed error:", err);
    } finally {
      setSeeding(false);
    }
  };

  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!auth.currentUser) return;
      try {
        const profileSnap = await getDoc(doc(db, 'client_profiles', auth.currentUser.uid));
        if (profileSnap.exists()) {
          setBalance(profileSnap.data().balance || 0);
        }
      } catch (err) {
        console.error("Balance fetch error:", err);
      }
    };
    fetchBalance();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedStock || !auth.currentUser) return;
    
    const totalValue = selectedStock.price * orderQuantity;
    setOrderProcessing(true);
    try {
      // Check and update balance
      const profileRef = doc(db, 'client_profiles', auth.currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        throw new Error("Neural Profile not found.");
      }

      const currentBalance = profileSnap.data().balance;
      
      if (orderType === 'buy' && currentBalance < totalValue) {
        throw new Error("Insufficient neural credits for this transaction.");
      }

      const newBalance = orderType === 'buy' ? currentBalance - totalValue : currentBalance + totalValue;

      // PRE-ORDER VALIDATION FOR SELL: Check if user owns the asset
      if (orderType === 'sell') {
        const invQuery = query(
          collection(db, 'inventory'),
          where('clientId', '==', auth.currentUser.uid),
          where('name', '==', selectedStock.name),
          limit(1)
        );
        const invSnap = await getDocs(invQuery);
        
        if (invSnap.empty) {
          throw new Error(`Insufficient holdings: You do not own ${selectedStock.name}. Purchase required before disposal.`);
        }
        
        const currentInv = invSnap.docs[0].data() as InventoryItem;
        if (currentInv.stockLevel < orderQuantity) {
          throw new Error(`Insufficient quantity: You only have ${currentInv.stockLevel} units of ${selectedStock.name}.`);
        }
      }

      const orderData: Omit<ClientOrder, 'id'> = {
        clientId: auth.currentUser.uid,
        stockId: selectedStock.id,
        ticker: selectedStock.ticker,
        type: orderType,
        quantity: orderQuantity,
        price: selectedStock.price,
        total: totalValue,
        status: 'filled',
        timestamp: Date.now()
      };
      
      await addDoc(collection(db, 'client_orders'), orderData);
      
      // Track Physical Asset or Logistics for buys/sells
      if (orderType === 'buy' && (
        selectedStock.category === 'Physical Assets' || 
        selectedStock.category === 'Logistics' || 
        selectedStock.category === 'Raw Materials' || 
        selectedStock.category === 'Semiconductors' || 
        selectedStock.category === 'India Core' || 
        selectedStock.category === 'Global Tech' ||
        selectedStock.category === 'Automotive'
      )) {
        // Create Shipment record for buys
        const shipmentData: Omit<Shipment, 'id'> = {
          clientId: auth.currentUser.uid,
          origin: 'Nexus Global Distribution Hub',
          destination: profileSnap.data().address || 'Regional Client Node',
          status: 'pending',
          eta: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)).toISOString(),
          lastUpdated: new Date().toISOString(),
          priority: 'medium',
          carrier: 'Nexus Neural Logistics',
          history: [
            { timestamp: new Date().toISOString(), status: 'pending', message: 'Order synchronized. Preparing for node distribution.' }
          ]
        };
        await addDoc(collection(db, 'shipments'), shipmentData);

        // Create Inventory record for tangible assets
        const isService = selectedStock.category === 'Logistics';
        if (!isService) {
          const inventoryData: Omit<InventoryItem, 'id'> = {
            clientId: auth.currentUser.uid,
            name: selectedStock.name,
            stockLevel: orderQuantity,
            warehouse: 'Autonomous Facility Alpha',
            reorderPoint: 5,
            category: selectedStock.category,
            unitPrice: selectedStock.price
          };
          await addDoc(collection(db, 'inventory'), inventoryData);
        }
      } else if (orderType === 'sell') {
        // Logic for reducing inventory if it's a physical asset
        const isService = selectedStock.category === 'Logistics';
        if (!isService) {
          const invQuery = query(
            collection(db, 'inventory'),
            where('clientId', '==', auth.currentUser.uid),
            where('name', '==', selectedStock.name),
            limit(1)
          );
          const invSnap = await getDocs(invQuery);
          if (!invSnap.empty) {
             const invDoc = invSnap.docs[0];
             const currentStock = invDoc.data().stockLevel;
             if (currentStock <= orderQuantity) {
               await deleteDoc(doc(db, 'inventory', invDoc.id));
             } else {
               await setDoc(doc(db, 'inventory', invDoc.id), { stockLevel: currentStock - orderQuantity }, { merge: true });
             }
          }
        }
      }
      
      // Update balance in DB
      await setDoc(profileRef, { balance: newBalance }, { merge: true });
      
      // Update local balance state
      setBalance(newBalance);

      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedStock(null);
        setOrderQuantity(1);
      }, 2000);
    } catch (err: any) {
      console.error("Order error:", err);
      alert(err.message || "Order execution failed.");
    } finally {
      setOrderProcessing(false);
    }
  };

  const filteredStocks = stocks.filter(s => 
    ((s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (s.ticker?.toLowerCase() || '').includes(searchTerm.toLowerCase())) &&
    (category === 'all' || s.category === category)
  );

  const categories: string[] = ['all', ...Array.from(new Set(stocks.map(s => s.category)))];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="text-left">
          <h2 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.4em] mb-1">Global Terminal</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Market Explorer</h1>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
          <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Neural Credits</span>
            <span className="text-sm font-mono font-black text-cyber-blue leading-none">${balance.toLocaleString()}</span>
          </div>
          {stocks.length < 10 && (
            <button 
              onClick={seedMarket}
              disabled={seeding}
              className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2"
            >
              {seeding ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />} 
              {seeding ? 'Syncing...' : 'Index Global Assets'}
            </button>
          )}
          <div className="relative flex-1 md:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-blue transition-colors" size={16} />
             <input 
               type="text" 
               placeholder="Search assets, tickers, nodes..."
               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyber-blue/20 focus:border-cyber-blue/40 transition-all font-mono"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
             <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest self-center shrink-0">Recent Trends:</span>
             {['NVDA', 'RELIANCE', 'HSCL', 'BTCUSD', 'GOLD-X'].map(t => (
               <button 
                key={t}
                onClick={() => setSearchTerm(t)}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest hover:border-cyber-blue hover:text-white transition-all shrink-0"
               >
                 {t}
               </button>
             ))}
          </div>
          
          <div className="flex gap-2">
             {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setCategory(cat)}
                 className={cn(
                   "px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                   category === cat 
                    ? "bg-cyber-blue text-black border-cyber-blue shadow-lg shadow-cyber-blue/20" 
                    : "bg-white/5 text-slate-500 border-white/10 hover:border-white/30 hover:text-white"
                 )}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>
      </header>

      <div className="pt-12 pb-6 border-b border-white/10 flex justify-between items-end">
         <div>
            <h2 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.4em] mb-1">Asset Registry</h2>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Tradeable Nodes</h1>
         </div>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">
            Showing {filteredStocks.length} of {stocks.length} assets
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredStocks.map((stock, i) => (
            <motion.div 
              layout
              key={stock.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              className="glass p-8 group relative overflow-hidden bg-white/[0.01] border-white/5 hover:border-cyber-blue/20 transition-all"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Activity size={60} />
              </div>
              
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <span className="px-3 py-1 bg-cyber-blue/10 border border-cyber-blue/20 rounded-lg text-[9px] font-black text-cyber-blue uppercase tracking-widest mb-3 inline-block">
                       {stock.ticker}
                    </span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{stock.name}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stock.category}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black text-white tabular-nums">${stock.price.toLocaleString()}</p>
                    <div className={cn(
                      "flex items-center justify-end gap-1 text-[10px] font-black uppercase mt-1",
                      stock.change >= 0 ? "text-emerald-400" : "text-cyber-red"
                    )}>
                       {stock.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                       {Math.abs(stock.change)}%
                    </div>
                 </div>
              </div>

              <p className="text-xs font-medium text-slate-400 leading-relaxed mb-8 border-l-2 border-white/5 pl-4 line-clamp-2">
                {stock.description}
              </p>

              <div className="flex gap-4">
                 <button 
                  onClick={() => setAnalyticsStock(stock)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-cyber-blue hover:text-cyber-blue transition-all flex items-center justify-center gap-2"
                 >
                    <Info size={14} /> ANALYTICS
                 </button>
                 <button 
                  onClick={() => setSelectedStock(stock)}
                  className="flex-1 py-4 bg-cyber-blue text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyber-blue/10 hover:scale-105 transition-all flex items-center justify-center gap-2"
                 >
                    <ShoppingCart size={14} /> TRADE
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredStocks.length === 0 && (
        <div className="py-40 text-center glass border-dashed border-white/10">
           <Globe size={48} className="mx-auto text-slate-700 mb-6 animate-pulse" />
           <h3 className="text-2xl font-black text-white uppercase tracking-widest">No Assets Found</h3>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">The logistical network could not find matching telemetry for your search.</p>
        </div>
      )}

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setAnalyticsStock(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] glass p-0 bg-slate-950 border-white/10 shadow-[0_0_100px_rgba(0,242,255,0.1)] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 lg:px-10 py-6 border-b border-white/10 bg-white/[0.02] shrink-0">
                 <div className="flex items-center gap-4 lg:gap-6">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center text-cyber-blue shrink-0">
                       <BarChart3 size={24} className="lg:hidden" />
                       <BarChart3 size={28} className="hidden lg:block" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 lg:gap-3 mb-1">
                          <h3 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter">{analyticsStock.name}</h3>
                          <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {analyticsStock.ticker}
                          </span>
                       </div>
                       <p className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Market Statistics • Terminal Active</p>
                    </div>
                 </div>
                 <button onClick={() => setAnalyticsStock(null)} className="p-3 lg:p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all shrink-0">
                    <X size={20} className="lg:hidden" />
                    <X size={24} className="hidden lg:block" />
                 </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 overflow-y-auto custom-scrollbar">
                 {/* Main Analytics Content */}
                 <div className="lg:col-span-2 p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 lg:mb-10">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Live Valuation</span>
                          <div className="flex items-baseline gap-4">
                             <h4 className="text-3xl lg:text-5xl font-black text-white tabular-nums">${analyticsStock.price.toLocaleString()}</h4>
                             <div className={cn(
                                "flex items-center gap-1 text-sm font-black uppercase",
                                analyticsStock.change >= 0 ? "text-emerald-400" : "text-cyber-red"
                             )}>
                                {analyticsStock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {Math.abs(analyticsStock.change)}%
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-3 lg:gap-4 w-full sm:w-auto">
                          <div className="flex-1 sm:flex-none p-3 lg:p-4 bg-white/5 border border-white/10 rounded-2xl text-center sm:min-w-[120px]">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">MTD Gain</p>
                             <p className={cn("text-base lg:text-lg font-black tabular-nums", Number(mtdPerformance) >= 0 ? "text-emerald-400" : "text-cyber-red")}>
                                {Number(mtdPerformance) >= 0 ? '+' : ''}{mtdPerformance}%
                             </p>
                          </div>
                          <div className="flex-1 sm:flex-none p-3 lg:p-4 bg-white/5 border border-white/10 rounded-2xl text-center sm:min-w-[120px]">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Volatility</p>
                             <p className="text-base lg:text-lg font-black text-white tabular-nums">2.4%</p>
                          </div>
                       </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-[300px] lg:h-[400px] w-full mb-8 lg:mb-10 bg-white/[0.01] rounded-3xl border border-white/5 p-4 lg:p-6">
                       <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData}>
                             <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                             <XAxis 
                                dataKey="date" 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                dy={10}
                             />
                             <YAxis 
                                yAxisId="left"
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                dx={-10}
                                tickFormatter={(val) => `$${val}`}
                             />
                             <YAxis 
                                yAxisId="right"
                                orientation="right"
                                stroke="#64748b" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                dx={10}
                                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                             />
                             <Tooltip 
                                contentStyle={{ 
                                   backgroundColor: '#020617', 
                                   border: '1px solid #ffffff10', 
                                   borderRadius: '16px',
                                   fontSize: '12px',
                                   fontFamily: 'monospace'
                                }}
                                itemStyle={{ color: '#00f2ff', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                             />
                             <Area 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="price" 
                                stroke="#00f2ff" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                                animationDuration={2000}
                             />
                             <Bar 
                                yAxisId="right"
                                dataKey="volume" 
                                fill="#ffffff" 
                                fillOpacity={0.1}
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                             />
                          </ComposedChart>
                       </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 lg:mb-10">
                       <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                             <TrendingUp size={14} className="text-emerald-400" /> Neural Forecast
                          </h5>
                          <div className="glass p-6 border-white/5 bg-white/[0.01]">
                             <p className="text-xs text-slate-400 leading-relaxed italic">
                                "Predictive models indicate a 74% probability of bullish momentum within the next 48-hour trading window. High correlation detected with regional energy spikes."
                             </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Sentiment</p>
                                <p className="text-sm font-black text-emerald-400">OPTIMISTIC</p>
                             </div>
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Neural Flow</p>
                                <p className="text-sm font-black text-cyber-blue">STEADY</p>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                             <Clock size={14} className="text-cyber-blue" /> Trade Window
                          </h5>
                          <div className="flex items-center gap-4">
                             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                <p className="text-[10px] font-black text-white uppercase">US Markets</p>
                                <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1 animate-pulse">Online</p>
                             </div>
                             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                <p className="text-[10px] font-black text-white uppercase">EU Markets</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Standby</p>
                             </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-500 uppercase">Closing in</span>
                             <span className="text-xs font-mono font-black text-white">04:12:33</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h5 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                          <Newspaper size={14} className="text-amber-500" /> Related Intelligence
                       </h5>
                       <StockNewsFeed symbol={analyticsStock.ticker} />
                    </div>
                 </div>

                 {/* Sidebar Info */}
                 <div className="bg-white/[0.02] p-10 flex flex-col">
                    <div className="space-y-8 flex-1">
                       <div>
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Description</h5>
                          <p className="text-sm text-slate-300 leading-relaxed font-medium">
                             {analyticsStock.description}
                          </p>
                       </div>

                       <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Stats</h5>
                          <div className="space-y-3">
                             {[
                                { label: '24h High', val: `$${Math.floor(analyticsStock.price * 1.05).toLocaleString()}` },
                                { label: '24h Low', val: `$${Math.floor(analyticsStock.price * 0.95).toLocaleString()}` },
                                { label: 'Avg Volume', val: analyticsStock.volume },
                                { label: 'Market Cap', val: `$${(analyticsStock.price * 1000000).toLocaleString()}` },
                                { label: 'Circulating', val: '4.2M Nodes' }
                             ].map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                   <span className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</span>
                                   <span className="text-xs font-black text-white tabular-nums">{stat.val}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/10">
                       <button 
                        onClick={() => {
                          setSelectedStock(analyticsStock);
                          setAnalyticsStock(null);
                        }}
                        className="w-full py-5 bg-cyber-blue text-black rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_50px_rgba(0,242,255,0.2)] hover:scale-105 transition-all flex items-center justify-center gap-3"
                       >
                          <ShoppingCart size={18} /> OPEN TRADE DESK
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Trading Modal */}
      <AnimatePresence>
        {selectedStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => !orderProcessing && setSelectedStock(null)}
               className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass p-10 bg-slate-950 border-white/10 shadow-[0_0_100px_rgba(0,242,255,0.1)]"
            >
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Execute Trade</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">{selectedStock.name} ({selectedStock.ticker})</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Available Credits</p>
                       <p className="text-sm font-mono font-black text-cyber-blue leading-none">${balance.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setSelectedStock(null)} className="p-2 text-slate-500 hover:text-white transition-colors">
                       <X size={24} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <button 
                  onClick={() => setOrderType('buy')}
                  className={cn(
                    "py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                    orderType === 'buy' ? "bg-emerald-500 text-black border-emerald-500" : "bg-white/5 text-emerald-500 border-white/10 hover:border-emerald-500/30"
                  )}
                 >
                   BUY
                 </button>
                 <button 
                  onClick={() => setOrderType('sell')}
                  className={cn(
                    "py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all",
                    orderType === 'sell' ? "bg-cyber-red text-white border-cyber-red" : "bg-white/5 text-cyber-red border-white/10 hover:border-cyber-red/30"
                  )}
                 >
                   SELL
                 </button>
              </div>

              <div className="space-y-6 mb-10">
                 <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Price</span>
                    <span className="text-xl font-black text-white tabular-nums">${selectedStock.price.toLocaleString()}</span>
                 </div>
                 
                 <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</span>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                             <Minus size={14} />
                          </button>
                          <span className="text-xl font-black text-white w-12 text-center tabular-nums">{orderQuantity}</span>
                          <button 
                            onClick={() => setOrderQuantity(orderQuantity + 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                          >
                             <Plus size={14} />
                          </button>
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Total</span>
                       <span className="text-xl font-black text-cyber-blue tabular-nums">${(selectedStock.price * orderQuantity).toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <button 
                disabled={orderProcessing || orderSuccess}
                onClick={handlePlaceOrder}
                className={cn(
                  "w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all relative overflow-hidden",
                  orderSuccess ? "bg-emerald-500 text-black" :
                  orderType === 'buy' ? "bg-cyber-blue text-black shadow-[0_0_30px_rgba(0,242,255,0.2)]" : "bg-cyber-red text-white"
                )}
              >
                {orderProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="animate-spin" size={16} /> PROCESSING...
                  </div>
                ) : orderSuccess ? (
                  <div className="flex items-center justify-center gap-2 animate-in zoom-in-95">
                    <Check size={16} /> ORDER FILLED
                  </div>
                ) : (
                  `EXECUTE ${orderType === 'buy' ? 'PURCHASE' : 'DISPOSAL'}`
                )}
              </button>
              
              <p className="text-[9px] text-center font-bold text-slate-600 uppercase tracking-widest mt-6">
                Direct market link established. Market slippage may apply.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Market Status Bar */}
      <footer className="pt-20 pb-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Terminal Synchronized: 14,248 Nodes Online</span>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Asset Flux</p>
               <p className="text-sm font-black text-white tabular-nums">$241,502,120,400.00</p>
            </div>
            <div className="text-right border-l border-white/10 pl-8">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Terminal Latency</p>
               <p className="text-sm font-black text-cyber-blue tabular-nums">1.2ms</p>
            </div>
         </div>
      </footer>
    </div>
  );
};
