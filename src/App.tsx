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
import { SourcingManager } from './components/SourcingManager';
import { ManufacturingPulse } from './components/ManufacturingPulse';
import { DistributionFlow } from './components/DistributionFlow';
import { CustomerCenter } from './components/CustomerCenter';
import { AIInsights } from './components/AIInsights';
import { Login } from './components/Login';
import { collection, onSnapshot, query, setDoc, doc, getDocs, limit } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Shipment, InventoryItem, PricingRecord, ViewType, SourcingRecord, ManufacturingJob } from './types';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

import { DynamicTouchOverlay } from './components/DynamicTouchOverlay';

function AppContent() {
  const { user, loading: authLoading, signIn, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pricing, setPricing] = useState<PricingRecord[]>([]);
  const [sourcing, setSourcing] = useState<SourcingRecord[]>([]);
  const [manufacturing, setManufacturing] = useState<ManufacturingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Seed Data for demonstration if collections are empty
  useEffect(() => {
    if (!user) return;

    const seedData = async () => {
      const shipSnap = await getDocs(query(collection(db, 'shipments'), limit(1)));
      if (shipSnap.empty) {
        // ... (seeding logic remains the same)
        const initialShipments: Partial<Shipment>[] = [
          { id: 'SH-7721', origin: 'Shanghai, CN', destination: 'Rotterdam, NL', status: 'in-transit', eta: '2026-05-12T14:00:00Z', predictedEta: '2026-05-10T11:00:00Z', carrier: 'Maersk Line', priority: 'high' },
          { id: 'SH-8822', origin: 'Singapore, SG', destination: 'Los Angeles, US', status: 'delayed', eta: '2026-05-08T09:30:00Z', predictedEta: '2026-05-11T16:45:00Z', carrier: 'COSCO', priority: 'critical' },
          { id: 'SH-9910', origin: 'Hamburg, DE', destination: 'New York, US', status: 'delivered', eta: '2026-04-22T11:00:00Z', predictedEta: '2026-04-21T08:00:00Z', carrier: 'Hapag-Lloyd', priority: 'medium' },
          { id: 'SH-4450', origin: 'Tokyo, JP', destination: 'Sydney, AU', status: 'pending', eta: '2026-05-15T18:00:00Z', predictedEta: '2026-05-14T10:00:00Z', carrier: 'ONE', priority: 'low' },
        ];
        for (const s of initialShipments) {
          await setDoc(doc(db, 'shipments', s.id!), { ...s, lastUpdated: new Date().toISOString() });
        }

        const initialInventory: InventoryItem[] = [
          { id: 'INV-001', name: 'Nvidia H100 GPU', stockLevel: 450, warehouse: 'Santa Clara Huber', reorderPoint: 500, category: 'Semiconductors', unitPrice: 25000 },
          { id: 'INV-002', name: 'Lithium Cell XL-2', stockLevel: 2800, warehouse: 'Tesla Giga Berlin', reorderPoint: 1500, category: 'Energy Storage', unitPrice: 120 },
          { id: 'INV-003', name: 'Carbon Fiber Frame v4', stockLevel: 12, warehouse: 'Modena Assembly', reorderPoint: 25, category: 'Automotive', unitPrice: 3400 },
          { id: 'INV-004', name: 'OLED Display 14"', stockLevel: 12000, warehouse: 'Seoul Logistics', reorderPoint: 5000, category: 'Electronics', unitPrice: 180 },
        ];
        for (const i of initialInventory) {
          await setDoc(doc(db, 'inventory', i.id), i);
        }

        const initialPricing: PricingRecord[] = [
          { id: 'PR-NVD', productId: 'Nvidia H100', basePrice: 25000, currentPrice: 28450, demandFactor: 1.8, supplyFactor: 1.4, competitorPrice: 27900, lastAdjustmentReason: 'Supply shortage in advanced node fabrication.', updatedAt: new Date().toISOString() },
          { id: 'PR-LTH', productId: 'Lithium Cell', basePrice: 120, currentPrice: 115, demandFactor: 0.9, supplyFactor: 1.1, competitorPrice: 118, lastAdjustmentReason: 'Increased mining yield in South America.', updatedAt: new Date().toISOString() },
          { id: 'PR-OLED', productId: 'OLED 14"', basePrice: 180, currentPrice: 205, demandFactor: 1.5, supplyFactor: 1.2, competitorPrice: 198, lastAdjustmentReason: 'Anticipated Q3 consumer electronics surge.', updatedAt: new Date().toISOString() },
        ];
        for (const p of initialPricing) {
          await setDoc(doc(db, 'pricing', p.id), p);
        }

        const initialSourcing: SourcingRecord[] = [
          { id: 'SRC-001', vendorName: 'Global Silicon Corp', material: 'Polysilicon', leadTime: 14, reliabilityRating: 98, riskLevel: 'low', lastAuditDate: '2026-03-01' },
          { id: 'SRC-002', vendorName: 'Andes Minerals', material: 'Lithium Carbonate', leadTime: 45, reliabilityRating: 72, riskLevel: 'high', lastAuditDate: '2026-04-10' },
          { id: 'SRC-003', vendorName: 'Euro-Assembly S.A.', material: 'Precision Machining', leadTime: 22, reliabilityRating: 92, riskLevel: 'medium', lastAuditDate: '2026-02-15' },
        ];
        for (const s of initialSourcing) {
          await setDoc(doc(db, 'sourcing', s.id), s);
        }

        const initialManufacturing: ManufacturingJob[] = [
          { id: 'JOB-9901', productName: 'H100 Core Alpha', quantity: 1200, status: 'production', efficiency: 94, startDate: '2026-04-20' },
          { id: 'JOB-9902', productName: 'PowerNode Battery Pack', quantity: 500, status: 'quality-check', efficiency: 88, startDate: '2026-04-15' },
          { id: 'JOB-9903', productName: 'Quantum Lattice v2', quantity: 2500, status: 'planning', efficiency: 100, startDate: '2026-05-01' },
          { id: 'JOB-9904', productName: 'Edge Vision Module', quantity: 8000, status: 'completed', efficiency: 97, startDate: '2026-04-01' },
        ];
        for (const m of initialManufacturing) {
          await setDoc(doc(db, 'manufacturing', m.id), m);
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
    });
    const unsubSource = onSnapshot(collection(db, 'sourcing'), (snap) => {
      setSourcing(snap.docs.map(d => d.data() as SourcingRecord));
    });
    const unsubManuf = onSnapshot(collection(db, 'manufacturing'), (snap) => {
      setManufacturing(snap.docs.map(d => d.data() as ManufacturingJob));
      setLoading(false);
    });

    return () => {
      unsubShip();
      unsubInv();
      unsubPrice();
      unsubSource();
      unsubManuf();
    };
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-t-2 border-primary rounded-full animate-spin" />
        <div className="mt-8 text-xs text-primary font-bold tracking-widest text-center animate-pulse">CONNECTING...</div>
      </div>
    </div>
  );

  if (!user) return <Login onLogin={signIn} />;

  const renderView = () => {
    return (
      <div className="animate-in fade-in duration-500">
        {(() => {
          switch (currentView) {
            case 'dashboard': return <Dashboard shipments={shipments} inventory={inventory} pricing={pricing} />;
            case 'sourcing': return <SourcingManager sourcing={sourcing} />;
            case 'manufacturing': return <ManufacturingPulse jobs={manufacturing} />;
            case 'inventory': return <InventoryGrid inventory={inventory} />;
            case 'shipments': return <ShipmentList shipments={shipments} />;
            case 'distribution': return <DistributionFlow shipments={shipments} />;
            case 'customer': return <CustomerCenter />;
            case 'pricing': return <PricingMatrix pricing={pricing} />;
            case 'insights': return <AIInsights contextData={{ shipments, inventory, pricing, sourcing, manufacturing }} />;
            default: return <Dashboard shipments={shipments} inventory={inventory} pricing={pricing} />;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-bg-main">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={logout}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 min-w-0 pb-12",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-6 md:p-8">
           {renderView()}
        </div>
      </main>
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
