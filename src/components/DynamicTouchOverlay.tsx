import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const DynamicTouchOverlay: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev.slice(-5), newRipple]);
      
      // Auto-remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Dynamic Cursor Glow */}
      <motion.div
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
        }}
        className="absolute w-[600px] h-[600px] bg-gradient-to-r from-cyber-blue/5 via-cyber-purple/5 to-cyber-red/5 rounded-full blur-[120px] mix-blend-screen"
      />
      
      {/* Ripple Sensation */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              left: ripple.x,
              top: ripple.y,
              x: '-50%',
              y: '-50%',
            }}
            className="absolute w-20 h-20 rounded-full border-2 border-white/20 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-red opacity-10 blur-sm"
          />
        ))}
      </AnimatePresence>

      {/* Floating Rainbow Particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%'
            }}
            animate={{ 
              y: ['0%', '100%'],
              opacity: [0, 0.4, 0],
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-cyber-purple to-transparent blur-sm"
          />
        ))}
      </div>
    </div>
  );
};
