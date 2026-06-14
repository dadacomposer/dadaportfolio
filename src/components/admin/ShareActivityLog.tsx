'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Calendar, ChevronRight, ChevronLeft, User, Music, Edit2, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  playlist_id: string;
  track_id: string | null;
  author: string;
  text: string;
  created_at: string;
}

interface ShareActivityLogProps {
  playlistId: string;
  tracks: any[];
}

export default function ShareActivityLog({ playlistId, tracks }: ShareActivityLogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const { showToast } = useToast();

  // Open sidebar by default on desktop viewports
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsOpen(true);
    }
  }, []);

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (commentId: string) => {
    if (!editText.trim()) return;
    setSavingId(commentId);
    try {
      const { error } = await supabase
        .from('comments')
        .update({ text: editText })
        .eq('id', commentId);

      if (error) throw error;
      
      showToast('Comment updated successfully!', 'success');
      setEditingId(null);
      setEditText('');
      fetchComments();
    } catch (err) {
      console.error(err);
      showToast('Failed to update comment', 'error');
    } finally {
      setSavingId(null);
    }
  };

  // Map track IDs to names for easy lookup
  const trackMap = new Map<string, string>();
  tracks.forEach(t => trackMap.set(t.id, t.title));

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime comments postgres_changes (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel(`playlist-comments-log-${playlistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `playlist_id=eq.${playlistId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playlistId]);

  const formatCommentTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Toggle Button (visible when sidebar is closed, or always on mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[120] lg:bottom-auto lg:top-24 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-white/10 ${
          isOpen ? 'lg:right-[370px]' : 'lg:right-6'
        }`}
        title={isOpen ? "Close Activity Log" : "Open Activity Log"}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Sidebar Drawer Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[350px] bg-black/60 border-l border-white/10 backdrop-blur-xl z-[110] flex flex-col shadow-2xl overflow-hidden pt-24"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-accent" />
                <h3 className="text-sm uppercase tracking-widest font-bold text-white">Review Log</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-semibold border border-white/5 font-mono">
                  {comments.length}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="sm:hidden text-white/40 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Close Activity Log"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/15">
              {loading ? (
                <div className="text-center text-white/40 text-xs py-8 uppercase tracking-widest">
                  Loading notes...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-white/30 text-xs py-12 px-4 space-y-2">
                  <p className="uppercase tracking-widest font-semibold">No Activity Yet</p>
                  <p className="text-[10px] text-white/20 normal-case">Lia's comments and approvals will appear here in real-time as she writes them.</p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isApproval = comment.text.startsWith('★ APPROVED:');
                  const isRejection = comment.text.startsWith('✗ REJECTED:');
                  const trackName = comment.track_id ? trackMap.get(comment.track_id) : null;
                  const isEditable = comment.author === 'Musicvine Reviewer' && !isApproval && !isRejection;
                  const isEditing = editingId === comment.id;
                  
                  return (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isApproval 
                          ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10' 
                          : isRejection
                            ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Meta: Author & Time */}
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-white/40 mb-2">
                        <div className="flex items-center gap-1">
                          <User size={10} className="text-accent" />
                          <span className="font-semibold text-white/60">{comment.author}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          {isEditable && !isEditing && (
                            <button
                              onClick={() => startEditing(comment)}
                              className="text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5 normal-case font-bold"
                              title="Edit Feedback"
                            >
                              <Edit2 size={10} /> Edit
                            </button>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{formatCommentTime(comment.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Associated Track */}
                      {trackName && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-white/80 mb-1.5 uppercase tracking-tight">
                          <Music size={10} className="text-white/40 shrink-0" />
                          <span className="truncate">{trackName}</span>
                        </div>
                      )}

                      {/* Comment Body / Edit Area */}
                      {isEditing ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-accent resize-y min-h-[60px]"
                            placeholder="Edit your comment..."
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={cancelEditing}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] uppercase font-bold text-white transition-all cursor-pointer"
                              disabled={savingId === comment.id}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEdit(comment.id)}
                              className="px-2.5 py-1 rounded bg-accent hover:bg-accent/80 text-[10px] uppercase font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
                              disabled={savingId === comment.id || !editText.trim()}
                            >
                              {savingId === comment.id ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-xs leading-relaxed whitespace-pre-wrap ${
                          isApproval ? 'text-green-400 font-medium' : isRejection ? 'text-red-400 font-medium' : 'text-white/80'
                        }`}>
                          {comment.text}
                        </p>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
