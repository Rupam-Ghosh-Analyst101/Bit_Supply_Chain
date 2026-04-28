/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ShipmentList } from './components/ShipmentList';
import { InventoryGrid } from './components/InventoryGrid';
import { PricingMatrix } from './components/PricingMatrix';
import { SourcingOperator } from './components/SourcingOperator';
import { ManufacturingPulse } from './components/ManufacturingPulse';
import { DistributionFlow } from './components/DistributionFlow';
import { CustomerCenter } from './components/CustomerCenter';
import { AIInsights } from './components/AIInsights';
import { MarketExplorer } from './components/MarketExplorer';
import { ClientPortal } from './components/ClientPortal';
import { AccountProfile } from './components/AccountProfile';
import { OrderHistory } from './components/OrderHistory';
import { Holdings } from './components/Holdings';
import { Login } from './components/Login';
import { PortfolioIntelligence } from './components/PortfolioIntelligence';
import { collection, onSnapshot, query, setDoc, doc, getDocs, limit, where } from 'firebase/firestore';
import { db, handleFirestoreError } from './lib/firebase';
import { Shipment, InventoryItem, PricingRecord, ViewType, SourcingRecord, ManufacturingJob, ClientOrder } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';
import { cn } from './lib/utils';

import { DynamicTouchOverlay } from './components/DynamicTouchOverlay';

