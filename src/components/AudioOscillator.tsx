'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  phase: number;
  wobbleSpeed: number;
}

export default function AudioOscillator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying } = useAudio();
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

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

    // Alpha-bracketed RGBA colors to allow easy alpha changes
    const colors = [
      'rgba(59, 130, 246, ',  // Accent blue
      'rgba(96, 165, 250, ',  // Light blue
      'rgba(255, 255, 255, ', // White
      'rgba(147, 197, 253, '  // Soft blue
    ];

    const particles: Particle[] = Array.from({ length: 45 }).map(() => {
      const size = Math.random() * 2.8 + 0.8; // smaller: between 0.8px and 3.6px
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() * 0.08 - 0.04), // much slower drift
        vy: -(Math.random() * 0.12 + 0.04), // much slower upward float
        size,
        baseSize: size,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.25 + 0.08, // baseline opacity between 0.08 and 0.33
        phase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.015 + 0.003,
      };
    });

    let currentMouseX = window.innerWidth / 2;
    let currentMouseY = window.innerHeight / 2;
    let audioSmooth = 0;

    const draw = () => {
      // Smooth mouse coordinates
      currentMouseX += (mouseX - currentMouseX) * 0.05;
      currentMouseY += (mouseY - currentMouseY) * 0.05;

      // Smooth audio power
      const targetPower = isPlayingRef.current ? 0.45 : 0;
      audioSmooth += (targetPower - audioSmooth) * 0.04; 

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // 1. Calculate drift speeds (increase when music is active) - lower multiplier
        const speedMultiplier = 1 + audioSmooth * 0.8;
        
        p.phase += p.wobbleSpeed;
        const wobble = Math.sin(p.phase) * (0.08 + audioSmooth * 0.3);
        
        p.x += (p.vx * speedMultiplier) + wobble;
        p.y += (p.vy * speedMultiplier);

        // 2. Interactive mouse repulsion
        const dx = p.x - currentMouseX;
        const dy = p.y - currentMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const forceRadius = 160;
        
        if (dist < forceRadius) {
          const force = (forceRadius - dist) / forceRadius;
          const pushX = (dx / dist) * force * 1.2;
          const pushY = (dy / dist) * force * 1.2;
          p.x += pushX;
          p.y += pushY;
        }

        // Screen wrapping
        const padding = 30;
        if (p.x < -padding) p.x = canvas.width + padding;
        if (p.x > canvas.width + padding) p.x = -padding;
        if (p.y < -padding) {
          p.y = canvas.height + padding;
          p.x = Math.random() * canvas.width;
        }
        if (p.y > canvas.height + padding) p.y = -padding;

        // 3. Audio-reactive sizing and opacity - greatly reduced size & opacity bump
        const dynamicSize = p.baseSize * (1 + audioSmooth * 0.5);
        const dynamicAlpha = Math.min(0.45, p.alpha * (1 + audioSmooth * 0.4));

        // Draw soft glowing bokeh
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicSize, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${dynamicAlpha})`;
        ctx.fill();
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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 4 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 mix-blend-screen" style={{ filter: 'blur(1.2px)' }}></canvas>
    </motion.div>
  );
}
