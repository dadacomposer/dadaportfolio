'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { calculateBpmFromSamples, calculateZcrFromSamples, generateKeywordsFromMetadata } from '@/lib/audioAnalyzer';

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
  const [bpm, setBpm] = useState('');
  const [keywords, setKeywords] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [analyzingAudio, setAnalyzingAudio] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewAudioFile(file);
    setAnalyzingAudio(true);
    showToast('Analyzing replacement audio spectrum...', 'info');

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const samples = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;

      const analyzedBpm = calculateBpmFromSamples(samples, sampleRate);
      const zcr = calculateZcrFromSamples(samples);
      const analyzedKeywords = generateKeywordsFromMetadata(title || file.name, zcr, analyzedBpm);

      setBpm(String(analyzedBpm));
      setKeywords(analyzedKeywords);
      showToast('Audio analyzed! BPM and keywords updated.', 'success');
      audioCtx.close();
    } catch (err) {
      console.error('Browser audio analysis failed:', err);
      showToast('Audio loaded but analysis failed. Enter metadata manually.', 'info');
    } finally {
      setAnalyzingAudio(false);
    }
  };

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      setArtworkUrl(track.artwork_url || `/artworks/${track.title}.jpg`);
      setBpm(track.bpm ? String(track.bpm) : '');
      setKeywords(track.keywords || '');
      setNewAudioFile(null); // Clear loaded file when switching tracks
    }
  }, [track, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    showToast('Uploading artwork to Cloudinary...', 'info');

    try {
      const publicId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-artwork-${Date.now()}`;
      const folder = 'dada-composer/artwork';

      // Get secure signature from server
      const sigRes = await fetch('/api/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params: {
            public_id: publicId,
            folder,
          }
        }),
      });

      if (!sigRes.ok) {
        const errorData = await sigRes.json();
        throw new Error(errorData.error || 'Failed to generate artwork signature');
      }
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      // Construct direct upload payload
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', file);
      cloudinaryForm.append('api_key', apiKey);
      cloudinaryForm.append('timestamp', timestamp.toString());
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('public_id', publicId);
      cloudinaryForm.append('folder', folder);

      // Upload directly to Cloudinary (resource_type: image)
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudinaryForm,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Direct Cloudinary artwork upload failed: ${errorText}`);
      }
      const cloudinaryData = await uploadRes.json();

      setArtworkUrl(cloudinaryData.secure_url);
      showToast('Artwork uploaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Artwork upload failed', 'error');
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
    showToast('Updating database metadata...', 'info');

    try {
      let newAudioUrl = null;
      let newCloudinaryId = null;

      if (newAudioFile) {
        showToast('Uploading replacement audio file directly to Cloudinary...', 'info');
        const publicId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-replacement-${Date.now()}`;
        const folder = 'dada-composer/audio';

        // Get secure signature from server
        const sigRes = await fetch('/api/cloudinary-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            params: {
              public_id: publicId,
              folder,
            }
          }),
        });

        if (!sigRes.ok) {
          const errorData = await sigRes.json();
          throw new Error(errorData.error || 'Failed to generate audio signature');
        }
        const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

        // Construct direct upload payload
        const cloudinaryForm = new FormData();
        cloudinaryForm.append('file', newAudioFile);
        cloudinaryForm.append('api_key', apiKey);
        cloudinaryForm.append('timestamp', timestamp.toString());
        cloudinaryForm.append('signature', signature);
        cloudinaryForm.append('public_id', publicId);
        cloudinaryForm.append('folder', folder);

        // Upload directly to Cloudinary (use resource_type: video for audio files)
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
          method: 'POST',
          body: cloudinaryForm,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Direct Cloudinary audio upload failed: ${errorText}`);
        }
        const uploadData = await uploadRes.json();
        newAudioUrl = uploadData.secure_url;
        newCloudinaryId = uploadData.public_id;
      }

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
          bpm: bpm ? parseInt(bpm) : null,
          keywords,
          newAudioUrl,
          newCloudinaryId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update track record');
      }

      setSuccess(true);
      showToast('Track details and audio updated successfully!', 'success');
      setTimeout(() => {
        setSuccess(false);
        setNewAudioFile(null);
        onSuccess(); // Refresh track list
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to update track', 'error');
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">BPM</label>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50 transition-colors text-sm font-mono"
                      placeholder="e.g. 90"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Tags / Keywords</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/50 transition-colors text-sm"
                      placeholder="e.g. Cinematic, Ambient"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Replacement Audio File (Optional)</label>
                  <div
                    onClick={() => !analyzingAudio && audioFileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all text-xs"
                  >
                    {analyzingAudio ? (
                      <>
                        <Loader2 className="animate-spin text-white/50 mb-1" size={16} />
                        <span className="text-white/70">Analyzing audio frequencies...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={16} className="text-white/50 mb-1" />
                        <span className="text-white/70 truncate max-w-full">
                          {newAudioFile ? newAudioFile.name : "Click to replace track audio (MP3/WAV)"}
                        </span>
                        {newAudioFile && (
                          <span className="text-[9px] text-accent mt-1">Audio loaded & analyzed</span>
                        )}
                      </>
                    )}
                    <input
                      type="file"
                      ref={audioFileInputRef}
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />
                  </div>
                  {newAudioFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewAudioFile(null);
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 mt-1 uppercase tracking-wider block"
                    >
                      Clear Audio Selection
                    </button>
                  )}
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
                  disabled={!title || saving || uploadingImage || analyzingAudio}
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
