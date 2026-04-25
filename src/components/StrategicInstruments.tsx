import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Shield, Zap, Target, Flame } from 'lucide-react';

interface GaugeProps {
  value: number;
  label: string;
  sublabel: string;
  icon: any;
  color: string;
  glowColor: string;
}

export const RadialGauge: React.FC<GaugeProps> = ({ value, label, sublabel, icon: Icon, color, glowColor }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background Track */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            className="text-white/5"
          />
          {/* Progress Path */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: "easeOut" }}
            cx="64"
            cy="64"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeLinecap="round"
            style={{ 
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <Icon size={20} className="mb-1" style={{ color }} />
           <span className="text-xl font-black text-white leading-none">{value}%</span>
        </div>
      </div>
      <div className="mt-4 text-center">
         <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{label}</h4>
         <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">{sublabel}</p>
      </div>
    </div>
  );
};

export const StrategicInstruments: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 px-8 glass bg-white/[0.01] border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <RadialGauge 
        value={94} 
        label="Yield Stability" 
        sublabel="Optimized Vector" 
        icon={Zap} 
        color="#00f2ff" 
        glowColor="rgba(0, 242, 255, 0.5)" 
      />
      <RadialGauge 
        value={82} 
        label="Risk Exposure" 
        sublabel="Secure Threshold" 
        icon={Shield} 
        color="#bc00ff" 
        glowColor="rgba(188, 0, 255, 0.5)" 
      />
      <RadialGauge 
        value={71} 
        label="Node Velocity" 
        sublabel="Growth Scaling" 
        icon={Target} 
        color="#10b981" 
        glowColor="rgba(16, 185, 129, 0.5)" 
      />
      <RadialGauge 
        value={12} 
        label="Latent Drift" 
        sublabel="Minimal Variance" 
        icon={Flame} 
        color="#f59e0b" 
        glowColor="rgba(245, 158, 11, 0.5)" 
      />
    </div>
  );
};
