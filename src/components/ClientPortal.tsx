import React, { useState, useEffect } from 'react';
import { Upload, FileText, Send, AlertCircle, Trash2, Plus, Download, Shield, Inbox, Zap, ArrowRight, Activity, TrendingUp, Briefcase, ChevronDown, ChevronUp, Globe, Filter } from 'lucide-react';
import { ClientRequest, ClientDocument, ClientProfile, VaultDocument } from '../types';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate, formatCurrency } from '../lib/utils';
import { useAuth } from '../AuthContext';

export const ClientPortal: React.FC = () => {
  const { role } = useAuth();
  const isOperator = role === 'operator';
  const [activeTab, setActiveTab] = useState<'requests' | 'documents'>('requests');
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Request Form State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'procurement' as ClientRequest['type'],
    subject: '',
    description: '',
    priority: 'medium' as ClientRequest['priority']
  });

  // Vault Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<VaultDocument['category']>('other');

  const fetchData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const qReq = query(collection(db, 'client_requests'), where('clientId', '==', auth.currentUser.uid));
      const qVault = query(
        collection(db, 'vault_documents'), 
        where('clientId', '==', auth.currentUser.uid)
      );
      
      const [reqSnap, vaultSnap] = await Promise.all([getDocs(qReq), getDocs(qVault)]);
      
      setRequests(reqSnap.docs.map(d => ({ ...d.data(), id: d.id } as ClientRequest)));
      
      // Map and sort locally if orderBy fails due to missing index
      const docs = vaultSnap.docs.map(d => ({ ...d.data(), id: d.id } as VaultDocument));
      setVaultDocs(docs.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Portal load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    try {
      await addDoc(collection(db, 'client_requests'), {
        ...newRequest,
        clientId: auth.currentUser.uid,
        status: 'pending',
        createdAt: Date.now()
      });
      setIsRequestModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Request error", err);
    }
  };

  const handleVaultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    // Simulate secure URL generation
    const secureId = Math.random().toString(36).substring(2, 15);
    const mockSecureUrl = `https://vault.logic-bit.io/secure/v1/${secureId}/${file.name}`;
    
    try {
      await addDoc(collection(db, 'vault_documents'), {
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        url: mockSecureUrl,
        clientId: auth.currentUser.uid,
        category: uploadCategory,
        timestamp: Date.now()
      });
      setIsUploadModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Vault upload error", err);
    }
  };

  const deleteVaultDoc = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vault_documents', id));
      fetchData();
    } catch (err) {
      console.error("Vault delete error", err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="text-left">
          <h2 className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.4em] mb-1">Direct Interface</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Client Services</h1>
        </div>
        
        <div className="flex gap-4">
           {activeTab === 'requests' ? (
             <button 
               onClick={() => setIsRequestModalOpen(true)}
               className="px-8 py-3 bg-cyber-purple text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-cyber-purple/20 hover:scale-105 transition-all flex items-center gap-3"
             >
               <Send size={16} /> NEW INQUIRY
             </button>
           ) : (
             <button 
               onClick={() => setIsUploadModalOpen(true)}
               className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-cyber-purple hover:bg-cyber-purple/5 transition-all flex items-center gap-3 cursor-pointer"
             >
               <Upload size={16} className="text-cyber-purple" /> 
               VAULT UPLOAD
             </button>
           )}
        </div>
      </header>

      <div className="flex gap-6 border-b border-white/5 pb-4 overflow-x-auto hide-scrollbar">
        {[
          { id: 'requests', label: 'Service Inquiries', icon: Inbox },
          { id: 'documents', label: 'Vault & Assets', icon: Shield },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-colors relative",
              activeTab === tab.id ? "text-cyber-purple" : "text-slate-500 hover:text-white"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-underline" className="absolute -bottom-4 left-0 right-0 h-[2px] bg-cyber-purple shadow-[0_0_10px_rgba(188,0,255,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'requests' ? (
          <div className="space-y-6">
            {requests.length === 0 && !loading ? (
              <div className="py-32 text-center glass border-dashed">
                 <Zap size={48} className="mx-auto text-slate-700 mb-6" />
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">No Active Inquiries</h3>
                 <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">Initialize a communication sequence to begin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {requests.map((req, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={req.id} 
                    className="glass p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-cyber-purple/30 transition-all"
                  >
                    <div className="flex gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-cyber-purple shrink-0 group-hover:bg-cyber-purple group-hover:text-black transition-all">
                          <Inbox size={24} />
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-2">
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyber-purple">{req.type}</span>
                             <div className="w-1 h-1 bg-white/20 rounded-full" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{formatDate(new Date(req.createdAt).toISOString())}</span>
                          </div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{req.subject}</h4>
                          <p className="text-xs font-medium text-slate-500 max-w-xl leading-relaxed">{req.description}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-8 w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-white/5">
                       <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Status</span>
                          <div className={cn(
                            "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            req.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            req.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            "bg-cyber-red/10 border-cyber-red/20 text-cyber-red"
                          )}>
                             {req.status}
                          </div>
                       </div>
                       <button className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                          <ArrowRight size={20} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vaultDocs.map((doc, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={doc.id}
                className="glass p-8 group relative overflow-hidden bg-white/[0.01] hover:border-cyber-purple/20 transition-all border border-white/5"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Shield size={50} className="text-cyber-purple" />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cyber-purple/10 flex items-center justify-center text-cyber-purple group-hover:scale-110 transition-transform">
                     <FileText size={20} />
                  </div>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 uppercase tracking-widest">{doc.category}</span>
                </div>
                
                <h4 className="text-md font-black text-white uppercase tracking-tighter mb-1 line-clamp-1">{doc.name}</h4>
                <div className="flex flex-col gap-1 mb-6">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                   <p className="text-[8px] font-mono text-slate-700 truncate max-w-full italic">{doc.url}</p>
                </div>
                
                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                   <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Neural Secure</span>
                   </div>
                   <div className="flex gap-2">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 hover:text-cyber-purple transition-colors"><Download size={16} /></a>
                      <button onClick={() => deleteVaultDoc(doc.id)} className="p-2 hover:text-cyber-red transition-colors"><Trash2 size={16} /></button>
                   </div>
                </div>
              </motion.div>
            ))}
            
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="glass p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center cursor-pointer group hover:border-cyber-purple/40 transition-all bg-white/[0.01]"
            >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-4 group-hover:text-cyber-purple group-hover:bg-cyber-purple/10 transition-all">
                   <Plus size={32} />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Vault Secure Entry</h4>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-2 group-hover:text-slate-400 transition-colors">INITIATE DOCUMENT SEQUENCE</p>
            </button>
          </div>
        )}
      </div>

      {/* Vault Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsUploadModalOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass p-10 bg-bg-deep border-white/10 shadow-[0_0_100px_rgba(188,0,255,0.1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                   <Shield className="text-cyber-purple" size={24} />
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Vault Upload</h3>
                </div>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">Close</button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Intelligence Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['shipping', 'contract', 'compliance', 'other'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setUploadCategory(cat as any)}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          uploadCategory === cat ? "bg-cyber-purple border-cyber-purple text-white" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/30"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col items-center">
                   <label className="w-full">
                      <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center group hover:border-cyber-purple/40 hover:bg-cyber-purple/5 transition-all cursor-pointer">
                         <Upload size={40} className="text-slate-700 group-hover:text-cyber-purple mb-4 transition-colors" />
                         <span className="text-xs font-black text-white uppercase tracking-widest">Select Source File</span>
                         <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2 italic">NEURAL ENCRYPTION ASYNC</span>
                         <input type="file" className="hidden" onChange={handleVaultUpload} />
                      </div>
                   </label>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsRequestModalOpen(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass p-10 bg-bg-deep border-white/10 shadow-[0_0_100px_rgba(188,0,255,0.1)]"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Initialize Inquiry</h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">Close</button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inquiry Type</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                      value={newRequest.type}
                      onChange={e => setNewRequest({...newRequest, type: e.target.value as any})}
                    >
                      <option value="procurement">Procurement</option>
                      <option value="support">Technical Support</option>
                      <option value="custom-clearance">Custom Clearance</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority Node</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                      value={newRequest.priority}
                      onChange={e => setNewRequest({...newRequest, priority: e.target.value as any})}
                    >
                      <option value="low">Standard</option>
                      <option value="medium">Significant</option>
                      <option value="high">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Vector</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                    placeholder="Brief description of the request..."
                    value={newRequest.subject}
                    onChange={e => setNewRequest({...newRequest, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{isOperator ? "Neural Context" : "Order Context"}</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                    placeholder="Provide full details for the logic engine..."
                    value={newRequest.description}
                    onChange={e => setNewRequest({...newRequest, description: e.target.value})}
                  />
                </div>

                <button 
                   type="submit"
                   className="w-full py-5 bg-cyber-purple text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-cyber-purple/20"
                >
                   TRANSMIT REQUEST
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
