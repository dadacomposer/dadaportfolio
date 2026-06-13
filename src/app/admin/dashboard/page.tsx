'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Trash2, MessageSquare, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

import UploadTrackModal from '@/components/admin/UploadTrackModal';
import SharePlaylistBuilder from '@/components/admin/SharePlaylistBuilder';

export default function AdminDashboard() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const router = useRouter();

  // Load tracks
  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    const { data } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    if (data) setTracks(data);
  };

  const toggleSelection = (id: string) => {
    setSelectedTracks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleLogout = async () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/');
  };

  const handleDelete = async (id: string, cloudinary_id: string) => {
    if (!confirm('Are you sure you want to remove this track? (File will remain on Cloudinary)')) return;
    
    await supabase.from('tracks').delete().eq('id', id);
    fetchTracks();
  };

  return (
    <div className="min-h-screen bg-deepblack text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
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

        {/* Tracks Table */}
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
                  <td className="p-6 font-medium cursor-pointer" onClick={() => toggleSelection(track.id)}>{track.title}</td>
                  <td className="p-6 text-white/40 text-sm">{track.cloudinary_id}</td>
                  <td className="p-6 text-white/40 text-sm">
                    {new Date(track.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-4">
                    <button onClick={() => handleDelete(track.id, track.cloudinary_id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={18} />
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
    </div>
  );
}
