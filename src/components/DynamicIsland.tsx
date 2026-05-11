'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const { 
    isIslandVisible, isPlaying, togglePlay, currentTrackTitle, 
    progress, duration, currentTime, seek, nextTrack, prevTrack,
    analyzerData, currentTrackArtwork
  } = useAudio();

  if (!isIslandVisible) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          width: isHovered ? "min(100%, 900px)" : "220px",
          height: "64px",
        }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 25,
          width: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
        }}
        className="bg-deepblack/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center relative"
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            /* Compact View (Centered title and waveform) */
            <motion.div 
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between px-6"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-medium text-white truncate uppercase tracking-widest">{currentTrackTitle}</span>
                <span className="text-[8px] text-accent/60 uppercase tracking-[0.2em] font-light">Playing</span>
              </div>
              
              <div className="flex items-center gap-[3px] h-4">
                {analyzerData.map((val, i) => (
                  <motion.div 
                    key={i}
                    className="w-[1.5px] bg-accent rounded-full"
                    animate={{ height: isPlaying ? `${Math.max(20, val * 100)}%` : '20%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            /* Expanded Horizontal View */
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex items-center gap-6 px-6"
            >
              {/* Left: Artwork & Info */}
              <div className="flex items-center gap-3 shrink-0 max-w-[200px]">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                  {currentTrackArtwork ? (
                    <img src={currentTrackArtwork} alt="Artwork" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-white truncate uppercase tracking-widest">{currentTrackTitle}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest">DADA.COMPOSER</span>
                </div>
              </div>

              {/* Center: Scrubber & Time */}
                <div className="flex-1 flex items-center gap-4">
                  <span className="text-[9px] font-mono text-gray-500 tabular-nums">{formatTime(currentTime)}</span>
                  <div className="flex-1 h-1 bg-white/10 relative rounded-full group">
                    {/* Visual Progress Bar */}
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-accent rounded-full pointer-events-none"
                      style={{ width: `${progress}%` }}
                    />
                    {/* Interactive Range Input (Invisible but handles drag/click) */}
                    <input 
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      step="0.1"
                      onChange={(e) => seek(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {/* Visual Thumb */}
                    <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                         style={{ left: `${progress}%`, marginLeft: '-5px' }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 tabular-nums">{formatTime(duration)}</span>
                </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-5 shrink-0">
                <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors">
                  <SkipBack size={16} fill="currentColor" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-white text-deepblack flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-lg"
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors">
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
