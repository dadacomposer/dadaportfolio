'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Download, Eye, Music, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function SharePlaylistBuilder({ 
  isOpen, 
  onClose, 
  selectedTracks,
  clearSelection 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  selectedTracks: string[],
  clearSelection: () => void 
}) {
  const [permission, setPermission] = useState<'view' | 'download' | 'musicvine'>('view');
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const { showToast } = useToast();

  const handleCreate = async () => {
    if (!title) {
      showToast('Please enter a title for the playlist', 'error');
      return;
    }
    setCreating(true);
    
    try {
      // Generate a random 8-character slug
      const slug = Math.random().toString(36).substring(2, 10);
      
      const { error } = await supabase.from('playlists').insert([{
        title,
        slug,
        track_ids: selectedTracks,
        permission_level: permission
      }]);

      if (error) throw error;

      setGeneratedLink(`${window.location.origin}/share/${slug}`);
      showToast('Playlist created successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create playlist', 'error');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    showToast('Link copied to clipboard!', 'success');
    onClose();
    clearSelection();
    setTimeout(() => setGeneratedLink(''), 500); // Reset after close
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-deepblack border border-white/10 rounded-3xl p-8 max-w-md w-full relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">Share {selectedTracks.length} Tracks</h2>

            {generatedLink ? (
              <div className="space-y-6 flex flex-col items-center text-center">
                <CheckCircle size={48} className="text-green-400" />
                <p className="text-sm text-white/70">Playlist generated successfully!</p>
                <div className="w-full bg-white/5 p-4 rounded-xl border border-white/10 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                  {generatedLink}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-white/90"
                >
                  Copy Link & Close
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Playlist Title / Client Name</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/50 transition-colors"
                    placeholder="e.g. Musicvine Batch 1"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-4">Permission Level</label>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setPermission('view')}
                      className={`w-full flex items-center p-4 rounded-xl border transition-all ${permission === 'view' ? 'border-white bg-white/10' : 'border-white/10 bg-transparent hover:bg-white/5'}`}
                    >
                      <Eye className="mr-4 text-white/50" />
                      <div className="text-left">
                        <div className="font-bold">View Only</div>
                        <div className="text-xs text-white/50">Listen only. No downloads, no comments.</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setPermission('download')}
                      className={`w-full flex items-center p-4 rounded-xl border transition-all ${permission === 'download' ? 'border-white bg-white/10' : 'border-white/10 bg-transparent hover:bg-white/5'}`}
                    >
                      <Download className="mr-4 text-white/50" />
                      <div className="text-left">
                        <div className="font-bold">Allow Downloads</div>
                        <div className="text-xs text-white/50">Listen and download original files.</div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setPermission('musicvine')}
                      className={`w-full flex items-center p-4 rounded-xl border transition-all ${permission === 'musicvine' ? 'border-accent bg-accent/10' : 'border-white/10 bg-transparent hover:bg-white/5'}`}
                    >
                      <Music className="mr-4 text-white/50" />
                      <div className="text-left">
                        <div className="font-bold text-accent">Musicvine Mode</div>
                        <div className="text-xs text-white/50">Lia can listen and write feedback comments.</div>
                      </div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleCreate}
                  disabled={!title || creating}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                >
                  {creating ? <Loader2 className="animate-spin" size={18} /> : 'Generate Link'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
