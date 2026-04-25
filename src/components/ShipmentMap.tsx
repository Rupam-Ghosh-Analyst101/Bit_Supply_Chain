import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Shipment } from '../types';

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

interface ShipmentMapProps {
  shipment: Shipment;
  height?: number;
}

const CITY_COORDS: Record<string, [number, number]> = {
  'Shanghai, CN': [121.4737, 31.2304],
  'Rotterdam, NL': [4.4777, 51.9225],
  'Singapore, SG': [103.8198, 1.3521],
  'Los Angeles, US': [-118.2437, 34.0522],
  'Hamburg, DE': [9.9937, 53.5511],
  'New York, US': [-74.0060, 40.7128],
  'Tokyo, JP': [139.6503, 35.6762],
  'Sydney, AU': [151.2093, -33.8688],
};

export const ShipmentMap: React.FC<ShipmentMapProps> = ({ shipment, height = 300 }) => {
  const [activeTooltip, setActiveTooltip] = useState<{
    name: string;
    type: 'Origin' | 'Destination' | 'Current';
    coordinates: [number, number];
  } | null>(null);

  const originCoord = CITY_COORDS[shipment.origin] || [0, 0];
  const destCoord = CITY_COORDS[shipment.destination] || [0, 0];
  const currentCoord = (shipment.currentLat && shipment.currentLng) 
    ? [shipment.currentLng, shipment.currentLat] as [number, number]
    : originCoord;

  // Calculate center and zoom for a mini map
  const center: [number, number] = [
    (originCoord[0] + destCoord[0]) / 2,
    (originCoord[1] + destCoord[1]) / 2
  ];

  return (
    <div className="w-full bg-slate-950 rounded-xl border border-blue-500/20 overflow-hidden relative" style={{ height }}>
      {/* Decorative Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)]" />
      
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 120
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <filter id="map-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#0a0a1f"
                stroke="#1e293b"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#161633" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Route Line */}
        <Line
          from={originCoord}
          to={destCoord}
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeOpacity={0.4}
        />

        {/* Origin Marker */}
        <Marker 
          coordinates={originCoord}
          onClick={() => setActiveTooltip({ name: shipment.origin, type: 'Origin', coordinates: originCoord })}
        >
          <motion.circle 
            r={4} 
            fill="#475569" 
            stroke="#fff" 
            strokeWidth={1} 
            whileHover={{ scale: 1.5 }}
            className="cursor-pointer"
          />
        </Marker>

        {/* Destination Marker */}
        <Marker 
          coordinates={destCoord}
          onClick={() => setActiveTooltip({ name: shipment.destination, type: 'Destination', coordinates: destCoord })}
        >
          <motion.circle 
            r={4} 
            fill="#3b82f6" 
            stroke="#fff" 
            strokeWidth={1}
            whileHover={{ scale: 1.5 }}
            className="cursor-pointer"
          />
        </Marker>

        {/* Current Location Marker with Ripple */}
        <Marker 
          coordinates={currentCoord}
          onClick={() => setActiveTooltip({ name: 'Current Telemetry Pos', type: 'Current', coordinates: currentCoord })}
        >
          <g className="cursor-pointer">
            <circle r={10} fill="#3b82f6" opacity={0.2}>
              <animate attributeName="r" from="2" to="15" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <motion.circle 
              r={5} 
              fill="#3b82f6" 
              stroke="#fff" 
              strokeWidth={1.5} 
              filter="url(#map-glow)"
              whileHover={{ scale: 1.2 }}
            />
          </g>
        </Marker>
      </ComposableMap>

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-4 right-4 z-50 glass-card p-4 border-blue-500/30 w-64 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{activeTooltip.type} NODE</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">{activeTooltip.name}</h4>
              </div>
              <button 
                onClick={() => setActiveTooltip(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-slate-500 font-mono tracking-widest">Shipment ID:</span>
                <span className="text-blue-400 font-mono font-black">{shipment.id}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-slate-500 font-mono tracking-widest">Status:</span>
                <span className="text-white font-black">{shipment.status.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase font-bold">
                <span className="text-slate-500 font-mono tracking-widest">Lat/Lng:</span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {activeTooltip.coordinates[1].toFixed(2)}°N, {activeTooltip.coordinates[0].toFixed(2)}°E
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] text-slate-400 leading-relaxed italic">
                {activeTooltip.type === 'Current' 
                  ? 'Real-time telemetry link active via Orbital-4.' 
                  : `Primary logistical hub for ${activeTooltip.type.toLowerCase()} execution.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Corner UI Accents */}
      <div className="absolute top-3 left-3 flex flex-col gap-1 opacity-50">
        <div className="w-8 h-[1px] bg-blue-500/40" />
        <div className="w-4 h-[1px] bg-blue-500/40" />
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-blue-400/40 uppercase tracking-widest">
        Asset Tracking Active
      </div>
    </div>
  );
};
