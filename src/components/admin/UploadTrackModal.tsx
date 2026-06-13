'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function UploadTrackModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleUpload = async () => {
    if (!file || !title) return;
    setUploading(true);
    showToast('Uploading track to Cloudinary...', 'info');

    try {
      // 1. Upload to Cloudinary via our Next.js API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Cloudinary upload failed');
      const cloudinaryData = await res.json();

      // 2. Save metadata to Supabase
      const { error } = await supabase.from('tracks').insert([{
        title,
        cloudinary_id: cloudinaryData.public_id,
        audio_url: cloudinaryData.secure_url,
        preview_start: 0,
      }]);

      if (error) throw error;

      setSuccess(true);
      showToast('Track uploaded successfully!', 'success');
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setTitle('');
        onSuccess(); // Refresh track list
        onClose();
      }, 2000);

    } catch (err) {
      console.error(err);
      showToast('Upload failed!', 'error');
    } finally {
      setUploading(false);
    }
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

            <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">Upload Track</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-green-400">
                <CheckCircle size={64} className="mb-4" />
                <p className="tracking-widest uppercase text-sm">Track added to vault</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Track Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-white/50 transition-colors"
                    placeholder="e.g. The Turning Page"
                  />
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all"
                >
                  <UploadCloud size={32} className="text-white/50 mb-4" />
                  <p className="text-sm text-white/70">
                    {file ? file.name : "Click to select MP3 or WAV"}
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="audio/*" 
                    onChange={e => e.target.files && setFile(e.target.files[0])}
                    className="hidden" 
                  />
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={!file || !title || uploading}
                  className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Upload to Vault'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
