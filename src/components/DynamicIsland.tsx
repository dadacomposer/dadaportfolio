'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, X } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

// ─── Desktop Island (hover-to-expand) ───────────────────────────────────────
function DesktopIsland({ translateY }: { translateY: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    isPlaying, togglePlay, currentTrackTitle,
    progress, duration, currentTime, seek, nextTrack, prevTrack,
    analyzerData, currentTrackArtwork,
  } = useAudio();

  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  return (
    <div 
      className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
      style={{ transform: translateY !== 0 ? `translateY(${translateY}px)` : undefined }}
    >
      {/* Invisible Hover Hitbox */}
      <div 
        className="w-full max-w-[900px] h-[64px] flex justify-center items-center pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: 0, opacity: 1,
            width: isHovered ? '100%' : '240px',
            height: '100%',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 25, width: { duration: 0.55, ease: [0.23, 1, 0.32, 1] } }}
          className="bg-deepblack/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center"
        >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div key="compact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between px-6">
              <div className="flex flex-col flex-1 min-w-0 pr-3">
                <span className="text-[10px] font-medium text-white truncate uppercase tracking-widest">{currentTrackTitle}</span>
                <span className="text-[8px] text-accent/60 uppercase tracking-[0.2em] font-light">Playing</span>
              </div>
              <div className="flex items-center gap-[3px] h-4 shrink-0">
                {analyzerData.map((val, i) => (
                  <motion.div key={i} className="w-[1.5px] bg-accent rounded-full"
                    animate={{ height: isPlaying ? `${Math.max(20, val * 100)}%` : '20%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full flex items-center gap-6 px-6">
              {/* Artwork + Info */}
              <div className="flex items-center gap-3 shrink-0 max-w-[200px]">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                  {currentTrackArtwork
                    ? <img src={currentTrackArtwork} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium text-white truncate uppercase tracking-widest">{currentTrackTitle}</span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-widest">DADA.COMPOSER</span>
                </div>
              </div>
              {/* Seek */}
              <div className="flex-1 flex items-center gap-4">
                <span className="text-[9px] font-mono text-gray-500 tabular-nums">{fmt(currentTime)}</span>
                <div className="flex-1 h-1 bg-white/10 relative rounded-full group">
                  <div className="absolute h-full bg-accent rounded-full pointer-events-none" style={{ width: `${progress}%` }} />
                  <input type="range" min="0" max={duration || 100} value={currentTime} step="0.1"
                    onChange={e => seek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `${progress}%`, marginLeft: '-5px' }} />
                </div>
                <span className="text-[9px] font-mono text-gray-500 tabular-nums">{fmt(duration)}</span>
              </div>
              {/* Controls */}
              <div className="flex items-center gap-5 shrink-0">
                <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors"><SkipBack size={16} fill="currentColor" /></button>
                <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white text-deepblack flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-lg">
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors"><SkipForward size={16} fill="currentColor" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Mobile Island (Spotify-style bottom sheet) ───────────────────────────────
function MobileIsland({ translateY }: { translateY: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isPlaying, togglePlay, currentTrackTitle,
    progress, duration, currentTime, seek, nextTrack, prevTrack,
    analyzerData, currentTrackArtwork,
  } = useAudio();

  const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

  return (
    <>
      {/* ── Mini Bar ── */}
      <AnimatePresence>
        {!isOpen && (
          <div 
            className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pointer-events-none"
            style={{ transform: translateY !== 0 ? `translateY(${translateY}px)` : undefined }}
          >
            <motion.div
              key="minibar"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full pointer-events-auto"
              onClick={() => setIsOpen(true)}
            >
            <div className="bg-deepblack/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-4 py-3 flex items-center gap-3">
              {/* Artwork */}
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                {currentTrackArtwork
                  ? <img src={currentTrackArtwork} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />}
              </div>
              {/* Title + waveform */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white truncate uppercase tracking-widest">{currentTrackTitle}</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest">DADA.COMPOSER</p>
              </div>
              {/* Mini play/pause */}
              <button
                onClick={e => { e.stopPropagation(); togglePlay(); }}
                className="w-10 h-10 rounded-full bg-white text-deepblack flex items-center justify-center shadow-lg flex-shrink-0 active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
              {/* Waveform indicator */}
              <div className="flex items-center gap-[2px] h-5 flex-shrink-0 ml-1">
                {analyzerData.slice(0, 5).map((val, i) => (
                  <motion.div key={i} className="w-[2px] bg-accent rounded-full"
                    animate={{ height: isPlaying ? `${Math.max(25, val * 100)}%` : '25%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
                ))}
              </div>
            </div>
            {/* Mini progress line */}
            <div className="mt-1 mx-2 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Full-screen Sheet (Spotify style) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-b from-[#111] to-deepblack"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-6">
              <button onClick={() => setIsOpen(false)} className="text-white/60 active:text-white transition-colors p-2 -ml-2">
                <ChevronDown size={28} />
              </button>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Now Playing</p>
              </div>
              <div className="w-10" /> {/* spacer */}
            </div>

            {/* Artwork */}
            <div className="flex-1 flex items-center justify-center px-10">
              <motion.div
                animate={{ scale: isPlaying ? 1 : 0.88 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="w-full max-w-xs aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              >
                {currentTrackArtwork
                  ? <img src={currentTrackArtwork} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-accent/30 via-accent/10 to-transparent flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                        <Play size={32} className="text-white/30 ml-1" />
                      </div>
                    </div>}
              </motion.div>
            </div>

            {/* Track Info + Controls */}
            <div className="px-8 pb-12 flex flex-col gap-6">
              {/* Title */}
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight truncate">{currentTrackTitle}</h2>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest">DADA.COMPOSER</p>
              </div>

              {/* Seek bar */}
              <div className="flex flex-col gap-2">
                <div className="relative h-1.5 bg-white/10 rounded-full">
                  <div className="absolute h-full bg-white rounded-full pointer-events-none" style={{ width: `${progress}%` }} />
                  <input type="range" min="0" max={duration || 100} value={currentTime} step="0.1"
                    onChange={e => seek(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    style={{ touchAction: 'none' }} />
                  {/* Thumb */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none -ml-2"
                    style={{ left: `${progress}%` }} />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-gray-500">{fmt(currentTime)}</span>
                  <span className="text-xs font-mono text-gray-500">{fmt(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between px-2">
                <button onClick={prevTrack} className="text-white/50 active:text-white transition-colors p-3">
                  <SkipBack size={28} fill="currentColor" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white text-deepblack flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                >
                  {isPlaying
                    ? <Pause size={28} fill="currentColor" />
                    : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={nextTrack} className="text-white/50 active:text-white transition-colors p-3">
                  <SkipForward size={28} fill="currentColor" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main export: picks Desktop or Mobile based on screen size ────────────────
export default function DynamicIsland() {
  const { isIslandVisible } = useAudio();
  const [isMobile, setIsMobile] = useState(false);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) {
        setTranslateY(0);
        return;
      }
      
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPos = window.scrollY;
      
      const distanceToBottom = docHeight - (scrollPos + windowHeight);
      const footerHeight = footer.offsetHeight;
      
      if (distanceToBottom < footerHeight) {
        setTranslateY(-(footerHeight - distanceToBottom));
      } else {
        setTranslateY(0);
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (!isIslandVisible) return null;

  return isMobile ? <MobileIsland translateY={translateY} /> : <DesktopIsland translateY={translateY} />;
}
