import React from 'react';
import { LogIn, Globe, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
  loading?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, loading }) => {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] -z-10 translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-8 mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-12 transition-transform hover:rotate-0">
             <Globe className="text-white" size={40} />
          </div>
          <div className="text-center">
             <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">SC Control Tower</h1>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Enterprise Supply Chain Platform</p>
          </div>
        </div>

        <div className="glass bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
          <div className="space-y-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Secure Authentication</p>
                  <p className="text-sm font-bold text-slate-700">Google Cloud Single Sign-On</p>
               </div>
            </div>

            <button
               onClick={onLogin}
               disabled={loading}
               className="group relative w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               <span className="relative flex items-center justify-center gap-3">
                 {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                    <>
                      <LogIn size={20} />
                      Initialize Session
                    </>
                 )}
               </span>
            </button>

            <div className="flex items-center justify-center gap-6 pt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50">
               <span className="flex items-center gap-2"><Activity size={12} className="text-emerald-500" /> Status: Global-Active</span>
               <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
               <span>v1.0.4-Ent</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Authorized Nodes Only. Monitoring Active.
        </p>
      </motion.div>
    </div>
  );
};
