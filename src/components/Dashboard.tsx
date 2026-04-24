import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, PackageSearch, Ship, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Shipment, InventoryItem, PricingRecord } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface DashboardProps {
  shipments: Shipment[];
  inventory: InventoryItem[];
  pricing: PricingRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ shipments, inventory, pricing }) => {
  const stats = [
    { label: 'Network Logistics', value: shipments.filter(s => s.status === 'in-transit').length, icon: Ship, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Risk Alerts', value: inventory.filter(i => i.stockLevel < i.reorderPoint).length, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'AI Queue', value: shipments.filter(s => s.status === 'pending').length, icon: PackageSearch, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'System Integrity', value: '99.9%', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  const pricingData = pricing.map(p => ({
    name: p.productId,
    current: p.currentPrice,
    base: p.basePrice
  })).slice(0, 7);

  const supplyChainHealth = [
    { time: '08:00', load: 45, latency: 120 },
    { time: '10:00', load: 52, latency: 150 },
    { time: '12:00', load: 68, latency: 220 },
    { time: '14:00', load: 72, latency: 210 },
    { time: '16:00', load: 61, latency: 180 },
    { time: '18:00', load: 48, latency: 140 },
    { time: '20:00', load: 35, latency: 110 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">Operational Overview</h2>
          <div className="flex items-center gap-4">
            <h3 className="text-4xl font-black text-white tracking-tighter glow-text uppercase">Lynx Command</h3>
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-widest uppercase rounded">Live</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-cyan-400 uppercase tracking-tighter font-bold">Node Uptime</span>
            <span className="data-mono text-white/60">142D 06H</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 group hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn("p-2 rounded-sm rotate-45 border border-white/5", stat.bg)}>
                <stat.icon className={cn(stat.color, "-rotate-45")} size={18} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-white font-mono tracking-tighter">{stat.value}</span>
              {i === 3 && <span className="text-emerald-400 text-[10px] font-bold flex items-center tracking-tighter">+0.02%</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Pricing Chart */}
        <div className="lg:col-span-2 glass flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Market Fluidity Index</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">AI Current</span>
              </div>
            </div>
          </div>
          <div className="p-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pricingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ 
                    backgroundColor: '#0d1117',
                    borderRadius: '4px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                />
                <Bar dataKey="current" fill="#00F0FF" radius={[2, 2, 0, 0]} barSize={32} />
                <Bar dataKey="base" fill="rgba(255,255,255,0.1)" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Load */}
        <div className="glass flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Latency Distribution</h3>
          </div>
          <div className="p-6 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={supplyChainHealth}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d1117',
                    borderRadius: '4px', 
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="latency" 
                  stroke="#00F0FF" 
                  strokeWidth={1}
                  fillOpacity={1} 
                  fill="url(#colorLatency)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto p-4 border-t border-white/5 bg-black/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="data-mono text-emerald-400">Node Sync OK</span>
              </div>
              <span className="data-mono text-white/20">v.1.04-beta-2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
