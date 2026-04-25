import React, { useState, useEffect, useMemo } from 'react';
import { Newspaper, Clock, ExternalLink, TrendingUp, TrendingDown, Activity, Globe, Zap, BarChart3, Shield, Info } from 'lucide-react';
import { MarketStock, ClientOrder, StockNews } from '../types';
import { collection, query, getDocs, limit, orderBy, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { MarketSummary } from './MarketSummary';
import { TodaysSummary } from './TodaysSummary';

export const PortfolioIntelligence: React.FC = () => {
  const [stocks, setStocks] = useState<MarketStock[]>([]);
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [news, setNews] = useState<StockNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);

    // 1. Real-time Stocks
    const unsubStocks = onSnapshot(collection(db, 'market_stocks'), (snap) => {
      setStocks(snap.docs.map(doc => ({ ...doc.data() as MarketStock, id: doc.id })));
    });

    // 2. Real-time Orders (to know portfolio relevance)
    const ordersQuery = query(collection(db, 'client_orders'), where('clientId', '==', auth.currentUser.uid));
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map(doc => ({ ...doc.data() as ClientOrder, id: doc.id })));
    });

    // 3. News Feed
    const fetchNews = async () => {
      try {
        const newsQuery = query(collection(db, 'stock_news'), orderBy('timestamp', 'desc'), limit(30));
        const snap = await getDocs(newsQuery);
        if (snap.empty) {
          // Fallback mock news if DB is empty
          const mockNews: StockNews[] = [
            { id: '1', title: 'Global Logistics Index Hits Post-Correction Stability', summary: 'Shipping lanes in the North Atlantic are showing increased efficiency as neural routing algorithms decrease transit latency.', source: 'Logistics Insider', timestamp: Date.now() - 3600000, url: '#', category: 'logistics' },
            { id: '2', title: 'Silicon Carbide Demand Surges in Renewables', summary: 'Next-gen power converters are driving massive adoption of SiC tech, benefiting regional manufacturing nodes.', source: 'Tech Pulse', timestamp: Date.now() - 7200000, url: '#', category: 'tech', symbol: 'NVDA' },
            { id: '3', title: 'Commodity Reserves Strategy Shift', summary: 'Major industrial hubs are re-evaluating their 10-year yield targets for rare earth metals.', source: 'Financial Ledger', timestamp: Date.now() - 10800000, url: '#', category: 'commodity' },
            { id: '4', title: 'Market Sentiment Shifts to Defensive Positioning', summary: 'Institutional capital is rotating out of hyper-growth nodes and into stable energy distribution assets.', source: 'Market Observer', timestamp: Date.now() - 14400000, url: '#', category: 'market' },
            { id: '5', title: 'Orbital Logistics Expansion Approved', summary: 'Space-based distribution hubs receive regulatory clearance for low-earth orbit operation.', source: 'Galactic Commerce', timestamp: Date.now() - 18000000, url: '#', category: 'logistics' },
            { id: '6', title: 'Graphene Mass Production Milestone', summary: 'A breakthrough in vapor deposition techniques enables high-scale graphene production at 30% lower cost.', source: 'Material Science Daily', timestamp: Date.now() - 43200000, url: '#', category: 'tech' },
          ];
          setNews(mockNews);
        } else {
          setNews(snap.docs.map(doc => ({ ...doc.data() as StockNews, id: doc.id })));
        }
      } catch (err) {
        console.error("Intelligence load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    return () => {
      unsubStocks();
      unsubOrders();
    };
  }, []);

  const portfolioTickers = useMemo(() => {
    const holdings: Record<string, number> = {};
    orders.forEach(o => {
      holdings[o.ticker] = (holdings[o.ticker] || 0) + (o.type === 'buy' ? o.quantity : -o.quantity);
    });
    return Object.keys(holdings).filter(t => holdings[t] > 0);
  }, [orders]);

  const filteredNews = useMemo(() => {
    let result = news;
    if (activeCategory !== 'all') {
      result = result.filter(n => n.category === activeCategory);
    }
    // Sort by portfolio relevance (items matching symbols user owns come first)
    return [...result].sort((a, b) => {
      const aRelevant = a.symbol && portfolioTickers.includes(a.symbol) ? 1 : 0;
      const bRelevant = b.symbol && portfolioTickers.includes(b.symbol) ? 1 : 0;
      return bRelevant - aRelevant;
    });
  }, [news, activeCategory, portfolioTickers]);

  const categories = ['all', 'market', 'logistics', 'commodity', 'tech'];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Today's Pulse Summary */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-2 px-2">
           <Zap className="text-amber-500" size={20} />
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Daily Vector</h2>
        </div>
        <TodaysSummary />
      </section>

      {/* Market Stats & Gainers/Losers Integration */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 mb-2 px-2">
           <BarChart3 className="text-cyber-blue" size={20} />
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Market Dynamics</h2>
        </div>
        <MarketSummary stocks={stocks} />
      </section>

      {/* Intelligence Feed */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Shield className="text-cyber-purple" size={18} />
               <h2 className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.4em]">Intelligence Feed</h2>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Global Insights</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 italic">Neural filtering applied to {portfolioTickers.length} active portfolio nodes</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  activeCategory === cat
                    ? "bg-cyber-purple text-white border-cyber-purple shadow-lg shadow-cyber-purple/20"
                    : "bg-white/5 text-slate-500 border-white/10 hover:border-white/30 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              key={item.id}
              className={cn(
                "glass p-8 group hover:border-cyber-purple/20 transition-all bg-white/[0.01] flex flex-col h-full relative overflow-hidden",
                item.symbol && portfolioTickers.includes(item.symbol) && "border-amber-500/30 bg-amber-500/[0.02]"
              )}
            >
              {item.symbol && portfolioTickers.includes(item.symbol) && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black text-[8px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-2">
                  <TrendingUp size={10} /> Portfolio Match
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                   <span className={cn(
                     "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                     item.category === 'commodity' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                     item.category === 'tech' ? "bg-cyber-blue/10 border-cyber-blue/20 text-cyber-blue" :
                     item.category === 'market' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                     "bg-cyber-purple/10 border-cyber-purple/20 text-cyber-purple"
                   )}>
                     {item.category}
                   </span>
                   {item.symbol && (
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">#{item.symbol}</span>
                   )}
                 </div>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4 group-hover:text-cyber-purple transition-colors line-clamp-2 leading-tight">
                {item.title}
              </h3>
              
              <p className="text-sm font-medium text-slate-400 leading-relaxed line-clamp-4 mb-8 flex-grow">
                {item.summary}
              </p>

              <div className="flex justify-between items-center pt-6 border-t border-white/5 mt-auto">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.source}</span>
                    <span className="text-[8px] font-bold text-slate-700 flex items-center gap-1 mt-1 opacity-60">
                      <Clock size={8} /> {formatDate(new Date(item.timestamp).toISOString())}
                    </span>
                 </div>
                 <a 
                   href={item.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                 >
                   <ExternalLink size={16} />
                 </a>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredNews.length === 0 && (
          <div className="py-32 text-center glass border-dashed border-white/10">
            <Newspaper size={48} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Minimal Intelligence Node</h3>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2 italic">Scanning for relevant telemetry in this sector...</p>
          </div>
        )}
      </section>
    </div>
  );
};
