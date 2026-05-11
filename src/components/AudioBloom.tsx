'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioBloom({ active, isHovered }: { active: boolean; isHovered: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]"
          initial={{ opacity: 0, filter: "blur(40px)", scale: 0.5 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(40px)", scale: 0.5 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* The Blob (Oil Spill) */}
          <motion.div
            className="absolute bg-accent/40"
            animate={{
              scale: isHovered ? 1.4 : 1,
              filter: isHovered ? "blur(40px)" : "blur(25px)",
              borderRadius: isHovered 
                ? [
                    "30% 70% 70% 30% / 30% 30% 70% 70%",
                    "50% 50% 20% 80% / 25% 80% 20% 75%",
                    "30% 70% 70% 30% / 30% 30% 70% 70%"
                  ]
                : [
                    "40% 60% 70% 30% / 40% 50% 60% 50%",
                    "60% 40% 30% 70% / 50% 60% 40% 60%",
                    "40% 60% 70% 30% / 40% 50% 60% 50%"
                  ],
            }}
            transition={{
              scale: { duration: 1.2, ease: [0.23, 1, 0.32, 1] },
              filter: { duration: 1.5 },
              borderRadius: { 
                duration: isHovered ? 4 : 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }
            }}
            style={{
              width: isHovered ? "180%" : "140%",
              height: isHovered ? "240%" : "180%",
            }}
          />

          {/* Glow aura (Deep gradient) */}
          <motion.div 
            className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"
            animate={{ 
              scale: isHovered ? 1.6 : 1.1,
              opacity: isHovered ? 0.8 : 0.4
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ width: "130%", height: "150%" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
