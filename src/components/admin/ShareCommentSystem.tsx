'use client';
import { useState, useRef } from 'react';
import { Play, Pause, Download, Copy, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ShareCommentSystem({ 
  track, 
  index, 
  playlistId,
  permissionLevel 
}: { 
  track: any, 
  index: number,
  playlistId: string,
  permissionLevel: string 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Stop all other audio elements on the page before playing this one
        document.querySelectorAll('audio').forEach(el => el.pause());
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const saveComment = async () => {
    if (!comment) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('comments').insert([{
        playlist_id: playlistId,
        track_id: track.id,
        author: 'Musicvine Reviewer', // In a full version, we could ask for their name
        text: comment
      }]);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save comment securely.');
    } finally {
      setSaving(false);
    }
  };

  // Helper function for Lia to copy all textareas to clipboard
  const copyAllFeedback = () => {
    const textareas = document.querySelectorAll('textarea');
    let fullText = 'Musicvine Feedback:\\n\\n';
    
    textareas.forEach((ta, i) => {
      if (ta.value) {
        // Try to get track title from the sibling DOM element
        const titleElement = ta.closest('.track-container')?.querySelector('.track-title');
        const trackTitle = titleElement ? titleElement.textContent : `Track ${i + 1}`;
        fullText += `--- ${trackTitle} ---\\n${ta.value}\\n\\n`;
      }
    });

    if (fullText.trim() === 'Musicvine Feedback:') {
      alert('No feedback written yet!');
      return;
    }

    navigator.clipboard.writeText(fullText);
    alert('All feedback copied! You can now paste it into an email.');
  };

  return (
    <div className="track-container bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm transition-colors hover:bg-white/10">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        
        {/* Play Button */}
        <button 
          onClick={togglePlay}
          className="w-14 h-14 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={24} className="fill-black" /> : <Play size={24} className="ml-1 fill-black" />}
        </button>

        {/* Track Info */}
        <div className="flex-grow">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Track {(index + 1).toString().padStart(2, '0')}</p>
          <h3 className="track-title text-xl font-bold uppercase tracking-tighter">{track.title}</h3>
          <audio 
            ref={audioRef} 
            src={track.audio_url} 
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </div>

        {/* Download Button */}
        {permissionLevel === 'download' && (
          <a 
            href={track.audio_url} 
            download 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 border border-white/20 rounded-full px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            <Download size={16} /> Download
          </a>
        )}
      </div>

      {/* Musicvine Feedback Area */}
      {permissionLevel === 'musicvine' && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <label className="block text-xs uppercase tracking-widest text-accent mb-3 flex items-center justify-between">
            <span>Feedback / Notes</span>
            {saved && <span className="text-green-400">Saved to DADA's Database ✓</span>}
          </label>
          <div className="relative">
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={saveComment} // Auto-save when they click outside the box
              placeholder="What are your thoughts on this track?"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 min-h-[100px] text-sm focus:outline-none focus:border-accent transition-colors resize-y"
            />
          </div>
          
          {/* Copy All Button (Only shown on the first track to avoid clutter) */}
          {index === 0 && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={copyAllFeedback}
                className="flex items-center gap-2 text-xs uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                <Copy size={14} /> Copy All Feedback to Email
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