function AppContent() {
  const { user, loading: authLoading, role, isAdmin, signIn, logout, enrollmentDetails } = useAuth();
  const [adminChecked, setAdminChecked] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [viewParams, setViewParams] = useState<any>(null);

  const handleViewChange = (view: ViewType, params?: any) => {
    setCurrentView(view);
    setViewParams(params);
  };

  useEffect(() => {
    if (user && !authLoading) {
      setAdminChecked(true);
      
      // Check and create profile if enrolled via login form
      const setupProfile = async () => {
        try {
          const profileRef = doc(db, 'client_profiles', user.uid);
          const profileSnap = await getDocs(query(collection(db, 'client_profiles'), where('id', '==', user.uid), limit(1)));
          
          if (profileSnap.empty && enrollmentDetails) {
            const newProfile = {
              id: user.uid,
              name: enrollmentDetails.name,
              email: user.email || '',
              address: 'Neural Sector 9, Orbital Ring Alpha',
              countryCode: enrollmentDetails.country,
              joiningDate: new Date().toISOString(),
              balance: 1000000.00, // Starting balance for new neural nodes
              lastLogin: new Date().toISOString(),
              securityLevel: 'Neural',
              isTwoFactorEnabled: true
            };
            await setDoc(profileRef, newProfile);
            triggerNotification("IDENTITY MATRIX SYNCHRONIZED: Neural profile established.", "success");
          }
        } catch (err) {
          console.error("Profile setup error:", err);
        }
      };
      setupProfile();
    }
  }, [user, authLoading, enrollmentDetails]);
  
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pricing, setPricing] = useState<PricingRecord[]>([]);
  const [sourcing, setSourcing] = useState<SourcingRecord[]>([]);
  const [manufacturing, setManufacturing] = useState<ManufacturingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const triggerNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Live Purchase Notifications
  useEffect(() => {
    if (!user) return;
    
    // Start listening from current time
    const startTime = Date.now();
    const ordersQuery = query(
      collection(db, 'client_orders'),
      where('type', '==', 'buy'),
      where('timestamp', '>', startTime)
    );

    const unsub = onSnapshot(ordersQuery, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const order = change.doc.data() as ClientOrder;
          triggerNotification(`SECURE TRANSACTION: Asset ${order.ticker} acquired for $${order.price.toLocaleString()}`, 'success');
        }
      });
    }, (err) => handleFirestoreError(err, 'list', 'client_orders (live notifications)'));

    return () => unsub();
  }, [user]);

  // Seed Data for demonstration if collections are empty
  useEffect(() => {
    if (!user || !adminChecked) return;

    const seedData = async () => {
      const shipQuery = isAdmin 
        ? collection(db, 'shipments') 
        : query(collection(db, 'shipments'), where('clientId', '==', user.uid));
      
      try {
        const shipSnap = await getDocs(query(shipQuery, limit(1)));
        if (shipSnap.empty) {
          setLoading(true);
          try {
            const initialShipments: Partial<Shipment>[] = [
              { 
                id: 'SH-7721', origin: 'Shanghai, CN', destination: 'Rotterdam, NL', status: 'in-transit', 
                eta: '2026-05-12T14:00:00Z', predictedEta: '2026-05-10T11:00:00Z', carrier: 'Maersk Line', priority: 'high', 
                currentLat: 31.2304, currentLng: 121.4737, clientId: user.uid,
                history: [
                  { timestamp: '2026-04-20T08:00:00Z', status: 'pending', message: 'Order received and processing.' },
                  { timestamp: '2026-04-21T14:30:00Z', status: 'in-transit', location: 'Shanghai Port', message: 'Departure confirmed.' }
                ]
              },
              { 
                id: 'SH-8822', origin: 'Singapore, SG', destination: 'Los Angeles, US', status: 'delayed', 
                eta: '2026-05-08T09:30:00Z', predictedEta: '2026-05-11T16:45:00Z', carrier: 'COSCO', priority: 'critical', 
                currentLat: 1.3521, currentLng: 103.8198, clientId: user.uid,
                history: [
                  { timestamp: '2026-04-18T10:00:00Z', status: 'pending', message: 'Cargo scanned.' },
                  { timestamp: '2026-04-22T04:15:00Z', status: 'delayed', location: 'Pacific Ocean', message: 'Weather anomaly detected.' }
                ]
              },
            ];
            for (const s of initialShipments) {
              await setDoc(doc(db, 'shipments', s.id!), { ...s, lastUpdated: new Date().toISOString() });
            }

            const initialInventory: InventoryItem[] = [
              { id: 'INV-001', name: 'Nvidia H100 GPU', stockLevel: 450, warehouse: 'Santa Clara Huber', reorderPoint: 500, category: 'Semiconductors', unitPrice: 25000, clientId: user.uid },
              { id: 'INV-002', name: 'Lithium Cell XL-2', stockLevel: 2800, warehouse: 'Tesla Giga Berlin', reorderPoint: 1500, category: 'Energy Storage', unitPrice: 120, clientId: user.uid },
            ];
            for (const i of initialInventory) {
              await setDoc(doc(db, 'inventory', i.id), i);
            }

            const initialPricing: PricingRecord[] = [
              { 
                id: 'PRC-001', productId: 'Nvidia H100 GPU', basePrice: 25000, currentPrice: 28500, 
                demandFactor: 1.8, supplyFactor: 0.4, competitorPrice: 31000, 
                lastAdjustmentReason: 'Supply shortage in TSM node. High demand from model trainers.',
                updatedAt: new Date().toISOString()
              },
              { 
                id: 'PRC-002', productId: 'Lithium Cell XL-2', basePrice: 120, currentPrice: 135,
                demandFactor: 1.2, supplyFactor: 1.1, competitorPrice: 140,
                lastAdjustmentReason: 'Increased raw material costs. Stable inventory levels.',
                updatedAt: new Date().toISOString()
              },
              { 
                id: 'PRC-003', productId: 'Quantum Chip Q1', basePrice: 5000, currentPrice: 4800,
                demandFactor: 0.7, supplyFactor: 1.5, competitorPrice: 5200,
                lastAdjustmentReason: 'Inventory surplus. Price drop to stimulate mid-tier adoption.',
                updatedAt: new Date().toISOString()
              }
            ];
            for (const p of initialPricing) {
              await setDoc(doc(db, 'pricing', p.id), p);
            }

            const initialManufacturing: ManufacturingJob[] = [
              { 
                id: 'JOB-901', productName: 'Neural-Link v4', quantity: 1500, status: 'production', 
                efficiency: 94, startDate: '2026-04-15T00:00:00Z', clientId: user.uid,
                targetProductionRate: 45, machinesAllocated: 12, qualityThreshold: 99.8
              },
              { 
                id: 'JOB-902', productName: 'Quantum-Core 2', quantity: 500, status: 'planning', 
                efficiency: 0, startDate: '2026-05-01T00:00:00Z', clientId: user.uid,
                targetProductionRate: 10, machinesAllocated: 4, qualityThreshold: 99.99
              },
              { 
                id: 'JOB-903', productName: 'Nano-Battery Pack', quantity: 10000, status: 'quality-check', 
                efficiency: 88, startDate: '2026-04-10T00:00:00Z', clientId: user.uid,
                targetProductionRate: 200, machinesAllocated: 24, qualityThreshold: 98.5
              }
            ];
            for (const m of initialManufacturing) {
              await setDoc(doc(db, 'manufacturing', m.id), m);
            }
          } finally {
            setLoading(false);
          }
        }
      } catch (err) {
        handleFirestoreError(err, 'list', 'shipments (seed)');
      }
    };

    seedData();
  }, [user, isAdmin, adminChecked]);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const isOperatorView = role === 'operator';
    const shipQuery = isOperatorView 
      ? collection(db, 'shipments') 
      : query(collection(db, 'shipments'), where('clientId', '==', user.uid));
    
    const unsubShip = onSnapshot(shipQuery, (snap) => {
      setShipments(snap.docs.map(d => ({ ...d.data(), id: d.id } as Shipment)));
    }, (err) => handleFirestoreError(err, 'list', 'shipments'));

    const invQuery = isOperatorView
      ? collection(db, 'inventory')
      : query(collection(db, 'inventory'), where('clientId', '==', user.uid));

    const unsubInv = onSnapshot(invQuery, (snap) => {
      setInventory(snap.docs.map(d => ({ ...d.data(), id: d.id } as InventoryItem)));
    }, (err) => handleFirestoreError(err, 'list', 'inventory'));

    const unsubPrice = onSnapshot(collection(db, 'pricing'), (snap) => {
      setPricing(snap.docs.map(d => ({ ...d.data(), id: d.id } as PricingRecord)));
    }, (err) => handleFirestoreError(err, 'list', 'pricing'));

    const sourceQuery = isOperatorView
      ? collection(db, 'sourcing')
      : query(collection(db, 'sourcing'), where('clientId', '==', user.uid));

    const unsubSource = onSnapshot(sourceQuery, (snap) => {
      setSourcing(snap.docs.map(d => ({ ...d.data(), id: d.id } as SourcingRecord)));
    }, (err) => handleFirestoreError(err, 'list', 'sourcing'));

    const manufQuery = isOperatorView
      ? collection(db, 'manufacturing')
      : query(collection(db, 'manufacturing'), where('clientId', '==', user.uid));

    const unsubManuf = onSnapshot(manufQuery, (snap) => {
      setManufacturing(snap.docs.map(d => ({ ...d.data(), id: d.id } as ManufacturingJob)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, 'list', 'manufacturing'));

    return () => {
      unsubShip();
      unsubInv();
      unsubPrice();
      unsubSource();
      unsubManuf();
    };
  }, [user, role, isAdmin]);

  if (authLoading) return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center cyber-grid overflow-hidden">
      <div className="relative">
        <div className="w-32 h-32 border border-white/5 rounded-full" />
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="absolute inset-0 w-32 h-32 border-t-2 border-cyber-blue rounded-full shadow-[0_0_20px_rgba(0,242,255,0.4)]" 
        />
        <div className="absolute inset-0 flex items-center justify-center">
           <Activity className="text-cyber-blue animate-pulse" size={40} />
        </div>
        <div className="mt-12 text-[10px] font-black text-cyber-blue tracking-[0.4em] text-center animate-pulse uppercase">System Link Syncing...</div>
      </div>
    </div>
  );

  if (!user) return <Login onLogin={signIn} />;

  const renderView = () => {
    const props = {
      shipments,
      inventory,
      pricing,
      manufacturing,
      sourcing,
      onAction: triggerNotification,
      onViewChange: handleViewChange
    };

    return (
      <div className="animate-in fade-in zoom-in-95 duration-700">
        {(() => {
          switch (currentView) {
            case 'dashboard': return <Dashboard {...props} />;
            case 'sourcing': return <SourcingOperator sourcing={sourcing} onAction={triggerNotification} />;
            case 'manufacturing': return <ManufacturingPulse jobs={manufacturing} onAction={triggerNotification} />;
            case 'inventory': return <InventoryGrid inventory={inventory} onAction={triggerNotification} />;
            case 'shipments': return <ShipmentList shipments={shipments} onAction={triggerNotification} />;
            case 'distribution': return <DistributionFlow shipments={shipments} />;
            case 'customer': return <CustomerCenter />;
            case 'pricing': return <PricingMatrix pricing={pricing} onAction={triggerNotification} />;
            case 'market': return <MarketExplorer startingTicker={viewParams?.ticker} />;
            case 'holdings': return <Holdings />;
            case 'orders': return <OrderHistory />;
            case 'client-portal': return <ClientPortal />;
            case 'profile': return <AccountProfile />;
            case 'insights': return <AIInsights contextData={{ shipments, inventory, pricing, sourcing, manufacturing }} />;
            case 'intelligence': return <PortfolioIntelligence />;
            default: return <Dashboard {...props} />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-bg-deep cyber-grid selection:bg-cyber-blue/30 selection:text-cyber-blue">
      <DynamicTouchOverlay />
      
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={logout}
        onAction={triggerNotification}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-500 min-w-0 pb-12",
        sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
      )}>
        <div className="p-4 md:p-10 lg:p-12">
           {renderView()}
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[200] px-8 py-4 bg-slate-900 border border-cyber-blue/30 text-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[300px]"
          >
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              notification.type === 'success' ? 'bg-emerald-500' : 
              notification.type === 'warning' ? 'bg-cyber-red' : 'bg-cyber-blue'
            )} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
