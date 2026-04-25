import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, Settings, CreditCard, Lock, MapPin, Calendar, Award, Fingerprint, ArrowRight, AlertCircle, Globe, Zap, Key } from 'lucide-react';
import { ClientProfile } from '../types';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';

export const AccountProfile: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<ClientProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      
      try {
        const docRef = doc(db, 'client_profiles', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as ClientProfile;
          setProfile(data);
          setEditedProfile(data);
        } else {
          // Initialize default profile
          const defaultProfile: ClientProfile = {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'Neural Client',
            email: auth.currentUser.email || '',
            address: 'Neural Sector 9, Orbital Ring Alpha',
            countryCode: 'IN',
            joiningDate: new Date().toISOString(),
            balance: 125400.50,
            lastLogin: new Date().toISOString(),
            securityLevel: 'Neural',
            isTwoFactorEnabled: true
          };
          await setDoc(docRef, defaultProfile);
          setProfile(defaultProfile);
          setEditedProfile(defaultProfile);
        }
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser || !profile) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'client_profiles', auth.currentUser.uid);
      await setDoc(docRef, { ...profile, ...editedProfile }, { merge: true });
      setProfile({ ...profile, ...editedProfile } as ClientProfile);
      setEditMode(false);
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!auth.currentUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setResetError(err.message || 'Failed to initiate reset.');
      setTimeout(() => setResetError(null), 5000);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyber-purple"></div>
    </div>
  );

  if (!profile) return <div>Failed to load neural identity.</div>;

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <header className="flex justify-between items-end px-2">
        <div className="text-left">
          <h2 className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.4em] mb-1">Neural ID</h2>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Account Matrix</h1>
        </div>
        <button 
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={saving}
          className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
        >
          {saving ? 'Synchronizing...' : editMode ? 'Commit Changes' : 'Modify Core'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-10 bg-black/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-purple/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-cyber-purple flex items-center justify-center text-white shadow-2xl shadow-cyber-purple/20">
                  <UserCheck size={48} />
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl shadow-lg">
                  <Shield size={16} />
                </div>
              </div>

              <div className="flex-1 text-left w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Fingerprint size={12} className="text-cyber-purple" /> Node Designation
                         </label>
                         {editMode ? (
                           <input 
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                             value={editedProfile.name}
                             onChange={e => setEditedProfile({...editedProfile, name: e.target.value})}
                           />
                         ) : (
                           <h3 className="text-2xl font-black text-white tracking-tighter">{profile.name}</h3>
                         )}
                     </div>

                     <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <MapPin size={12} className="text-cyber-purple" /> Physical Node (Address)
                         </label>
                         {editMode ? (
                           <input 
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                             value={editedProfile.address}
                             onChange={e => setEditedProfile({...editedProfile, address: e.target.value})}
                           />
                         ) : (
                           <p className="text-sm font-bold text-white px-4 py-3 bg-white/[0.02] rounded-xl">{profile.address}</p>
                         )}
                     </div>

                     <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Globe size={12} className="text-emerald-400" /> Regional Node (Country Code)
                         </label>
                         {editMode ? (
                           <select 
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyber-purple/40"
                             value={editedProfile.countryCode}
                             onChange={e => setEditedProfile({...editedProfile, countryCode: e.target.value})}
                           >
                              <option value="IN">IN - India (Sensex)</option>
                              <option value="US">US - United States (S&P 500)</option>
                              <option value="GB">GB - United Kingdom (FTSE 100)</option>
                              <option value="DE">DE - Germany (DAX)</option>
                              <option value="JP">JP - Japan (Nikkei)</option>
                           </select>
                         ) : (
                           <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] rounded-xl">
                              <span className="text-lg">
                                 {profile.countryCode === 'IN' ? '🇮🇳' : 
                                  profile.countryCode === 'US' ? '🇺🇸' : 
                                  profile.countryCode === 'GB' ? '🇬🇧' : 
                                  profile.countryCode === 'DE' ? '🇩🇪' : 
                                  profile.countryCode === 'JP' ? '🇯🇵' : '🌐'}
                              </span>
                              <span className="text-sm font-bold text-white uppercase tracking-widest">{profile.countryCode}</span>
                           </div>
                         )}
                     </div>
                   </div>

                   <div className="space-y-6 text-left">
                     <div>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Neural Balance</label>
                         <div className="flex items-center gap-4">
                            {editMode ? (
                              <input 
                                type="number"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xl font-black text-white focus:outline-none focus:border-cyber-purple/40 w-full"
                                value={editedProfile.balance}
                                onChange={e => setEditedProfile({...editedProfile, balance: parseFloat(e.target.value)})}
                              />
                            ) : (
                              <>
                                <p className="text-3xl font-black text-white font-mono tracking-tighter">{formatCurrency(profile.balance)}</p>
                                <button 
                                  onClick={() => setEditMode(true)}
                                  className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all"
                                >
                                  <CreditCard size={14} />
                                </button>
                              </>
                            )}
                         </div>
                     </div>
                     <div>
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Clearance Level</label>
                         <p className="text-xs font-black text-cyber-purple uppercase tracking-widest px-3 py-1.5 bg-cyber-purple/10 border border-cyber-purple/20 rounded-full inline-block">{profile.securityLevel}</p>
                     </div>
                   </div>
                 </div>

              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-10 bg-black/20 border-cyber-red/10">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter">Market Matrix</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Regional Financial Telemetry</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Index 1 */}
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl text-left hover:border-emerald-500/20 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {profile.countryCode === 'IN' ? 'BSE SENSEX' : 
                             profile.countryCode === 'US' ? 'S&P 500' : 
                             profile.countryCode === 'GB' ? 'FTSE 100' : 
                             profile.countryCode === 'DE' ? 'DAX' : 
                             profile.countryCode === 'JP' ? 'NIKKEI 225' : 'GLOBAL INDEX'}
                         </span>
                         <span className="text-[10px] font-black text-emerald-400 group-hover:scale-110 transition-transform">+1.24%</span>
                      </div>
                      <div className="text-3xl font-black text-white font-mono tracking-tighter mb-2">
                         {profile.countryCode === 'IN' ? '74,248.22' : 
                          profile.countryCode === 'US' ? '5,137.08' : 
                          profile.countryCode === 'GB' ? '7,935.09' : 
                          profile.countryCode === 'DE' ? '18,175.21' : 
                          profile.countryCode === 'JP' ? '38,992.08' : '0.00'}
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: "70%" }}
                           className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                         />
                      </div>
                   </div>

                   {/* Index 2 */}
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl text-left hover:border-emerald-500/20 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {profile.countryCode === 'IN' ? 'NSE NIFTY 50' : 
                             profile.countryCode === 'US' ? 'NASDAQ-100' : 
                             profile.countryCode === 'GB' ? 'FTSE 250' : 
                             profile.countryCode === 'DE' ? 'MDAX' : 
                             profile.countryCode === 'JP' ? 'TOPIX' : 'REGIONAL ALPHA'}
                         </span>
                         <span className="text-[10px] font-black text-emerald-400 group-hover:scale-110 transition-transform">+0.98%</span>
                      </div>
                      <div className="text-3xl font-black text-white font-mono tracking-tighter mb-2">
                         {profile.countryCode === 'IN' ? '22,513.70' : 
                          profile.countryCode === 'US' ? '18,108.46' : 
                          profile.countryCode === 'GB' ? '19,850.44' : 
                          profile.countryCode === 'DE' ? '26,540.12' : 
                          profile.countryCode === 'JP' ? '2,740.15' : '0.00'}
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: "65%" }}
                           className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                         />
                      </div>
                   </div>
                </div>
              </div>

              <div className="glass p-10 bg-black/20 border-cyber-red/10 text-left">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3 bg-cyber-red/10 text-cyber-red rounded-xl">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter">Security Protocols</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Privacy & Encryption Settings</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                     <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                           <Key size={14} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase mb-1">Credential Matrix</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase">••••••••••••••••</p>
                        </div>
                     </div>
                     <button 
                       onClick={handlePasswordReset}
                       className="px-3 py-1.5 bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple rounded-lg text-[9px] font-black uppercase hover:bg-cyber-purple/20 transition-all flex items-center gap-2"
                     >
                       {resetSent ? 'Link Dispatched' : 'Initiate Secure Reset'}
                     </button>
                  </div>

                  <AnimatePresence>
                     {(resetSent || resetError) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={cn(
                            "p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center",
                            resetSent ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cyber-red/10 text-cyber-red border border-cyber-red/20"
                          )}
                        >
                          {resetSent ? 'Check your secure terminal (email) for instructions' : resetError}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                     <div>
                        <p className="text-xs font-black text-white uppercase mb-1">Two-Factor Authentication</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Hardware Key Sync Enabled</p>
                     </div>
                     <div className="w-10 h-5 bg-emerald-500/20 rounded-full flex items-center px-1 border border-emerald-500/30 font-black text-[8px] text-emerald-400 justify-end">ON</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 opacity-50">
                     <div>
                        <p className="text-xs font-black text-white uppercase mb-1">Session Auto-Terminator</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Wipe local data after 15m idle</p>
                     </div>
                     <div className="w-10 h-5 bg-white/10 rounded-full flex items-center px-1 border border-white/10 font-black text-[8px] text-slate-400">OFF</div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Sidebar details */}
        <div className="space-y-8">
           <div className="glass p-8 bg-cyber-purple/5 text-left border-cyber-purple/20">
              <h4 className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.3em] mb-6">Identity Logs</h4>
              <div className="space-y-6">
                 <div className="group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <Calendar size={10} /> Sync Date
                    </p>
                    <p className="text-xs font-black text-white uppercase tracking-widest">{new Date(profile.joiningDate).toLocaleDateString()}</p>
                 </div>
                 <div className="group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <CreditCard size={10} /> Last Transaction
                    </p>
                    <p className="text-xs font-black text-white uppercase tracking-widest">SHP-402 • -$1,240.00</p>
                 </div>
                 <div className="group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                       <Lock size={10} /> Last Login
                    </p>
                    <p className="text-xs font-black text-white uppercase tracking-widest">{new Date(profile.lastLogin).toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div className="glass p-8 bg-black/20 text-left">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Neural Achievements</h4>
              <div className="space-y-4">
                 {[
                    { label: 'Quantum Sourcing', icon: Award, color: 'text-amber-500' },
                    { label: 'Alpha Deliver', icon: Award, color: 'text-blue-500' },
                 ].map((ach, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                       <div className={ach.color}><ach.icon size={16} /></div>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">{ach.label}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-6 border border-cyber-red/20 bg-cyber-red/5 rounded-3xl text-left">
              <div className="flex gap-4 items-center mb-4">
                 <AlertCircle size={16} className="text-cyber-red" />
                 <h4 className="text-[10px] font-black text-cyber-red uppercase tracking-widest">Security Warning</h4>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase pr-4">You are currently operating on an unencrypted public node. Secure all local neural links before committing bulk transactions.</p>
           </div>
        </div>
      </div>
    </div>
  );
};
