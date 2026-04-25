import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Globe, Zap, ArrowUpRight, DollarSign, Bitcoin, BarChart3, Clock } from 'lucide-react';
import { MarketStock } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MarketSummaryProps {
  stocks: MarketStock[];
  onSelectStock?: (stock: MarketStock) => void;
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({ stocks, onSelectStock }) => {
  const topGainers = useMemo(() => {
    return [...stocks].sort((a, b) => b.change - a.change).slice(0, 6);
  }, [stocks]);

  const topLosers = useMemo(() => {
    return [...stocks].sort((a, b) => a.change - b.change).slice(0, 6);
  }, [stocks]);

  const featuredIndex = { name: 'Nifty 50', ticker: 'NIFTY', value: 23897.95, change: -1.14 };

  const majorIndices = [
    { name: 'Sensex', ticker: 'SENSEX', value: 76664.21, change: -1.29, color: 'text-cyber-red' },
    { name: 'Nasdaq 100', ticker: 'NDX', value: 18245.40, change: 0.85, color: 'text-emerald-400' },
    { name: 'FTSE 100', ticker: 'FTSE', value: 8245.30, change: 0.15, color: 'text-emerald-400' },
  ];

  const secondaryIndicators = [
    { name: 'USD to INR', ticker: 'USDINR', value: '83.42', change: 0.38, icon: DollarSign },
    { name: 'Bitcoin', ticker: 'BTCUSD', value: '77,684', change: 0.28, icon: Bitcoin },
    { name: 'Crude Oil', ticker: 'OIL', value: '84.20', change: -1.2, icon: Zap },
  ];

  // Mock mini chart data for indices
  const generateMiniChart = () => Array.from({ length: 20 }, () => ({ val: Math.floor(Math.random() * 50) + 20 }));

  return (
    <div className="space-y-12">
      {/* Featured Summary & Major Indices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Featured Card (Large Nifty Chart style) */}
        <div className="lg:col-span-2 glass p-10 bg-white/[0.01] border-white/5 rounded-[3rem] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity size={180} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xl">50</div>
                <div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{featuredIndex.name}</h3>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none bg-white/5 px-2 py-0.5 rounded border border-white/10">{featuredIndex.ticker}</span>
                </div>
              </div>
              <div className="space-y-1">
                 <h4 className="text-5xl font-black text-white tabular-nums tracking-tighter">{featuredIndex.value.toLocaleString()} <span className="text-sm text-slate-500">INR</span></h4>
                 <p className={cn("text-lg font-black uppercase tracking-widest", featuredIndex.change >= 0 ? "text-emerald-400" : "text-cyber-red")}>
                    {featuredIndex.change >= 0 ? '+' : ''}{featuredIndex.change}%
                 </p>
              </div>
            </div>
            
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">Today</button>
               <button className="px-6 py-3 border border-transparent rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">1 Month</button>
               <button className="px-6 py-3 border border-transparent rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">All</button>
            </div>
          </div>

          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateMiniChart()}>
                <defs>
                  <linearGradient id="featuredGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={featuredIndex.change >= 0 ? "#10b981" : "#ff003c"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={featuredIndex.change >= 0 ? "#10b981" : "#ff003c"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={featuredIndex.change >= 0 ? "#10b981" : "#ff003c"} 
                  fill="url(#featuredGradient)"
                  strokeWidth={4}
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 flex gap-8 border-t border-white/5 pt-8">
             {secondaryIndicators.map((ind) => (
                <div key={ind.ticker} className="flex gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                      <ind.icon size={16} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{ind.name}</p>
                      <p className="text-sm font-black text-white">{ind.value} <span className={cn("text-[9px] ml-2", ind.change >= 0 ? "text-emerald-400" : "text-cyber-red")}>{ind.change >= 0 ? '+' : ''}{ind.change}%</span></p>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Major Indices List */}
        <div className="space-y-6">
           <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Major Indices</h3>
           </div>
           <div className="space-y-4">
              {majorIndices.map((idx) => (
                 <div key={idx.ticker} className="glass p-6 bg-white/[0.01] border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-4">
                          <div className={cn("w-2 h-2 rounded-full", idx.change >= 0 ? "bg-emerald-500" : "bg-cyber-red")} />
                          <div>
                             <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">{idx.name}</h4>
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{idx.ticker}</p>
                          </div>
                       </div>
                       <div className="h-12 w-24">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={generateMiniChart()}>
                                <Area type="monotone" dataKey="val" stroke={idx.change >= 0 ? "#10b981" : "#ff003c"} fill={idx.change >= 0 ? "#10b981" : "#ff003c"} fillOpacity={0.1} strokeWidth={2} />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                    <div className="flex justify-between items-baseline">
                       <span className="text-lg font-black text-white tabular-nums">{idx.value.toLocaleString()}</span>
                       <span className={cn("text-xs font-black tabular-nums", idx.change >= 0 ? "text-emerald-400" : "text-cyber-red")}>
                          {idx.change >= 0 ? '+' : ''}{idx.change}%
                       </span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Gainer / Loser / High Volume Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Top Gainers */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={24} /> Stock Gainers
            </h3>
            <button className="text-[10px] font-black text-cyber-blue uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="space-y-2">
            {topGainers.map((stock) => (
              <div 
                key={stock.id} 
                onClick={() => onSelectStock?.(stock)}
                className="group flex justify-between items-center p-4 hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform">
                    {stock.ticker.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate w-40">{stock.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stock.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white tabular-nums">${stock.price.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-emerald-400 uppercase">+{stock.change}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <TrendingDown className="text-cyber-red" size={24} /> Stock Losers
            </h3>
            <button className="text-[10px] font-black text-cyber-blue uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="space-y-2">
            {topLosers.map((stock) => (
              <div 
                key={stock.id} 
                onClick={() => onSelectStock?.(stock)}
                className="group flex justify-between items-center p-4 hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform">
                    {stock.ticker.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate w-40">{stock.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stock.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white tabular-nums">${stock.price.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-cyber-red uppercase">{stock.change}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* High Volume / Activity */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <BarChart3 className="text-amber-500" size={24} /> High Volume
            </h3>
            <button className="text-[10px] font-black text-cyber-blue uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="space-y-2">
            {stocks.slice(0, 6).map((stock) => (
              <div 
                key={`vol-${stock.id}`} 
                onClick={() => onSelectStock?.(stock)}
                className="group flex justify-between items-center p-4 hover:bg-white/[0.03] rounded-2xl transition-all cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:scale-110 transition-transform">
                    {stock.ticker.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tighter truncate w-40">{stock.name}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stock.ticker}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white tabular-nums">${stock.price.toLocaleString()}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vol: {stock.volume}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
