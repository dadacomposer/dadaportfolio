'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface EditTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  track: any;
}

export default function EditTrackModal({ isOpen, onClose, onSuccess, track }: EditTrackModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [artworkUrl, setArtworkUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      setArtworkUrl(track.artwork_url || `/artworks/${track.title}.jpg`);
    }
  }, [track, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    showToast('Uploading artwork to Cloudinary...', 'info');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `${title || 'track'}-artwork-${Date.now()}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Cloudinary artwork upload failed');
      const cloudinaryData = await res.json();

      setArtworkUrl(cloudinaryData.secure_url);
      showToast('Artwork uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Artwork upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title) {
      showToast('Please enter a track title', 'error');
      return;
    }
    setSaving(true);
    showToast('Updating file binary and database metadata...', 'info');

    try {
      const res = await fetch('/api/edit-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId: track.id,
          title,
          artist,
          album,
          artworkUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update track file');
      }

      setSuccess(true);
      showToast('File tags updated and saved successfully!', 'success');
      setTimeout(() => {
        setSuccess(false);
        onSuccess(); // Refresh track list
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update track file', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && track && (
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

            <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">Edit Track File Metadata</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-green-400">
                <CheckCircle size={64} className="mb-4" />
                <p className="tracking-widest uppercase text-sm">Metadata Saved to File</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Track Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50 transition-colors text-sm"
                    placeholder="e.g. The Turning Page"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Artist</label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50 transition-colors text-sm"
                      placeholder="e.g. DADA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Album</label>
                    <input
                      type="text"
                      value={album}
                      onChange={(e) => setAlbum(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50 transition-colors text-sm"
                      placeholder="e.g. DADA Portfolio"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Artwork Image</label>
                  <div className="flex gap-4 items-center mb-2">
                    {artworkUrl ? (
                      <img
                        src={artworkUrl}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if (parent) {
                            let fallbackDiv = parent.querySelector('.artwork-modal-fallback');
                            if (!fallbackDiv) {
                              fallbackDiv = document.createElement('div');
                              fallbackDiv.className = 'artwork-modal-fallback w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/30 text-center leading-none shrink-0';
                              fallbackDiv.textContent = 'No Cover';
                              parent.appendChild(fallbackDiv);
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/30 text-center leading-none shrink-0">
                        No Cover
                      </div>
                    )}
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={artworkUrl}
                        onChange={(e) => setArtworkUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50 transition-colors text-xs"
                        placeholder="Artwork image URL..."
                      />
                    </div>
                  </div>
                  
                  <div
                    onClick={() => !uploadingImage && imageInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all text-xs"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="animate-spin text-white/50" size={14} />
                        <span className="text-white/70">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={14} className="text-white/50" />
                        <span className="text-white/70">Upload New Cover Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!title || saving || uploadingImage}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : 'Write tags to file & database'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
