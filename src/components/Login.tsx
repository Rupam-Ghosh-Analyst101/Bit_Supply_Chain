import React from 'react';
import { LogIn, Globe, ShieldCheck, Activity, Cpu, Zap, Lock, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: (name: string, country: string) => void;
  loading?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, loading }) => {
  const [name, setName] = React.useState('');
  const [country, setCountry] = React.useState('IN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin(name, country);
  };

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-8 relative overflow-hidden cyber-grid text-left">
      {/* Cinematic Dynamic Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyber-blue/10 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/3 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyber-purple/10 rounded-full blur-[100px] -z-10 translate-y-1/2 -translate-x-1/3 animate-pulse transition-all duration-3000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="flex flex-col items-center gap-10 mb-10">
          <motion.div 
             whileHover={{ rotate: 180, scale: 1.1 }}
             className="w-20 h-20 relative"
          >
             <div className="absolute inset-0 bg-cyber-blue blur-2xl opacity-20 animate-rainbow-slow" />
             <div className="w-full h-full bg-bg-deep border border-cyber-blue/30 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10">
                <Globe className="text-cyber-blue" size={36} />
             </div>
          </motion.div>
          <div className="text-center">
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 rainbow-text">
                SC COMMAND
             </h1>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] leading-none">
                Enterprise Global Logistics Portal
             </p>
          </div>
        </div>

        <div className="glass p-10 relative group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-30" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Full Neural Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="ENTER ENTITY NAME..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-cyber-blue/40 transition-all placeholder:text-slate-700"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <LogIn size={18} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Regional Sector</label>
                <div className="relative">
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white appearance-none focus:outline-none focus:border-cyber-blue/40 transition-all"
                  >
                    <option value="IN">INDIA (IN) - SENSEX NODE</option>
                    <option value="US">UNITED STATES (US) - S&P 500 NODE</option>
                    <option value="GB">UNITED KINGDOM (GB) - FTSE NODE</option>
                    <option value="DE">GERMANY (DE) - DAX NODE</option>
                    <option value="JP">JAPAN (JP) - NIKKEI NODE</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                    <Globe size={18} />
                  </div>
                </div>
              </div>
            </div>

            <motion.button
               type="submit"
               disabled={loading || !name.trim()}
               whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(0, 242, 255, 0.4)" }}
               whileTap={{ scale: 0.98 }}
               className="group relative w-full py-5 bg-cyber-blue text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-cyber-blue/20 overflow-hidden disabled:opacity-50 disabled:grayscale"
            >
               <motion.div 
                 animate={{ x: ['-100%', '100%'] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-30 pointer-events-none" 
               />
               <span className="relative flex items-center justify-center gap-3">
                 {loading ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      DECRYPTING...
                    </>
                 ) : (
                    <>
                      <Zap size={16} />
                      ESTABLISH UPLINK
                    </>
                 )}
               </span>
            </motion.button>

            <div className="flex items-center justify-center gap-6 pt-6 text-[9px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5">
               <span className="flex items-center gap-1.5"><Activity size={12} className="text-emerald-500" /> STATUS: READY</span>
               <span className="flex items-center gap-1.5"><Cpu size={12} className="text-cyber-purple" /> NODE: SECURE</span>
            </div>
          </form>
        </div>

        <div className="flex justify-between items-center mt-10 px-4">
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest leading-relaxed">
             Identity protocol v9.42 active. <br /> Biometric stream logging initiated...
           </p>
           <Lock size={18} className="text-slate-800" />
        </div>
      </motion.div>
    </div>
  );
};
