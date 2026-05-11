'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Project {
  _id: string;
  title: string;
  role: string;
  category: string;
  year: string;
  videoUrl: string;
  externalUrl?: string;
}

interface Props {
  isOpen: boolean;
  projects: Project[];
  selectedIndex: number;
  onClose: () => void;
  onChangeIndex: (newIndex: number) => void;
}

export default function ProjectIslandModal({ isOpen, projects, selectedIndex, onClose, onChangeIndex }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, projects.length]);

  if (!isOpen || !projects[selectedIndex]) return null;

  const project = projects[selectedIndex];

  const handlePrev = () => {
    if (selectedIndex > 0) onChangeIndex(selectedIndex - 1);
    else onChangeIndex(projects.length - 1);
  };

  const handleNext = () => {
    if (selectedIndex < projects.length - 1) onChangeIndex(selectedIndex + 1);
    else onChangeIndex(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-deepblack/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Close Button */}
          <motion.button 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClose}
            className="fixed top-8 right-8 z-[120] w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-deepblack transition-all"
          >
            <X size={20} strokeWidth={1.5} />
          </motion.button>

          {/* Island Modal */}
          <motion.div 
            className="relative w-full max-w-6xl aspect-video bg-anthracite border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[110]"
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(20px)" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Main Video Player */}
            <div className="absolute inset-0 bg-black">
              <video 
                key={project.videoUrl}
                ref={videoRef}
                src={project.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Overlay Info (Bottom) */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-deepblack via-deepblack/80 to-transparent pointer-events-none">
              <div className="max-w-4xl">
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-[10px] font-light tracking-[0.4em] uppercase text-accent mb-2">{project.category} / {project.year}</p>
                  <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-4">{project.title}</h3>
                  <div className="flex flex-wrap items-center gap-6 pointer-events-auto">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">Role</span>
                      <span className="text-xs text-white font-light tracking-wide">{project.role}</span>
                    </div>
                    {project.externalUrl && (
                      <a 
                        href={project.externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full bg-white/5"
                      >
                        Full Version <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Navigation Arrows (Sides) */}
            <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-start pl-6 bg-gradient-to-r from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <button onClick={handlePrev} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-deepblack transition-all">
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-6 bg-gradient-to-l from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <button onClick={handleNext} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-deepblack transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
