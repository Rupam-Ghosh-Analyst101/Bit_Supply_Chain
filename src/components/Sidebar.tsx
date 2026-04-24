import React from 'react';
import { LayoutDashboard, Truck, Package, DollarSign, BrainCircuit, LogOut, Menu, X } from 'lucide-react';
import { ViewType } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onLogout: () => void;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, userEmail }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'shipments', label: 'Logistics', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'pricing', label: 'Dynamic Pricing', icon: DollarSign },
    { id: 'insights', label: 'AI Strategy', icon: BrainCircuit },
  ];

  return (
    <>
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-md xl:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/80 backdrop-blur-xl transform transition-transform duration-300 ease-in-out border-r border-white/5 shadow-2xl",
        !isOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="w-8 h-8 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <div className="w-4 h-4 bg-black rotate-45"></div>
            </div>
            <h1 className="text-lg font-bold text-white tracking-widest uppercase glow-text">NexChain <span className="text-cyan-400">AI</span></h1>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewType)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 group text-[11px] font-bold uppercase tracking-widest",
                  currentView === item.id 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]" 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={16} className={cn(
                  "transition-all duration-300",
                  currentView === item.id ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" : "text-slate-600 group-hover:text-slate-300"
                )} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/5 mt-auto">
            <div className="px-4 py-3 mb-4 rounded bg-white/5 border border-white/10">
              <p className="text-[9px] text-slate-500 mb-1 uppercase tracking-tighter">Secure Terminal</p>
              <p className="text-xs font-mono text-emerald-400 truncate tracking-tighter">{userEmail}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded transition-all text-[11px] font-bold uppercase tracking-widest"
            >
              <LogOut size={16} />
              DISCONNECT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
