import React, { useState } from 'react';
import { 
  LayoutDashboard, Truck, Package, DollarSign, BrainCircuit, 
  LogOut, Cpu, Map, FileText, Plus, Globe, UserCheck, Activity, Sparkles, Box, Settings, Zap, Shield
} from 'lucide-react';
import { ViewType } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType, params?: any) => void;
  collapsed: boolean;
  onToggle: () => void;
  user: any;
  onLogout: () => void;
  onAction?: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  collapsed, 
  user,
  onLogout,
  onAction
}) => {
  const { role, toggleRole, isAdmin } = useAuth();
  const isOperator = role === 'operator';
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [accessKey, setAccessKey] = useState('');

  const handleOperatorSwitch = () => {
    if (role === 'operator') return;
    setShowPasswordInput(true);
  };

  const verifyAccess = () => {
    if (accessKey === '123') {
      toggleRole();
      setShowPasswordInput(false);
      setAccessKey('');
      onAction?.("CORE TERMINAL ACCESS GRANTED: Operator privileges enabled.", "success");
    } else {
      onAction?.("SECURE ACCESS SHIELD ACTIVE: Incorrect cryptographic key.", "warning");
      setAccessKey('');
    }
  };

  const adminLinks = [
    { id: 'dashboard', label: 'Neural Core', icon: LayoutDashboard },
    { id: 'intelligence', label: 'Market Feed', icon: Zap, isNew: true },
    { id: 'shipments', label: 'Fleet Telemetry', icon: Truck },
    { id: 'inventory', label: 'Global Assets', icon: Box },
    { id: 'pricing', label: 'Value Engine', icon: DollarSign },
    { id: 'manufacturing', label: 'Logic Layer', icon: Cpu },
    { id: 'sourcing', label: 'Node Grid', icon: Activity },
    { id: 'insights', label: 'Policy Engine', icon: Sparkles },
    { id: 'profile', label: 'Account Profile', icon: Settings },
  ];

  const clientLinks = [
    { id: 'dashboard', label: 'Interface', icon: LayoutDashboard },
    { id: 'intelligence', label: 'Market Intel', icon: Zap, isNew: true },
    { id: 'shipments', label: 'Track Asset', icon: Truck },
    { id: 'market', label: 'Market Explorer', icon: Globe },
    { id: 'holdings', label: 'Manage Stocks', icon: Activity },
    { id: 'orders', label: 'Order History', icon: DollarSign },
    { id: 'client-portal', label: 'Service', icon: UserCheck },
    { id: 'profile', label: 'Account Profile', icon: Settings },
  ];

  const navItems = isOperator ? adminLinks : clientLinks;

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        "fixed left-0 top-0 h-full transition-all duration-500 z-50 flex flex-col border-r border-white/5",
        "bg-bg-deep/80 backdrop-blur-3xl shadow-[20px_0_40px_rgba(0,0,0,0.5)]",
        isOperator ? "border-cyber-purple/20" : "border-cyber-blue/10"
      )}
    >
      <div className="flex items-center gap-3 px-6 pt-10 pb-6">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5, filter: "hue-rotate(90deg)" }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl relative group",
            "bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
          )}
        >
           <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-red opacity-20 blur-md group-hover:opacity-100 transition-opacity" />
           {isOperator ? (
             <Cpu className="text-white relative z-10" size={24} />
           ) : (
             <Globe className="text-white relative z-10" size={24} />
           )}
        </motion.div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-white font-black text-lg uppercase tracking-tighter leading-none rainbow-text">
              {isOperator ? "BS - CORE" : "BITS SUPPLY"}
            </span>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-widest mt-1 opacity-70",
              isOperator ? "text-cyber-purple" : "text-cyber-blue"
            )}>
              {isOperator ? "Core Terminal" : "Client Terminal"}
            </span>
          </motion.div>
        )}
      </div>

      {!collapsed && (
        <div className="px-6 mb-8 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex items-center gap-1">
            <button 
              onClick={() => {
                if (role === 'client') return;
                toggleRole();
                setShowPasswordInput(false);
              }}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                role === 'client' ? "bg-white/10 text-white shadow-lg border border-white/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Client
            </button>
            <button 
              onClick={handleOperatorSwitch}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                role === 'operator' ? "bg-white/10 text-white shadow-lg border border-white/20" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Operator
            </button>
          </div>

          <AnimatePresence>
            {showPasswordInput && role !== 'operator' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                className="space-y-2 overflow-hidden px-1"
              >
                <div className="relative">
                  <input 
                    type="password"
                    placeholder="ENTER ACCESS KEY..."
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && verifyAccess()}
                    className="w-full bg-cyber-blue/5 border border-cyber-blue/20 rounded-xl px-4 py-3 text-[10px] text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyber-blue/40"
                    autoFocus
                  />
                  <Shield size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-cyber-blue/40" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={verifyAccess}
                    className="flex-1 bg-cyber-blue text-black text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-white transition-all shadow-[0_4px_12px_rgba(0,191,255,0.2)]"
                  >
                    VERIFY
                  </button>
                  <button 
                    onClick={() => setShowPasswordInput(false)}
                    className="px-3 border border-white/10 text-slate-500 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-white/5 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide px-4 space-y-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange(item.id as ViewType)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all relative group",
              currentView === item.id 
                ? "bg-white/[0.05] border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(
              "shrink-0 transition-transform duration-300 group-hover:scale-110", 
              currentView === item.id 
                ? "text-white" 
                : "text-slate-500"
            )} />
            {!collapsed && (
              <span className={cn(
                "uppercase tracking-widest text-[11px] font-black",
                currentView === item.id ? "text-white" : "text-slate-500"
              )}>
                {item.label}
              </span>
            )}
            {!collapsed && 'isNew' in item && item.isNew && (
              <span className="ml-auto bg-cyber-purple/20 text-cyber-purple text-[7px] font-black px-1.5 py-0.5 rounded-full animate-pulse border border-cyber-purple/30">
                NEW
              </span>
            )}
            {currentView === item.id && (
               <motion.div 
                 layoutId="nav-indicator"
                 className="absolute left-0 w-1 h-6 rounded-full bg-gradient-to-b from-cyber-blue via-cyber-purple to-cyber-red shadow-[0_0_10px_rgba(255,255,255,0.5)]"
               />
            )}
          </motion.button>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-6 border-t border-white/5 space-y-4">
           <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Operations
              </span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           </div>
           <div className="space-y-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isOperator) {
                    onViewChange('shipments');
                    onAction?.("System INIT Signal Sent: Routing to Fleet Telemetry for deployment initialization.");
                  } else {
                    onViewChange('market');
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-[10px] font-black text-white border border-white/5 tracking-wider"
              >
                 <Plus size={16} className="rainbow-text" /> 
                 {isOperator ? "INIT TASK" : "NEW ORDER"}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all text-[10px] font-black text-red-500 border border-red-500/20 tracking-wider"
              >
                 <LogOut size={16} /> SIGN OUT
              </motion.button>
           </div>
        </div>
      )}
    </motion.aside>
  );
};
