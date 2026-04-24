import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const DynamicTouchOverlay: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Follower Glow */}
      <motion.div
        style={{
          left: springX,
          top: springY,
          x: '-50%',
          y: '-50%',
        }}
        className="absolute w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]"
      />
      
      {/* Fine Cursor Dot */}
      <motion.div
        style={{
          left: mouseX,
          top: mouseY,
          x: '-50%',
          y: '-50%',
        }}
        className="absolute w-1 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] opacity-20"
      />

      {/* Floating Particles (Simulated HUD UI elements) */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: Math.random() * 100 + '%' }}
            animate={{ 
              y: ['0%', '100%'],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-[1px] h-20 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"
          />
        ))}
      </div>
    </div>
  );
};
