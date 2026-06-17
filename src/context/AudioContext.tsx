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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracksRef = useRef<any[]>([]);
  const currentIndexRef = useRef(-1);
  const previewStartRef = useRef<number>(0);
  const preloadedTrackRef = useRef<any>(null);
  // Tracks whether we have already applied the initial seek for the current src
  // Prevents handleLoadedMetadata from re-seeking on network rebuffer
  const seekAppliedRef = useRef(false);

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

          // Preload a featured track immediately so first play is instant
          if (visibleTracks.length > 0 && audioRef.current) {
            const featuredTitles = ["About To Happen", "Breathe Again", "Cloud Recesses"];
            const featuredTracks = visibleTracks.filter(t => featuredTitles.includes(t.title));
            const pool = featuredTracks.length > 0 ? featuredTracks : visibleTracks;
            const randomIdx = Math.floor(Math.random() * pool.length);
            const preloadTrack = pool[randomIdx];
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
          
          if (mappedStatic.length > 0 && audioRef.current) {
            const featuredTitles = ["About To Happen", "Breathe Again", "Cloud Recesses"];
            const featuredTracks = mappedStatic.filter(t => featuredTitles.includes(t.title));
            const pool = featuredTracks.length > 0 ? featuredTracks : mappedStatic;
            const randomIdx = Math.floor(Math.random() * pool.length);
            const preloadTrack = pool[randomIdx];
            preloadedTrackRef.current = preloadTrack;
            audioRef.current.src = preloadTrack.url;
            audioRef.current.preload = 'auto';
            audioRef.current.load();
          }
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
      
      audio.volume = 1;
      setDuration(audio.duration);

      // Only apply the initial seek ONCE per track load.
      // If the browser rebuffers (network glitch, tab switch) it fires
      // loadedmetadata again — without this guard it would re-jump to the
      // preview point mid-playback, which was perceived as a pitch change.
      if (seekAppliedRef.current) return;
      seekAppliedRef.current = true;

      if (!isSharePage) {
        let startPoint = 0;
        if (previewStartRef.current > 0) {
          startPoint = previewStartRef.current;
        } else if (audio.duration) {
          startPoint = Math.floor(audio.duration * 0.35);
        }
        if (startPoint > 0) {
          audio.currentTime = startPoint;
        }
      }
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const firstTrack = tracks.length > 0 ? tracks[0] : null;



  const playTrack = (url: string, title: string, artwork?: string, previewStart?: number) => {
    if (!audioRef.current) return;
    if (currentTrackUrl === url) {
      togglePlay();
    } else {
      previewStartRef.current = previewStart || 0;
      
      audioRef.current.volume = 1;

      // Reset seek guard whenever we load a new track src
      seekAppliedRef.current = false;

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
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = 1;
      audioRef.current.play().catch(e => console.log('Playback error:', e));
      setIsPlaying(true);
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
      playTrack, playRandomTrack, togglePlay, nextTrack, prevTrack, pauseAudio, seek, firstTrack
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
