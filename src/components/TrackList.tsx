'use client';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

export default function TrackList({ tracks }: { tracks: any[] }) {
  const { currentTrackUrl, isPlaying, playTrack, togglePlay } = useAudio();

  const blurReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative w-full">
      {/* Gradient Masks for smooth scroll entry/exit */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-deepblack via-deepblack/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-deepblack via-deepblack/80 to-transparent z-10 pointer-events-none" />

      {/* Scrollable Container - Now shorter and invisible */}
      <div className="h-[450px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth py-10">
        <motion.div
          className="flex flex-col"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {tracks.map((track) => {
            const isCurrent = currentTrackUrl === track.url;
            const isActive = isCurrent && isPlaying;

            return (
              <motion.div
                key={track._id}
                variants={blurReveal}
                className="group flex items-center gap-6 py-5 border-b border-white/[0.03] last:border-b-0 transition-all duration-300"
              >
                {/* Play Button - Restored to technical style */}
                <button
                  className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-accent/10 border-accent/40 text-accent' 
                      : 'bg-white/[0.02] border-white/5 text-white/30 group-hover:text-white group-hover:border-white/20 group-hover:bg-white/5'
                  }`}
                  onClick={() => isCurrent ? togglePlay() : playTrack(track.url, track.title, track.artwork, track.previewStart)}
                >
                  {isActive 
                    ? <Pause size={14} fill="currentColor" />
                    : <Play size={14} fill="currentColor" className="ml-0.5" />
                  }
                </button>

                {/* Artwork Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative group-hover:border-white/20 transition-colors">
                  <img 
                    src={track.artwork || `/artworks/${track.title}.jpg`} 
                    alt={track.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {(isActive || isCurrent) && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <p className={`font-light tracking-tight text-lg truncate transition-colors ${isActive || isCurrent ? 'text-accent' : 'text-white/70 group-hover:text-white'}`}>
                      {track.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-light text-gray-600 uppercase tracking-[0.2em]">{track.category || 'Original Score'}</span>
                      <span className="text-gray-800 text-[10px]">/</span>
                      <span className="text-[9px] font-light text-gray-600 uppercase tracking-[0.2em]">
                        preview starting at {Math.floor((track.previewStart || 0) / 60)}:{(track.previewStart || 0) % 60 < 10 ? '0' : ''}{(track.previewStart || 0) % 60}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-8 shrink-0">
                  {track.bpm && (
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[9px] text-gray-700 uppercase tracking-widest font-light">Tempo</span>
                      <span className="text-[10px] text-gray-500 font-mono">{track.bpm}</span>
                    </div>
                  )}
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-gray-700 uppercase tracking-widest font-light">Length</span>
                    <span className="text-[10px] text-gray-500 font-mono">{track.duration || '--:--'}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 1px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
