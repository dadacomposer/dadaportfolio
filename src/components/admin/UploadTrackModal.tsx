'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { calculateBpmFromSamples, calculateZcrFromSamples, generateKeywordsFromMetadata } from '@/lib/audioAnalyzer';

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
      // 1. Upload to Cloudinary directly from client (Direct-to-Cloudinary)
      const publicId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const folder = 'dada-composer/audio';
      const context = `title=${title}`;

      // Get secure signature from server
      const sigRes = await fetch('/api/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: {
            public_id: publicId,
            folder,
            context,
          }
        }),
      });

      if (!sigRes.ok) throw new Error('Failed to generate upload signature');
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      // Construct direct upload payload
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', file);
      cloudinaryForm.append('api_key', apiKey);
      cloudinaryForm.append('timestamp', timestamp.toString());
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('public_id', publicId);
      cloudinaryForm.append('folder', folder);
      cloudinaryForm.append('context', context);

      // Cloudinary direct upload endpoint (use resource_type: video for audio files)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: cloudinaryForm,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Direct Cloudinary upload failed: ${errorText}`);
      }
      const cloudinaryData = await uploadRes.json();

      // 2. Perform Web Audio API analysis for BPM and Zero Crossing Rate
      showToast('Analyzing track spectrum (BPM & Frequencies)...', 'info');
      let bpm = 80;
      let keywords = '';

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const samples = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;

        bpm = calculateBpmFromSamples(samples, sampleRate);
        const zcr = calculateZcrFromSamples(samples);
        keywords = generateKeywordsFromMetadata(title, zcr, bpm);
        audioCtx.close();
      } catch (err) {
        console.error('Browser audio analysis failed, using fallback:', err);
        const charSum = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        bpm = 80 + (charSum % 9) * 5;
        keywords = generateKeywordsFromMetadata(title, 0.05, bpm);
      }

      // 3. Save metadata to Supabase
      const { error } = await supabase.from('tracks').insert([{
        title,
        cloudinary_id: cloudinaryData.public_id,
        audio_url: cloudinaryData.secure_url,
        preview_start: 0,
        bpm,
        keywords,
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

    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Upload failed!', 'error');
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
