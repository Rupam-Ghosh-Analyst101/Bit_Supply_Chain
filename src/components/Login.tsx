import React from 'react';
import { Lock, BrainCircuit, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
  loading?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, loading }) => {
  return (
    <div className="min-h-screen bg-bg-dark grid-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
        
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
            <div className="w-8 h-8 bg-black rotate-45 flex items-center justify-center">
              <BrainCircuit className="text-cyan-400 -rotate-45" size={20} />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase glow-text mb-2">NexChain <span className="text-cyan-400">AI</span></h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Autonomous Supply Protocol v1.0.4</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Global Node Sync: Active</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              [SYSTEM] Establishing encrypted tunnel...<br />
              [AUTH] Waiting for credentials...
            </p>
          </div>

          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-[0.4em] text-xs shadow-lg shadow-cyan-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Initialize Session
              </>
            )}
          </button>

          <p className="text-center text-[9px] text-slate-600 uppercase tracking-widest font-bold">
            Secured via Quantum-Resistance Protocol
          </p>
        </div>

        <div className="absolute bottom-0 right-0 p-2 opacity-5 pointer-events-none">
           <BrainCircuit size={120} className="text-white" />
        </div>
      </motion.div>

      <div className="mt-8 text-[10px] text-slate-700 font-mono tracking-tighter flex gap-6">
        <span>LATENCY: 14MS</span>
        <span>UPTIME: 142D 06H</span>
        <span>SECURE NODE: 192.168.1.104</span>
      </div>
    </div>
  );
};
