import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, ExternalLink, Tag, TrendingUp, TrendingDown, Globe, Zap } from 'lucide-react';
import { StockNews } from '../types';
import { collection, query, getDocs, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { cn, formatDate } from '../lib/utils';

interface StockNewsFeedProps {
  symbol?: string;
}

export const StockNewsFeed: React.FC<StockNewsFeedProps> = ({ symbol }) => {
  const [news, setNews] = useState<StockNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        let newsQuery;
        if (symbol) {
          newsQuery = query(collection(db, 'stock_news'), where('symbol', '==', symbol), orderBy('timestamp', 'desc'), limit(10));
        } else {
          newsQuery = query(collection(db, 'stock_news'), orderBy('timestamp', 'desc'), limit(20));
        }
        
        const snap = await getDocs(newsQuery);
        if (snap.empty) {
          // Fallback expanded mock
          const mockNews: StockNews[] = [
            {
              id: '1',
              title: 'Lithium Market Braces for Increased Demand from EV Sector',
              summary: 'Global lithium supplies are expected to tighten as major automakers ramp up battery production for the next generation of electric vehicles.',
              source: 'Reuters / MarketWatch',
              timestamp: Date.now() - 3600000,
              url: '#',
              category: 'commodity',
              symbol: 'LITH-A'
            },
            {
              id: '2',
              title: 'Copper Prices Hit 6-Month High Amid Supply Disruptions',
              summary: 'Refined copper cathodes saw a massive price jump this morning following reports of mining halts in South America.',
              source: 'Financial Times',
              timestamp: Date.now() - 7200000,
              url: '#',
              category: 'commodity',
              symbol: 'CU-CAT'
            },
            {
              id: '3',
              title: 'Silicon Wafer Technology Advances in 300mm Nodes',
              summary: 'New manufacturing techniques for 300mm silicon wafers promise higher yields and lower costs for semiconductor fabs globally.',
              source: 'TechCrunch',
              timestamp: Date.now() - 86400000,
              url: '#',
              category: 'tech',
              symbol: 'SI-300'
            },
            {
              id: '4',
              title: 'Global Supply Chain Logistics Index Stabilizes',
              summary: 'Shipping rates across major trans-Pacific routes have shown signs of stabilization after months of volatility.',
              source: 'Logistics Insider',
              timestamp: Date.now() - 172800000,
              url: '#',
              category: 'logistics'
            },
            {
              id: '5',
              title: 'Market Indices Reach All-Time High on AI Optimism',
              summary: 'Global tech indices surged today as investors doubled down on the transformative potential of artificial intelligence across all sectors.',
              source: 'Bloomberg',
              timestamp: Date.now() - 300000,
              url: '#',
              category: 'market'
            },
            {
              id: '6',
              title: 'NVIDIA GPU Shortage Expected to Ease by Q3',
              summary: 'Supply chain analysts suggest that the extreme lead times for AI-accelerated hardware are finally beginning to shorten.',
              source: 'Silicon Valley Journal',
              timestamp: Date.now() - 43200000,
              url: '#',
              category: 'tech',
              symbol: 'NVDA'
            },
            {
              id: '7',
              title: 'New Maritime Corridor Opens in South-East Asia',
              summary: 'A strategic deep-water port expansion is set to reduce transit times for major cargo vessels by up to 15%.',
              source: 'Maritime Executive',
              timestamp: Date.now() - 129600000,
              url: '#',
              category: 'logistics'
            },
            {
              id: '8',
              title: 'Iron Ore Futures Dip Amid Construction Slowdown',
              summary: 'Commodity markets reacted sharply to news of infrastructure delays in major emerging economies.',
              source: 'CNBC',
              timestamp: Date.now() - 259200000,
              url: '#',
              category: 'commodity'
            }
          ];
          
          let filteredMock = mockNews;
          if (symbol) {
            filteredMock = mockNews.filter(n => n.symbol === symbol);
          }
          setNews(filteredMock);
        } else {
          setNews(snap.docs.map(doc => ({ ...doc.data() as StockNews, id: doc.id })));
        }
      } catch (err) {
        console.error("News load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = activeCategory === 'all' 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const categories = ['all', 'market', 'logistics', 'commodity', 'tech'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">Live Feed</h2>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Market Intelligence</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                activeCategory === cat
                  ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-slate-500 border-white/10 hover:border-white/30 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredNews.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={item.id}
            className="glass p-6 group hover:border-amber-500/20 transition-all bg-white/[0.01] flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-2">
                 <span className={cn(
                   "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                   item.category === 'commodity' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                   item.category === 'tech' ? "bg-cyber-blue/10 border-cyber-blue/20 text-cyber-blue" :
                   item.category === 'market' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                   "bg-cyber-purple/10 border-cyber-purple/20 text-cyber-purple"
                 )}>
                   {item.category}
                 </span>
                 {item.symbol && (
                   <span className="text-[9px] font-bold text-slate-500">#{item.symbol}</span>
                 )}
               </div>
            </div>

            <h3 className="text-base font-black text-white uppercase tracking-tighter mb-3 group-hover:text-amber-400 transition-colors line-clamp-2">
              {item.title}
            </h3>
            
            <p className="text-xs font-medium text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-grow">
              {item.summary}
            </p>

            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.source}</span>
                  <span className="text-[8px] font-bold text-slate-700 flex items-center gap-1 mt-1">
                    <Clock size={8} /> {formatDate(new Date(item.timestamp).toISOString())}
                  </span>
               </div>
               <a 
                 href={item.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
               >
                 <ExternalLink size={14} />
               </a>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredNews.length === 0 && !loading && (
        <div className="py-20 text-center glass border-dashed border-white/10">
          <Newspaper size={32} className="mx-auto text-slate-700 mb-4" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No telemetry found for this intelligence vector</p>
        </div>
      )}
    </div>
  );
};
