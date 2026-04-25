import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Activity, Zap, Plus, Minus, X, Check, Clock, Package, Briefcase, Download } from 'lucide-react';
import { MarketStock, ClientOrder, Shipment, InventoryItem } from '../types';
import { collection, query, getDocs, limit, addDoc, doc, getDoc, setDoc, deleteDoc, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Holdings: React.FC = () => {
  const [stocks, setStocks] = useState<MarketStock[]>([]);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const openTradeModal = (stock: MarketStock, type: 'buy' | 'sell') => {
    setSelectedStock(stock);
    setOrderType(type);
    setOrderQuantity(1);
    setOrderSuccess(false);
  };

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    // 1. Real-time Stocks Listener
    const unsubStocks = onSnapshot(collection(db, 'market_stocks'), (snap) => {
      const allStocks = snap.docs.map(doc => ({ ...doc.data() as MarketStock, id: doc.id }));
      setStocks(allStocks);
      setLoading(false);
    });

    // 2. Real-time Orders Listener (History & Holdings Calculation)
    const ordersQuery = query(collection(db, 'client_orders'), where('clientId', '==', auth.currentUser.uid));
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      const userOrders = snap.docs.map(doc => ({ ...doc.data() as ClientOrder, id: doc.id }));
      setOrders(userOrders);
    });

    // 3. Real-time Balance/Profile Listener
    const unsubProfile = onSnapshot(doc(db, 'client_profiles', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        setBalance(snap.data().balance || 0);
      }
    });

    return () => {
      unsubStocks();
      unsubOrders();
      unsubProfile();
    };
  }, []);

  // Calculate current holdings from order history
  const holdingsMap = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(order => {
      const ticker = order.ticker;
      if (!map[ticker]) map[ticker] = 0;
      if (order.type === 'buy') {
        map[ticker] += order.quantity;
      } else {
        map[ticker] -= order.quantity;
      }
    });
    return map;
  }, [orders]);

  const ownedStocks = useMemo(() => {
    // Collect all tickers where the user has a positive balance from ledger math
    const ownedTickers = Object.keys(holdingsMap).filter(ticker => holdingsMap[ticker] > 0);
    
    return ownedTickers.map(ticker => {
      // Find matching market definition
      const marketStock = stocks.find(s => s.ticker === ticker);
      if (marketStock) return marketStock;

      // Create a virtual stock object if market definition is currently missing
      return {
        id: `unknown-${ticker}`,
        name: `Asset Node ${ticker}`,
        ticker: ticker,
        price: orders.filter(o => o.ticker === ticker).sort((a,b) => b.timestamp - a.timestamp)[0]?.price || 0,
        change: 0,
        volume: 'N/A',
        category: 'Unindexed',
        description: 'Asset node telemetry synchronization in progress.'
      } as MarketStock;
    });
  }, [stocks, holdingsMap, orders]);

  const portfolioValue = useMemo(() => {
    return ownedStocks.reduce((total, stock) => {
      const quantity = holdingsMap[stock.ticker] || 0;
      return total + (stock.price * quantity);
    }, 0);
  }, [ownedStocks, holdingsMap]);

  const filteredOwnedStocks = ownedStocks.filter(s => 
    (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (s.ticker?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handlePlaceOrder = async () => {
    if (!selectedStock || !auth.currentUser) return;
    
    const totalValue = selectedStock.price * orderQuantity;
    setOrderProcessing(true);
    try {
      const profileRef = doc(db, 'client_profiles', auth.currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        throw new Error("Client profile synchronization failure.");
      }

      const currentBalance = profileSnap.data().balance;
      
      if (orderType === 'buy' && currentBalance < totalValue) {
        throw new Error("Insufficient neural credits for this transaction.");
      }

      const currentHolding = holdingsMap[selectedStock.ticker] || 0;
      if (orderType === 'sell' && currentHolding < orderQuantity) {
        throw new Error(`Insufficient holdings: You only have ${currentHolding} units.`);
      }

      const newBalance = orderType === 'buy' ? currentBalance - totalValue : currentBalance + totalValue;

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
      
      // Update inventory (optional but good for consistency with other parts of the app)
      const invQuery = query(
        collection(db, 'inventory'),
        where('clientId', '==', auth.currentUser.uid),
        where('name', '==', selectedStock.name),
        limit(1)
      );
      const invSnap = await getDocs(invQuery);
      
      if (orderType === 'buy') {
        if (invSnap.empty) {
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
        } else {
            const invDoc = invSnap.docs[0];
            await setDoc(doc(db, 'inventory', invDoc.id), { stockLevel: invDoc.data().stockLevel + orderQuantity }, { merge: true });
        }
      } else {
        if (!invSnap.empty) {
          const invDoc = invSnap.docs[0];
          const updatedLevel = Math.max(0, invDoc.data().stockLevel - orderQuantity);
          if (updatedLevel === 0) {
            await deleteDoc(doc(db, 'inventory', invDoc.id));
          } else {
            await setDoc(doc(db, 'inventory', invDoc.id), { stockLevel: updatedLevel }, { merge: true });
          }
        }
      }
      
      // Create Shipment record for buys (Logistics simulation)
      if (orderType === 'buy') {
        const profileSnap = await getDoc(profileRef);
        const shipmentData: Omit<Shipment, 'id'> = {
          clientId: auth.currentUser.uid,
          origin: 'Nexus Global Distribution Hub',
          destination: profileSnap.data()?.address || 'Regional Client Node',
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
      }

      await setDoc(profileRef, { balance: newBalance }, { merge: true });

      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedStock(null);
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Order execution failed.");
    } finally {
      setOrderProcessing(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-cyber-blue animate-pulse">Initializing Asset Registry...</div>;

  return (
    <div className="space-y-12">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.4em]">Asset Control</h2>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Manage Holdings</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4">Real-time valuation of your acquired neural nodes and commodities</p>
        </div>
        
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex gap-4">
            <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col min-w-[200px]">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Briefcase size={10} className="text-cyber-blue" /> Total Equity Value
              </span>
              <span className="text-xl font-mono font-black text-white leading-none">${portfolioValue.toLocaleString()}</span>
            </div>
            
            <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col min-w-[200px]">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={10} className="text-amber-500" /> Neural Credits
              </span>
              <span className="text-xl font-mono font-black text-cyber-blue leading-none">${balance.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyber-blue transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH OWNED ASSETS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-cyber-blue/50 transition-all text-white placeholder:text-slate-600"
            />
          </div>
        </div>
      </header>

      {ownedStocks.length === 0 ? (
        <div className="py-32 text-center glass border-dashed border-white/10">
          <Briefcase size={40} className="mx-auto text-slate-700 mb-6" />
          <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Zero active node allocations detected in your portfolio.</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2 px-10 max-w-lg mx-auto">
            Access the Market Explorer to acquire global logistic assets and physical commodities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredOwnedStocks.map((stock, i) => {
              const quantity = holdingsMap[stock.ticker] || 0;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  key={stock.id}
                  className="glass group relative overflow-hidden flex flex-col h-full hover:border-cyber-blue/30 transition-all duration-500"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/5 blur-3xl -mr-16 -mt-16 group-hover:bg-cyber-blue/10 transition-all duration-700 pointer-events-none" />
                  
                  <div className="p-8 pb-4 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-400 uppercase tracking-widest rounded">
                            {stock.category}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-cyber-blue transition-colors">{stock.name}</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{stock.ticker}</p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "flex items-center gap-1 font-mono font-black text-xs",
                          stock.change >= 0 ? "text-emerald-400" : "text-cyber-red"
                        )}>
                          {stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(stock.change).toFixed(2)}%
                        </div>
                        <div className="text-xl font-mono font-black text-white mt-1">
                          ${stock.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Holding</span>
                            <span className="text-sm font-mono font-black text-white">{quantity} UNITS</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Post-Equity Value</span>
                            <span className="text-sm font-mono font-black text-emerald-400">
                                ${(quantity * stock.price).toLocaleString()}
                            </span>
                        </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 mt-auto flex gap-3">
                    <button 
                      onClick={() => openTradeModal(stock, 'buy')}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-2 group/btn"
                    >
                      <Plus size={14} className="text-cyber-blue group-hover/btn:scale-125 transition-transform" /> 
                      BUY
                    </button>
                    <button 
                      onClick={() => openTradeModal(stock, 'sell')}
                      className="flex-1 py-4 bg-cyber-red/10 hover:bg-cyber-red/20 text-cyber-red rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-cyber-red/20 flex items-center justify-center gap-2 group/btn"
                    >
                      <Minus size={14} className="group-hover/btn:scale-125 transition-transform" /> 
                      SELL
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Trade Modal (Clone from MarketExplorer for consistency) */}
      <AnimatePresence>
        {selectedStock && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStock(null)}
              className="absolute inset-0 bg-bg-deep/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl glass p-10 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h2 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.4em] mb-1">Asset Action</h2>
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
                     "py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border",
                     orderType === 'buy' ? "bg-white text-black border-white" : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                   )}
                 >
                    <Plus size={20} />
                    Accumulate
                 </button>
                 <button 
                   onClick={() => setOrderType('sell')}
                   className={cn(
                     "py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border",
                     orderType === 'sell' ? "bg-cyber-red/20 text-cyber-red border-cyber-red/30 shadow-[0_0_20px_rgba(255,62,62,0.1)]" : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                   )}
                 >
                    <Minus size={20} />
                    Liquidate
                 </button>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 mb-10 space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Asset Price</span>
                    <span className="text-xl font-mono font-black text-white">${selectedStock.price.toLocaleString()}</span>
                 </div>

                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Current Holding</span>
                    <span className="text-sm font-mono font-black text-slate-400">{holdingsMap[selectedStock.ticker] || 0} UNITS</span>
                 </div>
                 
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Node Quantity</span>
                    <div className="flex items-center gap-6">
                       <button onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-all">
                          <Minus size={18} />
                       </button>
                       <span className="text-2xl font-mono font-black text-white w-12 text-center">{orderQuantity}</span>
                       <button onClick={() => setOrderQuantity(orderQuantity + 1)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-all">
                          <Plus size={18} />
                       </button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Neural Total</span>
                    <span className="text-2xl font-mono font-black text-cyber-blue">${(selectedStock.price * orderQuantity).toLocaleString()}</span>
                 </div>
              </div>

              <button 
                disabled={orderProcessing}
                onClick={handlePlaceOrder}
                className={cn(
                  "w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                  orderType === 'buy' ? "bg-white text-black hover:bg-slate-200" : "bg-cyber-red text-white hover:bg-red-600",
                  orderProcessing && "opacity-50 cursor-not-allowed"
                )}
              >
                 {orderProcessing ? (
                   <>
                     <Activity className="animate-spin" size={18} />
                     SYNCHRONIZING WITH LEDGER...
                   </>
                 ) : orderSuccess ? (
                   <>
                     <Check size={18} />
                     TRANSACTION CONFIRMED
                   </>
                 ) : (
                   <>
                     <Zap size={18} />
                     INITIATE {orderType === 'buy' ? 'PURCHASE' : 'LIQUIDATION'}
                   </>
                 )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transaction Ledger Tracking */}
      <section className="pt-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
           <div>
              <h2 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.4em] mb-2">Portfolio Ledger</h2>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Verified Purchase History</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Real-time tracking of all neutral node acquisitions and liquidations</p>
           </div>
           <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-white/30 transition-all flex items-center gap-2">
              <Download size={14} className="text-cyber-blue" /> Download Ledger
           </button>
        </div>

        <div className="glass overflow-hidden bg-white/[0.01]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Node</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Operation</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Volume</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Unit Flux</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total Equity</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Network Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15).map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-cyber-blue group-hover:scale-110 transition-transform">
                          {order.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tighter">{order.ticker}</p>
                          <p className="text-[9px] font-bold text-slate-600 uppercase">Sector Index Active</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col gap-2 items-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-block mb-1",
                          order.type === 'buy' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-cyber-red/10 text-cyber-red border-cyber-red/20"
                        )}>
                          {order.type}
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const stock = stocks.find(s => s.ticker === order.ticker || s.id === order.stockId);
                              if (stock) {
                                openTradeModal(stock, 'buy');
                              } else {
                                alert("Sync Error: Asset node definition not found in registry.");
                              }
                            }}
                            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[8px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-1"
                          >
                            <Plus size={10} className="text-cyber-blue" /> BUY
                          </button>
                          <button 
                            onClick={() => {
                              const stock = stocks.find(s => s.ticker === order.ticker || s.id === order.stockId);
                              if (stock) {
                                openTradeModal(stock, 'sell');
                              } else {
                                alert("Sync Error: Asset node definition not found in registry.");
                              }
                            }}
                            className="px-3 py-1 bg-cyber-red/10 hover:bg-cyber-red/20 text-cyber-red rounded-lg text-[8px] font-black uppercase tracking-widest border border-cyber-red/20 transition-all flex items-center gap-1"
                          >
                            <Minus size={10} /> SELL
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-sm text-white font-black uppercase">
                      {order.quantity} Nodes
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-xs text-slate-400">
                      ${order.price.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-sm text-cyber-blue font-black">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-[10px] text-slate-700 italic">
                      {new Date(order.timestamp).toLocaleString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                       <Activity size={40} className="mx-auto text-slate-800 mb-6" />
                       <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Neural Ledger is currently empty. Initiate market action to populate.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
