import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { Shipment } from '../types';
import { motion } from 'motion/react';

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

import { useAuth } from '../AuthContext';

interface WorldMapProps {
  shipments: Shipment[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ shipments }) => {
  const { role, isAdmin } = useAuth();
  const isOperator = role === 'operator' && isAdmin;
  const locations = [
    { name: 'Shanghai, CN', coordinates: [121.4737, 31.2304], type: 'port' },
    { name: 'Los Angeles, US', coordinates: [-118.2437, 34.0522], type: 'port' },
    { name: 'Rotterdam, NL', coordinates: [4.4792, 51.9225], type: 'port' },
    { name: 'Singapore, SG', coordinates: [103.8198, 1.3521], type: 'port' },
    { name: 'Hamburg, DE', coordinates: [9.9937, 53.5511], type: 'port' },
    { name: 'Dubai, AE', coordinates: [55.2708, 25.2048], type: 'port' },
    { name: 'Mumbai, IN', coordinates: [72.8777, 19.0760], type: 'port' },
    { name: 'Sao Paulo, BR', coordinates: [-46.6333, -23.5505], type: 'port' },
    { name: 'Sydney, AU', coordinates: [151.2093, -33.8688], type: 'port' },
    { name: 'London, UK', coordinates: [0.1276, 51.5074], type: 'port' },
    { name: 'New York, US', coordinates: [-74.0060, 40.7128], type: 'port' },
    { name: 'Tokyo, JP', coordinates: [139.6503, 35.6762], type: 'port' },
  ];

  const routes = useMemo(() => {
    return shipments.slice(0, 15).map(s => {
      const from = locations.find(l => s.origin.toLowerCase().includes(l.name.split(',')[0].toLowerCase()));
      const to = locations.find(l => s.destination.toLowerCase().includes(l.name.split(',')[0].toLowerCase()));
      if (from && to) return { from: from.coordinates, to: to.coordinates, id: s.id, status: s.status };
      return null;
    }).filter(Boolean);
  }, [shipments]);

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing bg-[#01030a] rounded-[inherit] overflow-hidden relative shadow-[inset_0_0_100px_rgba(0,242,255,0.05)]">
      {/* Neural Atmosphere Layer */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.03)_0%,transparent_80%)]" />
      
      <ComposableMap 
        projectionConfig={{ scale: 220, center: [10, 0] }}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00f2ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#05070f"
                stroke="rgba(0, 242, 255, 0.1)"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none", transition: "all 0.5s ease" },
                  hover: { fill: "#0c0f1a", outline: "none", stroke: "rgba(0, 242, 255, 0.4)", strokeWidth: 1 },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {routes.map((route: any, i) => (
          <React.Fragment key={route.id}>
            <Line
              from={route.from}
              to={route.to}
              stroke={route.status === 'delayed' ? "#ff0055" : "url(#line-gradient)"}
              strokeWidth={1}
              strokeOpacity={0.4}
            />
            {/* Animated Command Flow */}
            <Marker coordinates={route.from}>
              <motion.circle
                r={2}
                fill={route.status === 'delayed' ? "#ff0055" : "#00f2ff"}
                style={{ filter: 'url(#glow)' }}
                animate={{
                  cx: [0, route.to[0] - route.from[0]],
                  cy: [0, route.to[1] - route.from[1]],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4
                }}
              />
            </Marker>
          </React.Fragment>
        ))}

        {locations.map((loc) => (
          <Marker key={loc.name} coordinates={loc.coordinates as [number, number]}>
            <circle r={2} fill="#00f2ff" className="opacity-20" />
            <motion.circle
              r={1.5}
              fill="#00f2ff"
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ filter: 'url(#glow)' }}
            />
            <text
              y={-10}
              textAnchor="middle"
              style={{ 
                fontSize: "6px", 
                fontWeight: "900", 
                fill: "rgba(255,255,255,0.4)", 
                textTransform: "uppercase", 
                letterSpacing: "1px", 
                pointerEvents: 'none',
                fontFamily: 'monospace'
              }}
            >
              {loc.name.split(',')[0]}
            </text>
          </Marker>
        ))}
      </ComposableMap>
      
      {/* Telemetry HUD Elements */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
         <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-2 py-1 rounded border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] font-black text-white uppercase tracking-widest">Global Link Stable</span>
         </div>
         <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-2 py-1 rounded border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue" />
            <span className="text-[7px] font-black text-white uppercase tracking-widest">{isOperator ? "Neural Stream Active" : "Network Stream Active"}</span>
         </div>
      </div>
    </div>
  );
};

