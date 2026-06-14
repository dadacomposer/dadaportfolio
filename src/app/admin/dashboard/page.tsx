'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Trash2, MessageSquare, LogOut, Edit2, Eye, EyeOff, MonitorOff, Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useAudio } from '@/context/AudioContext';

import UploadTrackModal from '@/components/admin/UploadTrackModal';
import SharePlaylistBuilder from '@/components/admin/SharePlaylistBuilder';
import EditTrackModal from '@/components/admin/EditTrackModal';

const MusicvineIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 14c1.5-2 3.5-5 5.5-5s3.5 3 2.5 6.5C12 12 13.5 9 15.5 9s3.5 3 2.5 6.5c1-1.5 2-4 3.5-4s2 1.5 1.5 2.5" />
  </svg>
);

export default function AdminDashboard() {
  const { currentTrackUrl, isPlaying, playTrack, togglePlay } = useAudio();
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Load tracks, comments & playlists, and handle mobile check
  useEffect(() => {
    fetchTracks();
    fetchComments();
    fetchPlaylists();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Subscribe to Postgres changes on the comments table for real-time updates
    const subscription = supabase
      .channel('realtime-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        fetchComments();
        if (payload.eventType === 'INSERT') {
          showToast('New feedback comment received!', 'info');
        }
      })
      .subscribe();

    return () => {
      window.removeEventListener('resize', checkMobile);
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTracks = async () => {
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    if (data) setTracks(data);
  };

  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*').order('created_at', { ascending: false });
    if (data) {
      setPlaylists(data);
      // Auto-select the first playlist as active chat if not already set
      if (data.length > 0) {
        setActivePlaylistId(data[0].id);
      }
    }
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, playlists(title), tracks(title)')
      .order('created_at', { ascending: false });
    if (data) setComments(data);
  };

  const toggleSelection = (id: string) => {
    setSelectedTracks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleLogout = async () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    showToast('Logged out successfully', 'info');
    router.push('/');
  };

  const handleDelete = async (id: string, cloudinary_id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this track from the database? (The file on Cloudinary will not be deleted)');
    if (!confirmDelete) return;
    
    try {
      const { error } = await supabase.from('tracks').delete().eq('id', id);
      if (error) throw error;
      showToast('Track deleted successfully', 'success');
      fetchTracks();
      setSelectedTracks(prev => prev.filter(t => t !== id));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete track', 'error');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activePlaylistId) return;
    setSendingReply(true);
    try {
      const { error } = await supabase.from('comments').insert([{
        playlist_id: activePlaylistId,
        track_id: null,
        author: 'DADA',
        text: replyText
      }]);

      if (error) throw error;
      setReplyText('');
      showToast('Reply sent to Lia!', 'success');
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to send reply', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this comment?');
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      showToast('Comment deleted', 'success');
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleResetLog = async () => {
    if (!activePlaylistId) return;
    const confirmReset = window.confirm('Are you sure you want to completely clear the chat log and review history for this playlist? This cannot be undone.');
    if (!confirmReset) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('playlist_id', activePlaylistId);
      
      if (error) throw error;
      showToast('Playlist log completely cleared!', 'success');
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to clear log', 'error');
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to deactivate and delete this share link? This will permanently disable the link and delete all comments.');
    if (!confirmDelete) return;

    try {
      // First delete comments to satisfy foreign key constraints just in case
      await supabase.from('comments').delete().eq('playlist_id', playlistId);
      
      // Then delete the playlist itself
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      showToast('Share link deleted & deactivated!', 'success');
      
      if (activePlaylistId === playlistId) {
        setActivePlaylistId('');
      }
      
      fetchPlaylists();
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete share link', 'error');
    }
  };

  const handleDeleteAllPlaylists = async () => {
    const confirmDelete = window.confirm('WARNING: Are you sure you want to delete and deactivate ALL shared links? This will permanently deactivate every link you have ever created and clear all chat logs. This cannot be undone.');
    if (!confirmDelete) return;

    try {
      // Clear all comments
      await supabase.from('comments').delete().neq('author', 'doesnotexist');
      
      // Clear all playlists
      const { error } = await supabase
        .from('playlists')
        .delete()
        .neq('slug', 'doesnotexist');

      if (error) throw error;

      showToast('All share links successfully deleted & deactivated!', 'success');
      setActivePlaylistId('');
      fetchPlaylists();
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete all links', 'error');
    }
  };

  const handleQuickShareView = async (track: any) => {
    try {
      const slug = Math.random().toString(36).substring(2, 10);
      
      const { error } = await supabase.from('playlists').insert([{
        title: `${track.title} (Quick Share - View Only)`,
        slug,
        track_ids: [track.id],
        permission_level: 'view'
      }]);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/share/${slug}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast(`Quick View-Only share link generated & copied to clipboard!`, 'success');
      fetchPlaylists(); // Refresh playlist dropdown
    } catch (err) {
      console.error(err);
      showToast('Failed to generate quick share link', 'error');
    }
  };

  const handleQuickShareMusicvine = async (track: any) => {
    try {
      const slug = Math.random().toString(36).substring(2, 10);
      
      const { error } = await supabase.from('playlists').insert([{
        title: `${track.title} (Single Share)`,
        slug,
        track_ids: [track.id],
        permission_level: 'musicvine'
      }]);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/share/${slug}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast(`Quick Musicvine share link generated & copied to clipboard!`, 'success');

      // Trigger Slack Notification (Daniels phone)
      try {
        await fetch('/api/notify-slack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackTitle: `"${track.title}"`,
            playlistTitle: `${track.title} (Single Share)`,
            type: 'share_created',
            shareLink: shareUrl
          })
        });
      } catch (slackErr) {
        console.error('Failed to notify Slack:', slackErr);
      }
      fetchPlaylists(); // Refresh playlist dropdown
    } catch (err) {
      console.error(err);
      showToast('Failed to generate quick share link', 'error');
    }
  };

  const toggleVisibility = async (id: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ is_hidden: !currentHidden })
        .eq('id', id);

      if (error) throw error;
      showToast(`Track is now ${!currentHidden ? 'hidden' : 'visible'} in public library`, 'success');
      fetchTracks();
    } catch (err) {
      console.error(err);
      showToast('Failed to update visibility', 'error');
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-deepblack text-white flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-accent selection:text-white">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <MonitorOff size={36} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">Desktop Only</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            The Admin Dashboard contains advanced mixer tools, track analysis stats, and real-time activity logs designed exclusively for desktop monitors. 
            Please access this page from your PC.
          </p>
          <div className="pt-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-white/30 font-semibold">
            Vault Security • DADA
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deepblack text-white p-6 md:p-12 font-sans selection:bg-accent selection:text-white">
      <div className="max-w-[1440px] w-full mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Vault</h1>
            <p className="text-white/40 mt-2 text-sm tracking-widest uppercase">Admin Dashboard</p>
          </div>
          <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-sm uppercase tracking-widest">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="bg-white text-black px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-white/80 transition-all"
          >
            <Upload size={16} /> Upload Track
          </button>

          {selectedTracks.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <button 
                onClick={() => setIsShareOpen(true)}
                className="border border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full text-xs uppercase tracking-widest flex items-center gap-2 transition-all"
              >
                <LinkIcon size={16} /> Create Playlist ({selectedTracks.length})
              </button>
            </motion.div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tracks List (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-x-auto backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="p-6 font-normal w-12"></th>
                    <th className="p-6 font-normal min-w-[200px]">Title</th>
                    <th className="p-6 font-normal max-w-[180px] min-w-[120px]">Cloudinary ID</th>
                    <th className="p-6 font-normal min-w-[100px]">Added</th>
                    <th className="p-6 font-normal text-right w-48 min-w-[192px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map(track => (
                    <tr key={track.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <input 
                          type="checkbox" 
                          checked={selectedTracks.includes(track.id)}
                          onChange={() => toggleSelection(track.id)}
                          className="w-4 h-4 accent-white bg-transparent border-white/20 cursor-pointer"
                        />
                      </td>
                      <td className="p-6 min-w-[200px]">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              const isCurrent = currentTrackUrl === track.audio_url;
                              if (isCurrent) {
                                togglePlay();
                              } else {
                                playTrack(
                                  track.audio_url,
                                  track.title,
                                  track.artwork_url || `/artworks/${track.title}.jpg`,
                                  track.preview_start || 0
                                );
                              }
                            }}
                            className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-lg border transition-all cursor-pointer ${
                              isPlaying && currentTrackUrl === track.audio_url
                                ? 'bg-accent/10 border-accent/40 text-accent'
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20 hover:bg-white/10'
                            }`}
                            title={isPlaying && currentTrackUrl === track.audio_url ? "Pause" : "Play"}
                          >
                            {isPlaying && currentTrackUrl === track.audio_url ? (
                              <Pause size={12} fill="currentColor" />
                            ) : (
                              <Play size={12} fill="currentColor" className="ml-0.5" />
                            )}
                          </button>
                          <img 
                            src={track.artwork_url || `/artworks/${track.title}.jpg`} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0 bg-white/5"
                            onError={(e) => {
                              // If image fails to load, replace with a default cover text div
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                (e.target as HTMLElement).style.display = 'none';
                                let fallbackDiv = parent.querySelector('.artwork-fallback');
                                if (!fallbackDiv) {
                                  fallbackDiv = document.createElement('div');
                                  fallbackDiv.className = 'artwork-fallback w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/30 shrink-0 uppercase tracking-tighter text-center leading-none';
                                  fallbackDiv.textContent = 'No Cover';
                                  parent.insertBefore(fallbackDiv, parent.firstChild);
                                }
                              }
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <div onClick={() => toggleSelection(track.id)} className="font-bold text-white hover:text-accent cursor-pointer transition-colors uppercase tracking-tight text-sm md:text-base">{track.title}</div>
                              {track.is_hidden && (
                                <span className="text-[9px] uppercase tracking-widest bg-red-950/40 text-red-400 border border-red-900/30 px-1.5 py-0.5 rounded-md font-medium shrink-0">Hidden</span>
                              )}
                            </div>
                            {/* Inline Comments Badges */}
                            {comments.filter(c => c.track_id === track.id).length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {comments.filter(c => c.track_id === track.id).map(c => (
                                  <span key={c.id} className="inline-block bg-accent/10 border border-accent/20 text-accent text-[9px] px-2 py-0.5 rounded-full font-medium" title={`${c.author}: ${c.text}`}>
                                    Lia: "{c.text.length > 25 ? c.text.substring(0, 22) + '...' : c.text}"
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-white/40 text-sm font-mono max-w-[180px] min-w-[120px] truncate" title={track.cloudinary_id}>{track.cloudinary_id}</td>
                      <td className="p-6 text-white/40 text-sm min-w-[100px]">
                        {new Date(track.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right w-48 min-w-[192px]">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-3">
                          <button 
                            onClick={() => toggleVisibility(track.id, track.is_hidden)} 
                            className={`transition-colors ${track.is_hidden ? 'text-red-400 hover:text-red-300' : 'text-white/40 hover:text-white'}`}
                            title={track.is_hidden ? "Show in public library" : "Hide from public library"}
                          >
                            {track.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button 
                            onClick={() => handleQuickShareView(track)} 
                            className="text-white/40 hover:text-white transition-colors"
                            title="Generate Public View-Only Link"
                          >
                            <LinkIcon size={16} />
                          </button>
                          <button 
                            onClick={() => handleQuickShareMusicvine(track)} 
                            className="text-white/40 hover:text-[#ff5a60] transition-colors"
                            title="Generate Musicvine Review Link"
                          >
                            <MusicvineIcon size={16} />
                          </button>
                          <button 
                            onClick={() => { setEditingTrack(track); setIsEditOpen(true); }} 
                            className="text-white/40 hover:text-white transition-colors"
                            title="Edit Metadata"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(track.id, track.cloudinary_id)} 
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Track"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tracks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-white/40">No tracks in the vault yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Chat Log Sidebar (Right Column) */}
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit backdrop-blur-sm">
              <h2 className="text-xl font-bold uppercase tracking-tighter mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-accent" />
                Playlist Chat & Log
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              </h2>

              {/* Playlist Selector Dropdown */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs uppercase tracking-widest text-white/50">Select Shared Link / Playlist</label>
                  {activePlaylistId && (
                    <button
                      onClick={handleResetLog}
                      className="text-red-400 hover:text-red-300 text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                      title="Clear all comments, reviews, and notifications for this playlist"
                    >
                      Reset Log
                    </button>
                  )}
                </div>
                <select
                  value={activePlaylistId}
                  onChange={(e) => setActivePlaylistId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id} className="bg-deepblack text-white">
                      {pl.title} ({pl.slug})
                    </option>
                  ))}
                  {playlists.length === 0 && (
                    <option value="">No playlists shared yet</option>
                  )}
                </select>
              </div>

              <div className="border border-white/10 rounded-2xl bg-black/40 flex flex-col h-[400px] overflow-hidden">
                {/* Chat Message List */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/15">
                  {activePlaylistId ? (
                    comments
                      .filter(c => c.playlist_id === activePlaylistId)
                      .slice() // Copy array
                      .reverse() // Display chronological: oldest at top, newest at bottom
                      .map((comment) => {
                        const isMe = comment.author === 'DADA' || comment.author === 'Daniel';
                        const isSystem = comment.author === 'System Notification';
                        const isApproval = comment.text.startsWith('★ APPROVED:');
                        const isRejection = comment.text.startsWith('✗ REJECTED:');
                        
                        if (isSystem || isApproval || isRejection) {
                          return (
                            <div key={comment.id} className="flex flex-col items-center py-1 group/msg">
                              <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border ${
                                isApproval 
                                  ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                  : isRejection 
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                    : 'bg-white/5 text-white/40 border-white/5'
                              } flex items-center gap-1.5`}>
                                {comment.text}
                                <button 
                                  onClick={() => handleDeleteComment(comment.id)} 
                                  className="opacity-0 group-hover/msg:opacity-100 hover:text-red-400 text-[10px] ml-1 transition-opacity cursor-pointer"
                                  title="Delete Status Log"
                                >
                                  ✕
                                </button>
                              </span>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={comment.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group/msg relative`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-xs relative ${
                              isMe 
                                ? 'bg-accent text-white rounded-tr-none' 
                                : 'bg-white/10 text-white rounded-tl-none'
                            }`}>
                              <div className="flex justify-between items-center gap-4 text-[9px] text-white/40 mb-1">
                                <span className="font-bold text-white/60">{comment.author}</span>
                                <span>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              
                              {comment.tracks?.title && (
                                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-tight mb-1">
                                  🎵 {comment.tracks.title}
                                </div>
                              )}
                              
                              <p className="whitespace-pre-wrap">{comment.text}</p>
                              
                              {/* Delete Hover button */}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-opacity cursor-pointer shadow-lg hover:bg-red-600 text-[9px]"
                                title="Delete Message"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-white/30 text-center text-xs py-12">No active playlist selected.</p>
                  )}
                  {activePlaylistId && comments.filter(c => c.playlist_id === activePlaylistId).length === 0 && (
                    <div className="text-center text-white/30 text-xs py-12 px-4 space-y-2">
                      <p className="uppercase tracking-widest font-semibold">No Conversation Yet</p>
                      <p className="text-[10px] text-white/20 normal-case">Lia's comments and your replies will appear here in real-time.</p>
                    </div>
                  )}
                </div>

                {/* Chat Input Area */}
                <div className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Type a message to Lia..."
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                    disabled={!activePlaylistId || sendingReply}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || !activePlaylistId || sendingReply}
                    className="bg-white text-black font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Shared Links Manager */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
                  <LinkIcon size={20} className="text-accent" />
                  Shared Links
                </h2>
                {playlists.length > 0 && (
                  <button
                    onClick={handleDeleteAllPlaylists}
                    className="text-red-400 hover:text-red-300 text-[10px] uppercase tracking-wider font-bold transition-colors cursor-pointer"
                    title="Deactivate and delete all shared links"
                  >
                    Deactivate All
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/15">
                {playlists.map((pl) => (
                  <div key={pl.id} className="p-3 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between gap-4 group">
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white truncate block uppercase tracking-tight">{pl.title}</span>
                        <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border font-mono ${
                          pl.permission_level === 'musicvine'
                            ? 'bg-red-500/10 text-[#ff5a60] border-red-500/20'
                            : pl.permission_level === 'download'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-white/5 text-white/50 border-white/5'
                        }`}>
                          {pl.permission_level}
                        </span>
                      </div>
                      <a
                        href={`/share/${pl.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-white/40 hover:text-accent font-mono transition-colors block mt-1 hover:underline truncate"
                      >
                        /share/{pl.slug}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeletePlaylist(pl.id)}
                      className="text-white/30 hover:text-red-400 p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                      title="Delete & Deactivate Link"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {playlists.length === 0 && (
                  <p className="text-xs text-white/30 text-center py-6">No shared links created yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <UploadTrackModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={fetchTracks}
      />

      <SharePlaylistBuilder 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        selectedTracks={selectedTracks}
        clearSelection={() => setSelectedTracks([])}
      />

      <EditTrackModal 
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingTrack(null); }}
        onSuccess={fetchTracks}
        track={editingTrack}
      />
    </div>
  );
}
