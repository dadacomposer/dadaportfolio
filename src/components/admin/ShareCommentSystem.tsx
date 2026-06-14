'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Copy, Send, CheckCircle, Music, Loader2, FileArchive, Link as LinkIcon, RotateCcw, Square, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function ShareCommentSystem({ 
  track, 
  index, 
  playlistId,
  playlistTitle,
  permissionLevel 
}: { 
  track: any, 
  index: number,
  playlistId: string,
  playlistTitle: string,
  permissionLevel: string 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { showToast } = useToast();

  // Deterministic waveform generator based on track title
  const generateWaveform = (title: string) => {
    const barsCount = 50;
    const heights = [];
    for (let i = 0; i < barsCount; i++) {
      const charCode = title.charCodeAt(i % title.length) || 64;
      const height = 15 + ((charCode * (i + 3)) % 71);
      heights.push(height);
    }
    return heights;
  };

  const waveformHeights = useRef<number[]>([]);
  if (waveformHeights.current.length === 0) {
    waveformHeights.current = generateWaveform(track.title);
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const seekTime = percentage * duration;
    if (audioRef.current && !isNaN(seekTime)) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      if (typeof window !== 'undefined') {
        (window as any).activeTrackId = track.id;
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Load initial status and set up event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    const checkExistingStatus = async () => {
      try {
        const { data } = await supabase
          .from('comments')
          .select('text')
          .eq('playlist_id', playlistId)
          .eq('track_id', track.id)
          .or('text.ilike.★ APPROVED:%,text.ilike.✗ REJECTED:%');
        
        if (data && data.length > 0) {
          if (data[0].text.startsWith('★ APPROVED:')) {
            setReviewStatus('approved');
          } else if (data[0].text.startsWith('✗ REJECTED:')) {
            setReviewStatus('rejected');
          }
        }
      } catch (err) {
        console.error('Error checking existing review status:', err);
      }
    };
    
    checkExistingStatus();

    // Auto-set the first track as active for spacebar playback
    if (typeof window !== 'undefined') {
      if (index === 0 && !(window as any).activeTrackId) {
        (window as any).activeTrackId = track.id;
      }
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [playlistId, track.id, index]);

  // Global Spacebar Keydown Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          return; // Allow spaces in text input fields
        }

        e.preventDefault();

        if (typeof window !== 'undefined' && (window as any).activeTrackId === track.id) {
          togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, track.id]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (typeof window !== 'undefined') {
        (window as any).activeTrackId = track.id;
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Stop all other audio elements on the page
        document.querySelectorAll('audio').forEach(el => {
          if (el !== audioRef.current) {
            el.pause();
          }
        });
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReviewStatus = async (status: 'approved' | 'rejected') => {
    showToast(`Marking track as ${status}...`, 'info');
    const statusText = status === 'approved' 
      ? `★ APPROVED: "${track.title}" approved by reviewer.` 
      : `✗ REJECTED: "${track.title}" rejected by reviewer.`;

    try {
      // 1. Search for existing status comments
      const { data: existing } = await supabase
        .from('comments')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('track_id', track.id)
        .or('text.ilike.★ APPROVED:%,text.ilike.✗ REJECTED:%');

      if (existing && existing.length > 0) {
        // Update the existing comment
        const { error } = await supabase
          .from('comments')
          .update({ text: statusText, author: 'Musicvine Reviewer' })
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        // Insert new comment
        const { error } = await supabase
          .from('comments')
          .insert([{
            playlist_id: playlistId,
            track_id: track.id,
            author: 'Musicvine Reviewer',
            text: statusText
          }]);
        if (error) throw error;
      }

      setReviewStatus(status);
      showToast(`Track successfully ${status}!`, 'success');

      // Trigger Slack Notification
      fetch('/api/notify-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle: track.title,
          commentText: statusText,
          author: 'Musicvine Reviewer',
          playlistTitle: playlistTitle
        })
      }).catch(err => console.error('Slack notify error:', err));

    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const saveComment = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('comments').insert([{
        playlist_id: playlistId,
        track_id: track.id,
        author: 'Musicvine Reviewer',
        text: comment
      }]);
      
      if (error) throw error;
      
      setSaved(true);
      showToast('Feedback sent to DADA in real-time!', 'success');

      // Trigger Slack Notification
      fetch('/api/notify-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle: track.title,
          commentText: comment,
          author: 'Musicvine Reviewer',
          playlistTitle: playlistTitle
        })
      }).catch(err => console.error('Slack notify error:', err));

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      showToast('Failed to save comment securely.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAndDownload = async () => {
    setIsZipping(true);
    showToast('Preparing Musicvine ZIP package...', 'info');

    try {
      const originalExt = track.audio_url.split('.').pop()?.split('?')[0] || 'wav';
      const durationStr = (track.duration || '2-30').replace(':', '-');
      const approvalText = `★ APPROVED: Track approved and ZIP downloaded (main-version-${durationStr}.${originalExt}).`;

      // Save notification to database comments
      await supabase.from('comments').insert([{
        playlist_id: playlistId,
        track_id: track.id,
        author: 'Musicvine Reviewer',
        text: approvalText
      }]);

      // Trigger Slack Notification
      fetch('/api/notify-slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle: track.title,
          commentText: approvalText,
          author: 'Musicvine Reviewer',
          playlistTitle: playlistTitle
        })
      }).catch(err => console.error('Slack notify error:', err));

      // Trigger server-side download
      window.location.href = `/api/download-zip?trackId=${track.id}`;

      setIsApproved(true);
      showToast('ZIP downloaded & approval notification sent!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to trigger download', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  const copyZipLink = () => {
    const directUrl = `${window.location.origin}/api/download-zip?trackId=${track.id}`;
    navigator.clipboard.writeText(directUrl);
    showToast('Direct ZIP download link copied!', 'success');
  };

  const copyAllFeedback = () => {
    const textareas = document.querySelectorAll('textarea');
    let fullText = 'Musicvine Feedback:\n\n';
    
    textareas.forEach((ta, i) => {
      if (ta.value) {
        const titleElement = ta.closest('.track-container')?.querySelector('.track-title');
        const trackTitle = titleElement ? titleElement.textContent : `Track ${i + 1}`;
        fullText += `--- ${trackTitle} ---\n${ta.value}\n\n`;
      }
    });

    if (fullText.trim() === 'Musicvine Feedback:') {
      showToast('No feedback written yet!', 'error');
      return;
    }

    navigator.clipboard.writeText(fullText);
    showToast('All feedback copied! You can now paste it.', 'success');
  };

  return (
    <div className="track-container max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 relative overflow-hidden group">
      
      {/* Decorative Glow */}
      {isPlaying && (
        <div className="absolute -inset-10 bg-accent/10 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000" />
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
        
        {/* Cover Art Player Display */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl flex items-center justify-center group/cover">
          <img 
            src={track.artwork_url || `/artworks/${track.title}.jpg`} 
            alt={track.title} 
            className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500 bg-white/5" 
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                let fallback = parent.querySelector('.cover-fallback');
                if (!fallback) {
                  fallback = document.createElement('div');
                  fallback.className = 'cover-fallback w-full h-full bg-gradient-to-tr from-accent/20 to-white/5 flex items-center justify-center';
                  fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music text-white/30"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
                  parent.appendChild(fallback);
                }
              }
            }}
          />

          {/* Hover Play overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="ml-0.5 fill-black" />}
            </button>
          </div>
        </div>

        {/* Player Details & Scrubber */}
        <div className="flex-grow w-full space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/40 text-[10px] tracking-widest uppercase mb-1">Track {(index + 1).toString().padStart(2, '0')}</p>
              <h3 className="track-title text-xl md:text-2xl font-bold uppercase tracking-tighter text-white">{track.title}</h3>
            </div>
            
            {/* Quick Play Trigger (if cover hover is too hidden) */}
            <button 
              onClick={togglePlay}
              className="lg:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
          </div>

          {/* Spotify-style Controls Group and Waveform */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full bg-black/20 p-4 rounded-2xl border border-white/5">
            {/* Spotify-style Controls Group */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleReplay}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all hover:scale-105 border border-white/5"
                title="Replay"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-105 shadow-md"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} className="fill-black" /> : <Play size={16} className="ml-0.5 fill-black" />}
              </button>
              <button
                onClick={handleStop}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-all hover:scale-105 border border-white/5"
                title="Stop"
              >
                <Square size={14} className="fill-white" />
              </button>
            </div>

            {/* Waveform Scrubber */}
            <div className="flex-grow w-full">
              <div 
                onClick={handleWaveformClick}
                className="h-10 flex items-end gap-[3px] cursor-pointer group/wave w-full py-1 relative select-none"
              >
                {waveformHeights.current.map((height, i) => {
                  const progress = duration > 0 ? currentTime / duration : 0;
                  const isActive = progress >= i / 50;
                  return (
                    <div
                      key={i}
                      className="flex-grow rounded-sm transition-all duration-150"
                      style={{
                        height: `${height}%`,
                        backgroundColor: isActive ? 'rgb(var(--accent-rgb, 59, 130, 246))' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={track.audio_url} 
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </div>

        {/* Regular Download Button */}
        {permissionLevel === 'download' && (
          <a 
            href={track.audio_url} 
            download 
            target="_blank" 
            rel="noreferrer"
            className="shrink-0 flex items-center gap-2 border border-white/20 rounded-full px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors font-bold w-full lg:w-auto justify-center"
          >
            <Download size={16} /> Download
          </a>
        )}
      </div>

      {/* Musicvine Feedback Area */}
      {permissionLevel === 'musicvine' && (
        <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
          
          {/* Musicvine Metadata Grid */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4 backdrop-blur-sm">
            <h4 className="text-xs uppercase tracking-widest text-accent font-bold">Music Vine Track Metadata</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">1. Full Name</span>
                <span className="text-sm font-semibold text-white">Daniel Angelucci</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">2. Artist Profile</span>
                <span className="text-sm font-semibold text-white">DADA</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">3. Track Title</span>
                <span className="text-sm font-semibold text-white uppercase tracking-tight">{track.title}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">4. Exclusivity</span>
                <span className="text-sm font-semibold text-white">Exclusive</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">5. Publishing Rights</span>
                <span className="text-sm font-semibold text-white">Yes</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">6. BPM</span>
                <span className="text-sm font-bold text-accent font-mono">{track.bpm || 80}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                <span className="block text-[10px] uppercase tracking-wider text-white/40">7. Number of Versions</span>
                <span className="text-sm font-semibold text-white">1</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 col-span-2 md:col-span-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="block text-[10px] uppercase tracking-wider text-white/40">8. Relevant Keywords</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(track.keywords || "Cinematic, Ambient, Production Music");
                      showToast('Keywords copied to clipboard!', 'success');
                    }}
                    className="p-1 rounded bg-white/5 hover:bg-white/15 transition-all text-white/60 hover:text-white"
                    title="Copy keywords as comma-separated text"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(track.keywords || "Cinematic, Ambient, Production Music")
                    .split(',')
                    .map((kw: string) => kw.trim())
                    .filter(Boolean)
                    .map((kw: string, i: number) => (
                      <span key={i} className="text-[10px] bg-white/10 hover:bg-white/15 text-white/80 px-2 py-0.5 rounded-full border border-white/5 transition-colors">
                        {kw}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-widest text-accent font-bold">
                Feedback / Review Notes
              </label>
              {saved && (
                <span className="text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle size={12} /> Feedback Sent ✓
                </span>
              )}
            </div>
            
            {/* Approve / Reject buttons */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => handleReviewStatus('approved')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs uppercase tracking-wider font-bold transition-all ${
                  reviewStatus === 'approved'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ThumbsUp size={14} /> Approve Track
              </button>
              <button
                onClick={() => handleReviewStatus('rejected')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs uppercase tracking-wider font-bold transition-all ${
                  reviewStatus === 'rejected'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ThumbsDown size={14} /> Reject Track
              </button>
            </div>

            <div className="relative">
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave comments, concerns or revision requests here..."
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 min-h-[90px] text-sm focus:outline-none focus:border-accent transition-colors resize-y text-white/90"
              />
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Actions (Left: Copy All & Send Feedback) */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={saveComment}
                  disabled={!comment.trim() || saving}
                  className="bg-accent text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  {saved ? 'Feedback Sent ✓' : 'Send Feedback'}
                </button>

                {index === 0 && (
                  <button 
                    onClick={copyAllFeedback}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                    title="Copy All Feedback to Clipboard"
                  >
                    <Copy size={16} className="text-white/80" />
                  </button>
                )}
              </div>

              {/* Right: Musicvine Zip Download & Copy Link */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApproveAndDownload}
                  disabled={isZipping}
                  className={`font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
                    isApproved 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-white text-black hover:bg-white/80'
                  }`}
                >
                  {isZipping ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FileArchive size={14} />
                      {isApproved ? 'Downloaded ✓' : 'Download ZIP'}
                    </>
                  )}
                </button>

                <button
                  onClick={copyZipLink}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/10 text-white"
                  title="Copy Direct ZIP Download Link"
                >
                  <LinkIcon size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
