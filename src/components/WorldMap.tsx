import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { Shipment } from '../types';
import { cn } from '../lib/utils';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  shipments: Shipment[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ shipments }) => {
  // Simplified marker data based on real locations
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
  ];

  // Map shipments to routes
  const routes = useMemo(() => {
    return shipments.slice(0, 15).map(s => {
      const from = locations.find(l => s.origin.includes(l.name.split(',')[0]));
      const to = locations.find(l => s.destination.includes(l.name.split(',')[0]));
      if (from && to) return { from: from.coordinates, to: to.coordinates, id: s.id, status: s.status };
      return null;
    }).filter(Boolean);
  }, [shipments]);

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <ComposableMap 
        projectionConfig={{ scale: 200, center: [20, 0] }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#ecf2f7"
                stroke="#d1dce5"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#e2e8f0", outline: "none" },
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
              stroke={route.status === 'delayed' ? "#f97316" : "#3b82f6"}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              strokeOpacity={0.4}
            />
            {/* Pulsing indicator on line */}
            <Marker coordinates={route.from}>
               <circle r={2} fill={route.status === 'delayed' ? "#f97316" : "#3b82f6"} />
            </Marker>
          </React.Fragment>
        ))}

        {locations.map((loc) => (
          <Marker key={loc.name} coordinates={loc.coordinates as [number, number]}>
            <g transform="translate(-8, -8)">
              <circle cx="8" cy="8" r="4" fill="white" stroke="#2563eb" strokeWidth={2} />
              {/* Optional labels for priority ports */}
              {(loc.name.includes('Shanghai') || loc.name.includes('Rotterdam')) && (
                <text
                  x="12"
                  y="4"
                  textAnchor="start"
                  style={{ fontSize: "6px", fontWeight: "bold", fill: "#1e293b", textTransform: "uppercase" }}
                >
                  {loc.name.split(',')[0]}
                </text>
              )}
            </g>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};
