export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  eta: string;
  predictedEta?: string;
  currentLat?: number;
  currentLng?: number;
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  carrier: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stockLevel: number;
  warehouse: string;
  reorderPoint: number;
  category: string;
  unitPrice: number;
}

export interface PricingRecord {
  id: string;
  productId: string;
  basePrice: number;
  currentPrice: number;
  demandFactor: number; // 0.0 to 2.0
  supplyFactor: number; // 0.0 to 2.0
  competitorPrice: number;
  lastAdjustmentReason: string;
  updatedAt: string;
}

export type ViewType = 'dashboard' | 'shipments' | 'inventory' | 'pricing' | 'insights';
