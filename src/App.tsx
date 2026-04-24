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
import { AIInsights } from './components/AIInsights';
import { Login } from './components/Login';
import { collection, onSnapshot, query, setDoc, doc, getDocs, limit } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Shipment, InventoryItem, PricingRecord, ViewType } from './types';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

function AppContent() {
  const { user, loading: authLoading, signIn, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pricing, setPricing] = useState<PricingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Seed Data for demonstration if collections are empty
  useEffect(() => {
    if (!user) return;

    const seedData = async () => {
      const shipSnap = await getDocs(query(collection(db, 'shipments'), limit(1)));
      if (shipSnap.empty) {
        console.log("Seeding initial supply chain data...");
        
        // Seed Shipments
        const initialShipments: Partial<Shipment>[] = [
          { id: 'SH-7721', origin: 'Shanghai, CN', destination: 'Rotterdam, NL', status: 'in-transit', eta: '2026-05-12T14:00:00Z', predictedEta: '2026-05-10T11:00:00Z', carrier: 'Maersk Line', priority: 'high' },
          { id: 'SH-8822', origin: 'Singapore, SG', destination: 'Los Angeles, US', status: 'delayed', eta: '2026-05-08T09:30:00Z', predictedEta: '2026-05-11T16:45:00Z', carrier: 'COSCO', priority: 'critical' },
          { id: 'SH-9910', origin: 'Hamburg, DE', destination: 'New York, US', status: 'delivered', eta: '2026-04-22T11:00:00Z', predictedEta: '2026-04-21T08:00:00Z', carrier: 'Hapag-Lloyd', priority: 'medium' },
          { id: 'SH-4450', origin: 'Tokyo, JP', destination: 'Sydney, AU', status: 'pending', eta: '2026-05-15T18:00:00Z', predictedEta: '2026-05-14T10:00:00Z', carrier: 'ONE', priority: 'low' },
        ];
        for (const s of initialShipments) {
          await setDoc(doc(db, 'shipments', s.id!), { ...s, lastUpdated: new Date().toISOString() });
        }

        // Seed Inventory
        const initialInventory: InventoryItem[] = [
          { id: 'INV-001', name: 'Nvidia H100 GPU', stockLevel: 450, warehouse: 'Santa Clara Huber', reorderPoint: 500, category: 'Semiconductors', unitPrice: 25000 },
          { id: 'INV-002', name: 'Lithium Cell XL-2', stockLevel: 2800, warehouse: 'Tesla Giga Berlin', reorderPoint: 1500, category: 'Energy Storage', unitPrice: 120 },
          { id: 'INV-003', name: 'Carbon Fiber Frame v4', stockLevel: 12, warehouse: 'Modena Assembly', reorderPoint: 25, category: 'Automotive', unitPrice: 3400 },
          { id: 'INV-004', name: 'OLED Display 14"', stockLevel: 12000, warehouse: 'Seoul Logistics', reorderPoint: 5000, category: 'Electronics', unitPrice: 180 },
        ];
        for (const i of initialInventory) {
          await setDoc(doc(db, 'inventory', i.id), i);
        }

        // Seed Pricing
        const initialPricing: PricingRecord[] = [
          { id: 'PR-NVD', productId: 'Nvidia H100', basePrice: 25000, currentPrice: 28450, demandFactor: 1.8, supplyFactor: 1.4, competitorPrice: 27900, lastAdjustmentReason: 'Supply shortage in advanced node fabrication.', updatedAt: new Date().toISOString() },
          { id: 'PR-LTH', productId: 'Lithium Cell', basePrice: 120, currentPrice: 115, demandFactor: 0.9, supplyFactor: 1.1, competitorPrice: 118, lastAdjustmentReason: 'Increased mining yield in South America.', updatedAt: new Date().toISOString() },
          { id: 'PR-OLED', productId: 'OLED 14"', basePrice: 180, currentPrice: 205, demandFactor: 1.5, supplyFactor: 1.2, competitorPrice: 198, lastAdjustmentReason: 'Anticipated Q3 consumer electronics surge.', updatedAt: new Date().toISOString() },
        ];
        for (const p of initialPricing) {
          await setDoc(doc(db, 'pricing', p.id), p);
        }
      }
    };

    seedData();
  }, [user]);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const unsubShip = onSnapshot(collection(db, 'shipments'), (snap) => {
      setShipments(snap.docs.map(d => d.data() as Shipment));
    });
    const unsubInv = onSnapshot(collection(db, 'inventory'), (snap) => {
      setInventory(snap.docs.map(d => d.data() as InventoryItem));
    });
    const unsubPrice = onSnapshot(collection(db, 'pricing'), (snap) => {
      setPricing(snap.docs.map(d => d.data() as PricingRecord));
      setLoading(false);
    });

    return () => {
      unsubShip();
      unsubInv();
      unsubPrice();
    };
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen bg-bg-dark grid-pattern flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin" />
        <div className="mt-8 text-[10px] text-cyan-400 font-mono tracking-widest text-center animate-pulse">SYNCING...</div>
      </div>
    </div>
  );

  if (!user) return <Login onLogin={signIn} />;

  const renderView = () => {
    return (
      <motion.div
        key={currentView}
        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {(() => {
          switch (currentView) {
            case 'dashboard': return <Dashboard shipments={shipments} inventory={inventory} pricing={pricing} />;
            case 'shipments': return <ShipmentList shipments={shipments} />;
            case 'inventory': return <InventoryGrid inventory={inventory} />;
            case 'pricing': return <PricingMatrix pricing={pricing} />;
            case 'insights': return <AIInsights contextData={{ shipments, inventory, pricing }} />;
            default: return <Dashboard shipments={shipments} inventory={inventory} pricing={pricing} />;
          }
        })()}
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-bg-dark grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={logout} 
        userEmail={user.email || 'Admin'}
      />
      
      <main className="flex-1 xl:ml-64 transition-all duration-300 min-w-0">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12 mb-20 md:mb-0">
          {renderView()}
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 right-0 left-0 xl:left-64 h-8 px-6 flex items-center justify-between text-[9px] text-white/20 border-t border-white/5 bg-black/80 backdrop-blur-sm z-30 font-mono tracking-tighter">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <div className="w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
            SECURE NODE: {user?.uid.slice(0, 8).toUpperCase() || 'OFFLINE'}
          </span>
          <span className="hidden md:inline">SYSTEM: v1.0.4-LNX</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1"><Activity size={10} className="text-emerald-500" /> LATENCY: 14MS</span>
          <span className="hidden sm:inline">ENCRYPTION: AES-256-GCM</span>
          <span className="text-white/40 uppercase font-bold tracking-widest">{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
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
