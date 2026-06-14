'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Trash2, MessageSquare, LogOut, Edit2, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

import UploadTrackModal from '@/components/admin/UploadTrackModal';
import SharePlaylistBuilder from '@/components/admin/SharePlaylistBuilder';
import EditTrackModal from '@/components/admin/EditTrackModal';

export default function AdminDashboard() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // Load tracks & comments
  useEffect(() => {
    fetchTracks();
    fetchComments();

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
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchTracks = async () => {
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    if (data) setTracks(data);
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

  const handleQuickShare = async (track: any) => {
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

  return (
    <div className="min-h-screen bg-deepblack text-white p-6 md:p-12 font-sans selection:bg-accent selection:text-white">
      <div className="max-w-7xl mx-auto">
        
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
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="p-6 font-normal w-12"></th>
                    <th className="p-6 font-normal">Title</th>
                    <th className="p-6 font-normal">Cloudinary ID</th>
                    <th className="p-6 font-normal">Added</th>
                    <th className="p-6 font-normal text-right">Actions</th>
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
                      <td className="p-6">
                        <div className="flex items-center gap-4">
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
                      <td className="p-6 text-white/40 text-sm font-mono">{track.cloudinary_id}</td>
                      <td className="p-6 text-white/40 text-sm">
                        {new Date(track.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-3">
                        <button 
                          onClick={() => toggleVisibility(track.id, track.is_hidden)} 
                          className={`transition-colors ${track.is_hidden ? 'text-red-400 hover:text-red-300' : 'text-white/40 hover:text-white'}`}
                          title={track.is_hidden ? "Show in public library" : "Hide from public library"}
                        >
                          {track.is_hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => handleQuickShare(track)} 
                          className="text-white/40 hover:text-white transition-colors"
                          title="Generate Quick Share Link"
                        >
                          <LinkIcon size={16} />
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

          {/* Feedback Feed (Right Column) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit backdrop-blur-sm">
            <h2 className="text-xl font-bold uppercase tracking-tighter mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-accent" />
              Lia's Feedback Feed
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            </h2>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-black/30 border border-white/5 p-4 rounded-2xl text-xs space-y-2 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-center text-white/40">
                    <span className="font-bold text-white/60">{comment.author}</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/80 font-medium whitespace-pre-wrap">{comment.text}</p>
                  <div className="text-[10px] text-white/30 uppercase tracking-tighter pt-2 border-t border-white/5 flex flex-col gap-0.5">
                    <div>Track: <span className="text-white/50">{comment.tracks?.title || 'Deleted Track'}</span></div>
                    <div>Link: <span className="text-white/50">{comment.playlists?.title || 'Single Share'}</span></div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-white/40 text-center text-xs py-8">No comments or feedback received yet.</p>
              )}
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
