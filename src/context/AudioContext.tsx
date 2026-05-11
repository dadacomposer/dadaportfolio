'use client';
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { client } from '@/sanity/lib/client';

interface AudioContextType {
  isIslandVisible: boolean;
  setIsIslandVisible: (v: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  currentTrackTitle: string;
  currentTrackUrl: string | null;
  currentTrackArtwork: string | null;
  progress: number;
  duration: number;
  currentTime: number;
  tracks: any[];
  currentTrackIndex: number;
  playTrack: (url: string, title: string, artwork?: string, previewStart?: number) => void;
  playRandomTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  pauseAudio: () => void;
  seek: (time: number) => void;
  analyzerData: number[];
  firstTrack: any | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isIslandVisible, setIsIslandVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackTitle, setCurrentTrackTitle] = useState("");
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);
  const [currentTrackArtwork, setCurrentTrackArtwork] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [analyzerData, setAnalyzerData] = useState<number[]>(new Array(8).fill(0));
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const tracksRef = useRef<any[]>([]);
  const currentIndexRef = useRef(-1);
  const previewStartRef = useRef<number>(0);
  const preloadedTrackRef = useRef<any>(null);

  useEffect(() => {
    client.fetch(`*[_type == "track"] | order(_createdAt desc) {
      _id,
      title,
      "url": audioFile.asset->url,
      "artwork": artwork.asset->url,
      previewStart
    }`).then(data => {
      setTracks(data);
      tracksRef.current = data;
      // Preload a random track immediately so first play is instant
      if (data.length > 0 && audioRef.current) {
        const randomIdx = Math.floor(Math.random() * data.length);
        const preloadTrack = data[randomIdx];
        preloadedTrackRef.current = preloadTrack;
        audioRef.current.src = preloadTrack.url;
        audioRef.current.preload = 'auto';
        audioRef.current.load();
      }
    }).catch(err => {
      console.error("Sanity fetch error:", err);
    });
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.crossOrigin = "anonymous";
    audio.loop = false;
    
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      const nextIndex = (currentIndexRef.current + 1) % tracksRef.current.length;
      const nextTrackData = tracksRef.current[nextIndex];
      if (nextTrackData) {
        playTrack(nextTrackData.url, nextTrackData.title, nextTrackData.artwork, nextTrackData.previewStart);
      }
    };

    const handleLoadedMetadata = () => {
      if (previewStartRef.current > 0) {
        audio.currentTime = previewStartRef.current;
        
        // Fade in volume after jump
        audio.volume = 0;
        let vol = 0;
        const fadeIn = setInterval(() => {
          if (vol < 1) {
            vol += 0.1;
            audio.volume = Math.min(1, vol);
          } else {
            clearInterval(fadeIn);
          }
        }, 50);
      } else {
        audio.volume = 1;
      }
      setDuration(audio.duration);
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const firstTrack = tracks.length > 0 ? tracks[0] : null;

  const setupVisualizer = () => {
    if (!audioRef.current || analyzerRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyzer = ctx.createAnalyser();
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyzer);
    analyzer.connect(ctx.destination);
    analyzer.fftSize = 64;
    analyzerRef.current = analyzer;
    audioContextRef.current = ctx;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    const animate = () => {
      if (analyzerRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArray);
        setAnalyzerData(Array.from(dataArray.slice(0, 8)).map(v => v / 255));
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const playTrack = (url: string, title: string, artwork?: string, previewStart?: number) => {
    if (!audioRef.current) return;
    if (currentTrackUrl === url) {
      togglePlay();
    } else {
      previewStartRef.current = previewStart || 0;
      // Only skip src reset if this exact URL is already in the preloaded buffer
      const alreadyPreloaded = preloadedTrackRef.current?.url === url;
      if (!alreadyPreloaded) {
        audioRef.current.src = url;
      }
      audioRef.current.play().catch(e => console.log('Playback error:', e));

      setCurrentTrackUrl(url);
      setCurrentTrackTitle(title);
      const localArtwork = `/artworks/${title}.jpg`;
      setCurrentTrackArtwork(artwork || localArtwork);
      const idx = tracksRef.current.findIndex(t => t.url === url);
      setCurrentTrackIndex(idx);
      currentIndexRef.current = idx;
      setIsPlaying(true);
      setIsIslandVisible(true);
      // Clear preloaded ref since we're now playing
      preloadedTrackRef.current = null;
      setupVisualizer();
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    }
  };
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (!currentTrackUrl && firstTrack) {
      playTrack(firstTrack.url, firstTrack.title, firstTrack.artwork, firstTrack.previewStart);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const playRandomTrack = () => {
    const list = tracksRef.current;
    if (!list.length) return;
    // If a track is already preloaded in the buffer, use it directly (instant play)
    if (preloadedTrackRef.current) {
      const t = preloadedTrackRef.current;
      playTrack(t.url, t.title, t.artwork, t.previewStart);
    } else {
      const randomIndex = Math.floor(Math.random() * list.length);
      const track = list[randomIndex];
      if (track) playTrack(track.url, track.title, track.artwork, track.previewStart);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    const track = tracks[nextIndex];
    if (track) playTrack(track.url, track.title, track.artwork, track.previewStart);
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    const track = tracks[prevIndex];
    if (track) playTrack(track.url, track.title, track.artwork, track.previewStart);
  };

  const seek = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  return (
    <AudioContext.Provider value={{ 
      isIslandVisible, setIsIslandVisible, isPlaying, setIsPlaying, currentTrackTitle,
      currentTrackUrl, currentTrackArtwork, progress, duration, currentTime, tracks, currentTrackIndex,
      playTrack, playRandomTrack, togglePlay, nextTrack, prevTrack, pauseAudio, seek, analyzerData, firstTrack
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
}
