import React from 'react';
import { 
  LayoutDashboard, Truck, Package, DollarSign, BrainCircuit, 
  LogOut, Menu, X, Factory, Cpu, Map, Users, 
  ShieldCheck, FileText, Settings, Plus, Upload, Bell, ChevronDown
} from 'lucide-react';
import { ViewType } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggle: () => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  collapsed, 
  onToggle,
  user,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sourcing', label: 'Supply', icon: Factory },
    { id: 'procurement', label: 'Procurement', icon: Database },
    { id: 'manufacturing', label: 'Manufacturing', icon: Cpu },
    { id: 'inventory', label: 'Inventory / Warehouse', icon: Package },
    { id: 'shipments', label: 'Logistics / Transport', icon: Truck },
    { id: 'distribution', label: 'Last Mile Delivery', icon: Map },
    { id: 'pricing', label: 'Analytics / Insights', icon: DollarSign },
    { id: 'risk', label: 'Risk & Compliance', icon: ShieldCheck },
    { id: 'sustainability', label: 'Sustainability', icon: Globe },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'insights', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar-bg text-slate-400 transition-all duration-300 z-50 flex flex-col border-r border-slate-800 shadow-2xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <Globe className="text-white" size={18} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-white font-black text-sm uppercase tracking-tighter leading-none">SC Control Tower</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Supply Chain Manager</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-hide px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-bold relative group",
              currentView === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={18} className={cn("shrink-0", currentView === item.id ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
            {!collapsed && <span className="uppercase tracking-tight text-[11px] font-black">{item.label}</span>}
            {currentView === item.id && !collapsed && (
               <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Quick Actions Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
           <div className="flex items-center justify-between px-2 mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quick Actions</span>
              <ChevronDown size={12} className="text-slate-600" />
           </div>
           <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[10px] font-bold text-white border border-white/5">
                 <Plus size={14} className="text-blue-400" /> CREATE ORDER
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[10px] font-bold text-white border border-white/5">
                 <Truck size={14} className="text-emerald-400" /> ADD SHIPMENT
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[10px] font-bold text-white border border-white/5">
                 <Bell size={14} className="text-amber-400" /> NEW ALERT
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[10px] font-bold text-white border border-white/5">
                 <Upload size={14} className="text-slate-400" /> UPLOAD DOCUMENT
              </button>
           </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] whitespace-nowrap">Systems Active</span>
        </div>
      </div>
    </aside>
  );
};

const Database = (props: any) => (
   <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
);
