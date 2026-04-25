export interface ShipmentHistory {
  timestamp: string;
  status: string;
  location?: string;
  message: string;
}

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
  clientId: string;
  history?: ShipmentHistory[];
}

export interface InventoryItem {
  id: string;
  name: string;
  stockLevel: number;
  warehouse: string;
  reorderPoint: number;
  category: string;
  unitPrice: number;
  clientId: string;
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

export interface MarketStock {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  volume: string;
  category: string;
  description: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  countryCode: string;
  joiningDate: string;
  balance: number;
  lastLogin: string;
  isTwoFactorEnabled: boolean;
  securityLevel: 'Standard' | 'Enhanced' | 'Neural';
}

export interface ClientRequest {
  id: string;
  clientId: string;
  type: 'procurement' | 'support' | 'custom-clearance';
  subject: string;
  description: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  status: 'verified' | 'pending' | 'rejected';
  uploadedAt: number;
}

export interface ClientOrder {
  id: string;
  clientId: string;
  stockId: string;
  ticker: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  status: 'filled' | 'pending' | 'cancelled';
  timestamp: number;
}

export interface StockNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  symbol?: string;
  url: string;
  category: 'market' | 'logistics' | 'commodity' | 'tech';
}

export interface VaultDocument {
  id: string;
  clientId: string;
  name: string;
  type: string;
  size: number;
  url: string;
  timestamp: number;
  category: 'contract' | 'shipping' | 'compliance' | 'other';
}

export type ViewType = 'dashboard' | 'sourcing' | 'manufacturing' | 'inventory' | 'shipments' | 'distribution' | 'customer' | 'pricing' | 'insights' | 'market' | 'client-portal' | 'orders' | 'profile' | 'holdings' | 'intelligence';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  change: string;
  author: string;
}

export interface SourcingRecord {
  id: string;
  vendorName: string;
  material: string;
  leadTime: number; // in days
  reliabilityRating: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAuditDate: string;
  clientId: string;
  auditTrail?: AuditEntry[];
}

export interface ManufacturingJob {
  id: string;
  productName: string;
  quantity: number;
  status: 'planning' | 'production' | 'quality-check' | 'completed';
  efficiency: number; // 0-100
  startDate: string;
  completionDate?: string;
  clientId: string;
  targetProductionRate?: number;
  machinesAllocated?: number;
  qualityThreshold?: number;
}
