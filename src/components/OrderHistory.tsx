import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Search, Filter, Trash2 } from 'lucide-react';
import { ClientOrder } from '../types';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(true);
    
    const q = query(
      collection(db, 'client_orders'), 
      where('clientId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as ClientOrder)));
      setLoading(false);
    }, (err) => {
      console.error("Orders load error", err);
      // Fallback if index missing
      if (err.message.includes('index')) {
        const simpleQ = query(
          collection(db, 'client_orders'), 
          where('clientId', '==', auth.currentUser.uid)
        );
        onSnapshot(simpleQ, (s) => {
            setOrders(s.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClientOrder)).sort((a,b) => b.timestamp - a.timestamp));
            setLoading(false);
        });
      }
    });

    return () => unsub();
  }, []);

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'client_orders', id));
      // Handled by onSnapshot
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="text-left">
          <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-1">Transaction Ledger</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Order History</h1>
        </div>
        
        <div className="relative w-full md:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
             <input 
               type="text" 
               placeholder="Search tickers..."
               className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400/40 transition-all font-mono"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
      </header>

      <div className="glass overflow-hidden border-white/5 bg-white/[0.01]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Quantity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, i) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={order.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border",
                         order.type === 'buy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-cyber-red/10 border-cyber-red/20 text-cyber-red"
                       )}>
                          {order.ticker}
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                      order.type === 'buy' ? "text-emerald-400" : "text-cyber-red"
                    )}>
                      {order.type === 'buy' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                      {order.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-mono text-sm text-white font-bold">{order.quantity}</td>
                  <td className="px-8 py-6 text-right font-mono text-sm text-slate-400">${order.price.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right font-mono text-sm text-emerald-400 font-black">${order.total.toLocaleString()}</td>
                  <td className="px-8 py-6">
                     <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {order.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {formatDate(new Date(order.timestamp).toISOString())}
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button 
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 text-slate-700 hover:text-cyber-red transition-colors opacity-0 group-hover:opacity-100"
                     >
                        <Trash2 size={16} />
                     </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {!loading && filteredOrders.length === 0 && (
          <div className="py-32 text-center">
             <DollarSign size={48} className="mx-auto text-slate-800 mb-6" />
             <h3 className="text-xl font-black text-white uppercase tracking-widest">No Transactions</h3>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Initialize a trade in the market explorer to populate this ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
};
