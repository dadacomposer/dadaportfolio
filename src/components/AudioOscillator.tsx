'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  color: string;
  length: number;
  thickness: number;
  baseRadius: number;
}

export default function AudioOscillator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, analyzerData } = useAudio();
  
  // Use refs to access latest values in the animation loop without restarting effect
  const isPlayingRef = useRef(isPlaying);
  const analyzerDataRef = useRef(analyzerData);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    analyzerDataRef.current = analyzerData;
  }, [isPlaying, analyzerData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const colors = ['#3b82f6', '#60a5fa', '#ffffff', '#93c5fd'];
    const particles: Particle[] = Array.from({ length: 140 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.8;
      return {
        angle,
        radius,
        baseRadius: radius,
        speed: (Math.random() * 0.1 + 0.02) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        length: Math.random() * 5 + 2,
        thickness: Math.random() * 1.2 + 0.5,
      };
    });

    let currentMouseX = mouseX;
    let currentMouseY = mouseY;
    let audioSmooth = 0;
    let audioActiveMultiplier = 0; // New multiplier for smooth state transition

    const draw = () => {
      time += 0.005;
      
      // Extreme mouse smoothing (high inertia)
      currentMouseX += (mouseX - currentMouseX) * 0.005;
      currentMouseY += (mouseY - currentMouseY) * 0.005;

      // Smoothly transition the active state multiplier (fade in/out over ~2 seconds)
      const targetMultiplier = isPlayingRef.current ? 1 : 0;
      audioActiveMultiplier += (targetMultiplier - audioActiveMultiplier) * 0.02;

      // Calculate real-time audio power from analyzer
      const currentPower = analyzerDataRef.current.reduce((a, b) => a + b, 0) / 8;
      audioSmooth += (currentPower - audioSmooth) * 0.15; 

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = currentMouseX;
      const centerY = currentMouseY;

      // Use audioActiveMultiplier for all audio-driven expansions
      const audioExpansion = audioActiveMultiplier * audioSmooth * 150;
      const pulse = audioActiveMultiplier * Math.sin(time * 5) * 5;

      particles.forEach((p, i) => {
        p.angle += p.speed * 0.0003;
        
        const r = p.baseRadius + audioExpansion + pulse;

        const x = centerX + Math.cos(p.angle) * r;
        const y = centerY + Math.sin(p.angle) * r;

        // Line length is also smoothed by the active multiplier
        const dynamicLength = p.length * (1 + audioActiveMultiplier * audioSmooth * 8);
        const x2 = centerX + Math.cos(p.angle) * (r + dynamicLength);
        const y2 = centerY + Math.sin(p.angle) * (r + dynamicLength);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.thickness;
        
        // Sophisticated alpha management
        let alpha = 0.1;
        const distFromCenter = r;
        
        if (distFromCenter > 50) {
          alpha = Math.min(0.4, (distFromCenter - 50) / 400);
        }
        
        // Fade out at edges
        const edge = Math.max(canvas.width, canvas.height) * 0.7;
        if (distFromCenter > edge) {
          alpha *= Math.max(0, 1 - ((distFromCenter - edge) / 300));
        }

        // Boost alpha when music is loud
        ctx.globalAlpha = isPlayingRef.current ? alpha * (1 + audioSmooth * 2) : alpha * 0.5;
        
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 4 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 mix-blend-screen"></canvas>
    </motion.div>
  );
}
