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
            className="absolute bg-accent/20 blur-[80px] rounded-full"
            animate={{
              scale: isHovered ? 1.4 : 1,
              rotate: 360,
              x: isHovered ? [-5, 5, -5] : [0, 0],
              y: isHovered ? [-10, 10, -10] : [0, 0]
            }}
            transition={{
              scale: { duration: 1.2, ease: [0.23, 1, 0.32, 1] },
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 10, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{
              width: isHovered ? "180%" : "140%",
              height: isHovered ? "240%" : "180%",
            }}
          />

          {/* Glow aura (Deep gradient) */}
          <motion.div 
            className="absolute inset-0 bg-accent/10 blur-[130px] rounded-full"
            animate={{ 
              scale: isHovered ? 1.6 : 1.1,
              opacity: isHovered ? 0.5 : 0.25
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ width: "130%", height: "150%" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
