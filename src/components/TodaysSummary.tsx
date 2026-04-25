import React from 'react';
import { Shield, Zap, TrendingUp, TrendingDown, Info, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const TodaysSummary: React.FC = () => {
  const data = {
    sentiment: 'Bearish-Neutral',
    summary: 'The logistical and technical markets are experiencing a significant correction today. Nifty 50 has dropped by 1.14% as selling pressure intensifies in the semiconductor and chemical sectors. However, the crypto sector remains resilient with a 6.26% increase in total market cap, driven by strong inflows into orbital compute nodes.',
    highlights: [
      'Semi-conductor nodes (NVDA, ASML) down 2.1% on average.',
      'Logistics index (LGI-X) steady with 0.8% organic growth.',
      'Raw Lithium seeing highest volatility in 30 days (+5.4%).',
      'Neural Credit flow remains concentrated in high-yield tech nodes.'
    ]
  };

  return (
    <div className="glass p-10 bg-white/[0.01] border-white/5 rounded-[3rem] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
        <Shield size={120} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-12 relative z-10">
        <div className="md:w-1/3 flex flex-col justify-between">
          <div>
            <h4 className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.4em] mb-2">Global Feed</h4>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Today's Summary</h3>
            <div className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border inline-flex items-center gap-2",
              data.sentiment.includes('Bearish') ? "text-cyber-red border-cyber-red/20 bg-cyber-red/5" : "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
            )}>
              {data.sentiment.includes('Bearish') ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              Sentiment: {data.sentiment}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5">
             <div className="flex items-center gap-3 text-slate-500">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Market Telemetry v4.2</span>
             </div>
          </div>
        </div>
        
        <div className="md:w-2/3 space-y-8">
           <p className="text-xl font-medium text-slate-300 leading-relaxed italic">
             "{data.summary}"
           </p>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.highlights.map((highlight, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex gap-4 items-start"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-blue mt-1.5 shrink-0" />
                  <p className="text-xs font-bold text-slate-400 leading-snug uppercase tracking-wider">{highlight}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
