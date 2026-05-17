'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ExternalLink, Play, Pause, Maximize, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import Hls from 'hls.js';
import { muxVideos } from '@/data/muxVideos';

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
  const hlsRef = useRef<Hls | null>(null);
  const { isPlaying: isMusicPlaying, pauseAudio } = useAudio();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ') {
        e.preventDefault();
        toggleVideoPlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, projects.length]);

  // Sync: If music starts playing, pause video
  useEffect(() => {
    if (isMusicPlaying && isVideoPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    if (isOpen) {
      setIsVideoPlaying(true);
      // Auto-pause music when modal opens with a video
      pauseAudio();
    } else {
      setIsVideoPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen || !projects[selectedIndex]) return null;

  const project = projects[selectedIndex];

  const handlePrev = () => {
    if (selectedIndex > 0) onChangeIndex(selectedIndex - 1);
    else onChangeIndex(projects.length - 1);
    resetVideoState();
  };

  const handleNext = () => {
    if (selectedIndex < projects.length - 1) onChangeIndex(selectedIndex + 1);
    else onChangeIndex(0);
    resetVideoState();
  };

  const resetVideoState = () => {
    setIsVideoPlaying(true);
    setVideoProgress(0);
    pauseAudio();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !project) return;

    // Use Mux HLS URL if available for this project title
    const projectTitle = project?.title || "";
    const muxData = muxVideos[projectTitle as keyof typeof muxVideos];
    const videoSrc = muxData?.hlsUrl || project.videoUrl;

    console.log(`🎬 Loading video for: ${projectTitle}`, { hasMux: !!muxData, src: videoSrc });

    if (!videoSrc) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (videoSrc.endsWith('.m3u8')) {
      // Dynamic check for Hls to avoid any SSR issues even if imported
      if (typeof window !== 'undefined' && Hls.isSupported()) {
        try {
          const hls = new Hls({
            capLevelToPlayerSize: true,
            autoStartLoad: true
          });
          hls.loadSource(videoSrc);
          hls.attachMedia(video);
          hlsRef.current = hls;
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log("✅ HLS Manifest parsed, ready to play");
          });
        } catch (hlsError) {
          console.error("❌ HLS.js error:", hlsError);
          video.src = videoSrc; // Fallback to native
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = videoSrc;
      }
    } else {
      video.src = videoSrc;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [project]);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        pauseAudio(); // Ensure music stops if video starts
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const currentTime = videoRef.current.currentTime;
      let p = 0;
      if (duration && !isNaN(duration)) {
        p = (currentTime / duration) * 100;
      }
      setVideoProgress(p || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      if (duration && !isNaN(duration)) {
        const time = (parseFloat(e.target.value) / 100) * duration;
        videoRef.current.currentTime = time;
      }
      setVideoProgress(parseFloat(e.target.value) || 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isVideoPlaying) setShowControls(false);
    }, 3000);
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
            className="relative w-full max-w-6xl aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[110]"
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(20px)" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onMouseMove={handleMouseMove}
          >
            {/* Main Video Player */}
            <div className="absolute inset-0 bg-black group" onClick={toggleVideoPlay}>
              <video 
                key={project.videoUrl}
                ref={videoRef}
                src={project.videoUrl}
                autoPlay
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => { setIsVideoPlaying(true); pauseAudio(); }}
                onPause={() => setIsVideoPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
              />
            </div>

            {/* Custom Controls Overlay */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 w-full p-6 md:p-10 bg-gradient-to-t from-black via-black/60 to-transparent z-40"
                >
                  {/* Progress Bar */}
                  <div className="relative w-full h-1 bg-white/10 rounded-full mb-8 group/progress cursor-pointer">
                    <div 
                      className="absolute h-full bg-accent rounded-full" 
                      style={{ width: `${videoProgress}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={videoProgress}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-[10px] font-light tracking-[0.4em] uppercase text-accent mb-2">{project.category} / {project.year}</p>
                      <h3 className="text-2xl md:text-4xl font-light tracking-tight text-white mb-4">{project.title}</h3>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">Role</span>
                          <span className="text-xs text-white font-light tracking-wide">{project.role}</span>
                        </div>
                        {project.externalUrl && (
                          <a 
                            href={project.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full bg-white/5 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Full Version <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white transition-colors">
                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                      </button>
                      <button onClick={toggleVideoPlay} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                        {isVideoPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                      </button>
                      <button onClick={toggleFullscreen} className="text-white/60 hover:text-white transition-colors">
                        <Maximize size={24} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Arrows (Sides) */}
            <AnimatePresence>
              {showControls && (
                <>
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-y-0 left-0 w-32 flex items-center justify-start pl-6 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"
                  >
                    <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-deepblack transition-all pointer-events-auto">
                      <ChevronLeft size={20} />
                    </button>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-6 bg-gradient-to-l from-black/40 to-transparent pointer-events-none"
                  >
                    <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-deepblack transition-all pointer-events-auto">
                      <ChevronRight size={20} />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
