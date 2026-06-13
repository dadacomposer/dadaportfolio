'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Copy, Send, CheckCircle, Music, Loader2, FileArchive } from 'lucide-react';
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Stop all other audio elements on the page
        document.querySelectorAll('audio').forEach(el => el.pause());
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
      const audioUrl = track.audio_url;
      
      // Get exact duration in minutes-seconds
      const durationStr = await new Promise<string>((resolve) => {
        const tempAudio = new Audio();
        tempAudio.src = audioUrl;
        tempAudio.addEventListener('loadedmetadata', () => {
          const dur = tempAudio.duration;
          const mins = Math.floor(dur / 60);
          const secs = Math.round(dur % 60);
          resolve(`${mins}-${secs}`);
        });
        tempAudio.addEventListener('error', () => {
          if (duration > 0) {
            const mins = Math.floor(duration / 60);
            const secs = Math.round(duration % 60);
            resolve(`${mins}-${secs}`);
          } else {
            resolve('2-30'); // Fallback default
          }
        });
      });

      // Fetch the audio file as a Blob
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error('Failed to fetch audio file');
      const blob = await response.blob();

      // Format title to use hyphens instead of spaces
      const formattedTitle = track.title
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/-+/g, '-');
      
      const zipFolderName = `${formattedTitle}-DADA`;
      const originalExt = audioUrl.split('.').pop()?.split('?')[0] || 'wav';
      const audioFileName = `${formattedTitle}-DADA-main-version-${durationStr}.${originalExt}`;

      // Package ZIP using JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      const folder = zip.folder(zipFolderName);
      if (folder) {
        folder.file(audioFileName, blob);
      } else {
        zip.file(audioFileName, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${zipFolderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

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

      setIsApproved(true);
      showToast('ZIP downloaded & approval notification sent!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to package ZIP', 'error');
    } finally {
      setIsZipping(false);
    }
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
    <div className="track-container bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 relative overflow-hidden group">
      
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

          {/* Custom Sleek Progress Bar */}
          <div className="space-y-1">
            <input 
              type="range" 
              min={0} 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent transition-all hover:h-1.5 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
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
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
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

            {/* Right: Musicvine Zip Download */}
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
                  Packaging ZIP...
                </>
              ) : (
                <>
                  <FileArchive size={14} />
                  {isApproved ? 'Approved & Downloaded ✓' : 'Approve & Download ZIP'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
