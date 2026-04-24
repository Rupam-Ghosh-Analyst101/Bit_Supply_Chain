import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Package, Truck, Factory, Globe, Search, Bell, MessageSquare, 
  ChevronRight, MoreVertical, Filter, ArrowUp, ArrowDown,
  Warehouse, Users, LayoutDashboard, Database, Activity, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Shipment, InventoryItem, PricingRecord } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { WorldMap } from './WorldMap';

interface DashboardProps {
  shipments: Shipment[];
  inventory: InventoryItem[];
  pricing: PricingRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ shipments, inventory, pricing }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const kpis = [
    { label: 'Orders Fulfilled Today', value: '12,458', change: '8.6%', trend: 'up', icon: Package, color: 'bg-blue-600' },
    { label: 'Delayed Shipments', value: '156', change: '12.4%', trend: 'down', icon: Truck, color: 'bg-orange-500' },
    { label: 'Inventory Health', value: '92%', change: '5.7%', trend: 'up', icon: Warehouse, color: 'bg-emerald-500' },
    { label: 'Demand Forecast Accuracy', value: '87%', change: '3.1%', trend: 'up', icon: Activity, color: 'bg-indigo-600' },
    { label: 'Cost per Delivery', value: '$2.45', change: '4.3%', trend: 'up', icon: Database, color: 'bg-blue-500' },
  ];

  const flowStages = [
    { name: 'Suppliers', count: '128 Active', color: 'text-blue-600', icon: Factory },
    { name: 'Manufacturing', count: '86% Capacity', color: 'text-emerald-500', icon: LayoutDashboard },
    { name: 'Warehouses', count: '92% Efficiency', color: 'text-blue-500', icon: Warehouse },
    { name: 'Transport', count: '156 In Transit', color: 'text-blue-600', icon: Truck },
    { name: 'Delivery', count: 'On Track', color: 'text-indigo-600', icon: Package },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search and Profile Header */}
      <div className="flex items-center justify-between bg-white px-6 py-3 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search orders, shipments, suppliers..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm text-slate-600 font-medium hover:text-primary transition-colors">
            <Globe size={18} />
            Global View
          </button>
          <div className="relative">
            <Bell size={20} className="text-slate-600 cursor-pointer" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">12</span>
          </div>
          <MessageSquare size={20} className="text-slate-600 cursor-pointer" />
          <RefreshCw size={20} className="text-slate-600 cursor-pointer" />
          <div className="flex items-center gap-3 pl-6 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 leading-none">Arjun Mehta</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300" />
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="glass p-5 flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/10", kpi.color)}>
              <kpi.icon size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">{kpi.label}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{kpi.value}</h4>
              <p className={cn(
                "text-[10px] font-bold flex items-center gap-1",
                kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
              )}>
                {kpi.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {kpi.change} <span className="text-slate-400 font-medium tracking-normal">vs yesterday</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Map and AI Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="glass flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Global Supply Chain Map <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-2" /> <span className="text-[11px] text-emerald-600 uppercase font-black tracking-widest">Live</span>
              </h3>
              <div className="flex gap-2">
                <select className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1 text-[11px] font-bold text-slate-600 focus:outline-none focus:border-primary">
                  <option>All Shipments</option>
                </select>
                <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer">
                   <Filter size={14} />
                </div>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden bg-slate-50">
              <WorldMap shipments={shipments} />
              
              {/* Legend Overlay */}
              <div className="absolute top-4 left-4 glass p-4 space-y-3 shadow-xl backdrop-blur-md bg-white/80">
                 {[
                   { label: 'Warehouses', icon: Warehouse, color: 'text-blue-600' },
                   { label: 'In Transit', icon: Truck, color: 'text-emerald-500' },
                   { label: 'Delayed', icon: AlertTriangle, color: 'text-orange-500' },
                   { label: 'Disruption', icon: Globe, color: 'text-red-600' }
                 ].map((l, i) => (
                   <div key={i} className="flex items-center gap-3">
                      <l.icon size={14} className={l.color} />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">{l.label}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Supply Chain Flow Diagram */}
          <div className="glass p-6">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6">Supply Chain Flow</h3>
            <div className="flex justify-between items-center px-4">
               {flowStages.map((stage, i) => (
                 <React.Fragment key={i}>
                   <div className="flex flex-col items-center gap-3">
                     <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center group hover:border-primary transition-all">
                        <stage.icon size={22} className={cn("transition-transform group-hover:scale-110", stage.color)} />
                     </div>
                     <div className="text-center">
                        <p className="text-[11px] font-black text-slate-900 tracking-tight uppercase mb-0.5">{stage.name}</p>
                        <p className={cn("text-[10px] font-bold uppercase", stage.color.replace('text-', 'text-'))}>{stage.count}</p>
                     </div>
                   </div>
                   {i < flowStages.length - 1 && (
                     <div className="flex-1 flex flex-col items-center pt-2 px-2">
                        <div className="w-full h-px border-t border-dashed border-slate-300" />
                        <ChevronRight className="text-slate-300 -mt-1.5" size={14} />
                     </div>
                   )}
                 </React.Fragment>
               ))}
            </div>
          </div>
        </div>

        {/* AI & Insights Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">AI Insights</h3>
              <span className="text-[10px] font-bold text-blue-600 uppercase">View All</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-4">
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">Demand spike expected for</p>
              <h5 className="text-sm font-black text-slate-900 leading-tight mb-3">Electronics in West Region <br /><span className="text-slate-500 font-bold text-[10px]">in next 48 hours</span></h5>
              <div className="h-16">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={[{v:10},{v:40},{v:20},{v:50},{v:45},{v:60}]}>
                     <Line type="monotone" dataKey="v" stroke="#2563EB" strokeWidth={2} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
               <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>

          <div className="glass p-6 flex flex-col gap-5">
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Risk Alerts</h3>
                <span className="text-[10px] font-bold text-blue-600 uppercase">View All</span>
             </div>
             {[
               { title: 'High delay risk at Shanghai Port', time: '2m ago', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
               { title: 'Supplier risk: ABC Components', time: '15m ago', icon: Database, color: 'bg-orange-100 text-orange-500' },
               { title: 'Severe weather alert', time: '45m ago', icon: Globe, color: 'bg-amber-100 text-amber-500' }
             ].map((alert, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1 rounded-lg transition-colors">
                   <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", alert.color)}>
                      <alert.icon size={18} />
                   </div>
                   <div className="flex-1 border-b border-slate-100 pb-4 last:border-0">
                      <h6 className="text-[11px] font-bold text-slate-900 leading-tight mb-1">{alert.title}</h6>
                      <p className="text-[9px] text-slate-500 font-medium uppercase font-mono">{alert.time}</p>
                   </div>
                </div>
             ))}
          </div>

          <div className="glass p-6">
             <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6">Sustainability Impact</h3>
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <LayoutDashboard size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CO₂ Saved</p>
                      <p className="text-lg font-black text-slate-900 leading-none">128.6 <span className="text-xs text-slate-500">Tons</span></p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-600 flex items-center justify-end gap-1"><ArrowUp size={10} /> 12.4%</p>
                   <p className="text-[10px] text-slate-400 font-bold">vs last month</p>
                </div>
             </div>
             <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={[{v:10},{v:15},{v:12},{v:18},{v:25},{v:22},{v:30}]}>
                     <Line type="step" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* Live Shipments Table */}
      <div className="glass overflow-hidden pb-4">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
           <h3 className="text-sm font-bold text-slate-800 tracking-tight">Live Shipments</h3>
           <div className="flex gap-4">
              <select className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-slate-600 focus:outline-none">
                <option>All Regions</option>
              </select>
              <select className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-bold text-slate-600 focus:outline-none">
                <option>All Status</option>
              </select>
              <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2 text-[11px] font-bold text-slate-600 cursor-pointer hover:bg-slate-100">
                <Filter size={14} /> Filters
              </div>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Carrier</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ETA</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Score</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 5).map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-900 uppercase font-mono tracking-tighter">ORD-{s.id.slice(0, 5).toUpperCase()}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-600">{s.origin}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-600">{s.destination}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                          <Truck size={12} className="text-blue-600" />
                       </div>
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{s.carrier}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-bold text-slate-900">May 22, 2024</span>
                       <span className="text-[9px] text-slate-400 font-bold font-mono">10:30 AM</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                      s.status === 'in-transit' ? 'bg-blue-50 text-blue-600' :
                      s.status === 'delayed' ? 'bg-orange-50 text-orange-500' :
                      'bg-emerald-50 text-emerald-600'
                    )}>
                      {s.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Low</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                          <div 
                            className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-all duration-1000" 
                            style={{ width: `${Math.random() * 40 + 60}%` }} 
                          />
                       </div>
                       <span className="text-[10px] font-bold text-slate-400 font-mono">75%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <MoreVertical size={16} className="text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border bg-slate-50/50 flex justify-between items-center">
           <p className="text-[11px] font-bold text-slate-500">Showing 1 to 5 of 1,245 shipments</p>
           <div className="flex gap-2">
              <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed"><ChevronRight className="rotate-180" size={14} /></div>
              <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center text-[11px] font-bold">1</div>
              <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 cursor-pointer">2</div>
              <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 cursor-pointer">3</div>
              <div className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"><ChevronRight size={14} /></div>
           </div>
        </div>
      </div>
    </div>
  );
};
