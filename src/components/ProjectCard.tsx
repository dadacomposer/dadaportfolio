'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface ProjectCardProps {
  project: any;
  onClick: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ProjectCard({ project, onClick, containerRef }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Scroll animations for the "Book Effect"
  const { scrollXProgress } = useScroll({
    target: cardRef,
    container: containerRef,
    offset: ["start end", "end start"]
  });

  // 3D Rotation and Scale based on scroll position
  const rotateY = useTransform(scrollXProgress, [0, 0.5, 1], [15, 0, -15]);
  const scale = useTransform(scrollXProgress, [0, 0.5, 1], [0.85, 1, 0.85]);
  const xOffset = useTransform(scrollXProgress, [0, 0.5, 1], [50, 0, -50]);
  const opacity = useTransform(scrollXProgress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.7]);
  const imageY = useTransform(scrollXProgress, [0, 1], ["-10%", "10%"]); // Parallax

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
      interval = setInterval(() => {
        if (videoRef.current) {
          const jump = (videoRef.current.currentTime + 10) % (videoRef.current.duration || 100);
          videoRef.current.currentTime = jump;
        }
      }, 500);
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <motion.div 
      ref={cardRef}
      style={{ rotateY, scale, x: xOffset, opacity, perspective: 1000 }}
      className="min-w-[90vw] md:min-w-[90vw] aspect-[16/9] md:aspect-[21/9] shrink-0 snap-center relative overflow-hidden group cursor-none rounded-xl bg-deepblack shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Background Image / Video Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          style={{ y: imageY }} 
          className={`absolute inset-0 scale-110 ${project.title.includes('MARTINLEE') ? 'saturate-[0.6] brightness-[0.9] contrast-[1.1]' : ''}`}
        >
          {/* Main Cover Image */}
          {project.coverImageUrl && (
            <img 
              src={project.coverImageUrl} 
              alt={project.title} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-20' : 'opacity-100'}`} 
            />
          )}
          
          {/* Video Preview (Staccato) */}
          <video
            ref={videoRef}
            src={project.videoUrl}
            muted
            playsInline
            loop
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isHovered ? 'opacity-80' : 'opacity-0'}`}
          />
        </motion.div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Info Overlay (Centered) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-20 text-center">
        <motion.div
          animate={{ y: isHovered ? -10 : 0, opacity: isHovered ? 0.2 : 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center"
        >
          <p className="text-[10px] md:text-[12px] font-light tracking-[0.6em] uppercase text-accent mb-4 drop-shadow-lg">{project.category}</p>
          <h3 className="text-3xl md:text-6xl font-bold tracking-tighter text-white leading-[1] uppercase max-w-4xl drop-shadow-2xl">
            {project.title}
          </h3>
          
          <div className="flex items-center gap-6 mt-8">
            <div className="h-[1px] w-8 bg-white/20" />
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">{project.year}</span>
            <div className="h-[1px] w-8 bg-white/20" />
          </div>
        </motion.div>
      </div>

      {/* Custom Cursor "Open Project" */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed pointer-events-none z-50 px-6 py-2.5 bg-white text-deepblack rounded-full shadow-2xl flex items-center justify-center whitespace-nowrap"
            style={{ 
              left: mousePos.x + 30,
              top: mousePos.y + 30,
              position: 'absolute'
            }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Open Project</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edge Shine Effect */}
      <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-colors duration-500 z-30 pointer-events-none" />
    </motion.div>
  );
}
