'use client';
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
  const fadeIntervalRef = useRef<any>(null);

  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const startFadeIn = (audio: HTMLAudioElement, durationMs: number = 150) => {
    clearFade();
    audio.volume = 0;
    const steps = durationMs <= 200 ? 10 : 20;
    const stepTime = durationMs / steps;
    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const targetVol = currentStep / steps;
      audio.volume = Math.min(1, targetVol);
      if (currentStep >= steps) {
        audio.volume = 1;
        clearFade();
      }
    }, stepTime);
  };

  useEffect(() => {
    async function loadTracks() {
      try {
        // Fetch all tracks from Supabase
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) {
          const mapped = data.map(t => ({
            _id: t.id,
            title: t.title,
            url: t.audio_url,
            artwork: t.artwork_url || `/artworks/${t.title}.jpg`,
            previewStart: t.preview_start || 0,
            is_hidden: t.is_hidden || false,
            artist: t.artist,
            album: t.album
          }));

          // Only show non-hidden tracks in the public player list
          const visibleTracks = mapped.filter(t => !t.is_hidden);
          setTracks(visibleTracks);
          tracksRef.current = visibleTracks;

          // Preload a random track immediately so first play is instant
          if (visibleTracks.length > 0 && audioRef.current) {
            const randomIdx = Math.floor(Math.random() * visibleTracks.length);
            const preloadTrack = visibleTracks[randomIdx];
            preloadedTrackRef.current = preloadTrack;
            audioRef.current.src = preloadTrack.url;
            audioRef.current.preload = 'auto';
            audioRef.current.load();
          }
        }
      } catch (err) {
        console.error('Failed to fetch tracks in AudioContext:', err);
        // Fallback to static cloudinaryTracks if fetch fails
        import('@/data/cloudinaryTracks').then(({ cloudinaryTracks }) => {
          const mappedStatic = cloudinaryTracks.map(t => ({
            ...t,
            is_hidden: false
          }));
          setTracks(mappedStatic);
          tracksRef.current = mappedStatic;
        });
      }
    }

    loadTracks();
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
      const isSharePage = typeof window !== 'undefined' && window.location.pathname.startsWith('/share/');
      
      audio.volume = 0;
      let startPoint = 0;
      if (!isSharePage) {
        // Calculate preview start point: either explicit preview_start, or 35% of duration
        if (previewStartRef.current > 0) {
          startPoint = previewStartRef.current;
        } else if (audio.duration) {
          startPoint = Math.floor(audio.duration * 0.35);
        }
      }

      if (startPoint > 0) {
        audio.currentTime = startPoint;
      }
      
      // Smooth fade-in
      startFadeIn(audio, 150);
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
      
      // Clear current fade and mute volume immediately before loading
      clearFade();
      audioRef.current.volume = 0;

      // Only skip src reset if this exact URL is already in the preloaded buffer
      const alreadyPreloaded = preloadedTrackRef.current?.url === url;
      if (!alreadyPreloaded) {
        audioRef.current.src = url;
        audioRef.current.load(); // Force reset media pipeline and start buffering immediately
      } else {
        // Since it is already preloaded, we must ensure it's seeked to the preview point
        const isSharePage = typeof window !== 'undefined' && window.location.pathname.startsWith('/share/');
        if (!isSharePage) {
          const startPoint = previewStart || (audioRef.current.duration ? Math.floor(audioRef.current.duration * 0.35) : 0);
          if (startPoint > 0 && Math.abs(audioRef.current.currentTime - startPoint) > 2) {
            audioRef.current.currentTime = startPoint;
          }
        }
        // Fade in manually for preloaded track (since loadedmetadata won't fire again)
        startFadeIn(audioRef.current, 150);
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
    if (!currentTrackUrl) {
      const startTrack = preloadedTrackRef.current || firstTrack;
      if (startTrack) {
        playTrack(startTrack.url, startTrack.title, startTrack.artwork, startTrack.previewStart);
      }
      return;
    }
    if (isPlaying) {
      // Smoothly fade out before pausing to avoid pops
      clearFade();
      let vol = audioRef.current.volume;
      const fadeOutInterval = setInterval(() => {
        vol -= 0.15;
        if (vol <= 0) {
          clearInterval(fadeOutInterval);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = 0;
          }
          setIsPlaying(false);
        } else {
          if (audioRef.current) audioRef.current.volume = Math.max(0, vol);
        }
      }, 20);
    } else {
      audioRef.current.volume = 0;
      audioRef.current.play().then(() => {
        startFadeIn(audioRef.current!, 150);
      }).catch(e => console.log('Playback error:', e));
      setIsPlaying(true);
      if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current && isPlaying) {
      clearFade();
      let vol = audioRef.current.volume;
      const fadeOutInterval = setInterval(() => {
        vol -= 0.15;
        if (vol <= 0) {
          clearInterval(fadeOutInterval);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = 0;
          }
          setIsPlaying(false);
        } else {
          if (audioRef.current) audioRef.current.volume = Math.max(0, vol);
        }
      }, 20);
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
