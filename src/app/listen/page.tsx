import { supabase } from '@/lib/supabase';
import TrackList from '@/components/TrackList';
import Link from 'next/link';
import * as motion from 'framer-motion/client';

export const dynamic = 'force-dynamic';

async function getTracks() {
  const { data } = await supabase.from('tracks').select('*').eq('is_hidden', false).order('created_at', { ascending: false });
  if (!data) return [];
  
  // Remap to match what TrackList expects (originally designed for Sanity/Cloudinary combo)
  return data.map(t => ({
    _id: t.id,
    title: t.title,
    url: t.audio_url,
    artwork: t.artwork_url,
    previewStart: t.preview_start || 0,
    artist: t.artist,
    album: t.album,
    bpm: t.bpm,
    duration: t.duration,
    category: t.category
  }));
}


export default async function ListenPage() {
  const tracks = await getTracks();

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pb-32 pt-8">
      
      {/* Header */}
      <motion.div 
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-[10px] font-light tracking-[0.5em] uppercase text-accent mb-4">Sonic Archive</p>
        <h1 className="text-5xl md:text-8xl font-light tracking-tighter text-white leading-none mb-8">Listen.</h1>
        <div className="border-t border-white/5 pt-10 max-w-2xl">
          <p className="text-gray-400 font-light leading-relaxed text-sm">
            My sonic philosophy is rooted in the subtraction of the unnecessary. 
            Every frequency must earn its place in the arrangement. From prepared piano 
            to granular synthesis, the goal is to create immersive textures that 
            elevate the visual narrative without overwhelming it.
          </p>
        </div>
      </motion.div>

      {/* Track List Component (Invisible Scrollable) */}
      <div className="mb-24">
        <TrackList tracks={tracks} />
      </div>

      {/* Additional Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32 border-t border-white/5 pt-20">
        <div>
          <h3 className="text-white font-light tracking-tight text-xl mb-4">Commissions</h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            I work closely with directors and brands to develop unique sonic identities. 
            Whether it's a 30-second national campaign or a feature-length score, 
            the process starts with a deep dive into the emotional core of the project.
          </p>
        </div>
        <div>
          <h3 className="text-white font-light tracking-tight text-xl mb-4">Licensing</h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            All tracks in this archive are available for licensing. I offer 
            tailored agreements including worldwide buyout options and platform-specific 
            rights. Direct synchronization licenses can be cleared within 24 hours.
          </p>
        </div>
        <div>
          <h3 className="text-white font-light tracking-tight text-xl mb-4">Custom Stems</h3>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Need a variation of a track? All archive pieces are organized by stems, 
            allowing for quick re-mixing or editing to perfectly match your picture 
            cut without starting from scratch.
          </p>
        </div>
      </div>

      {/* Get in Touch CTA */}
      <motion.div
        className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div>
          <p className="text-xs font-light tracking-[0.3em] uppercase text-accent mb-3">Hear something you like?</p>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-white mb-2 leading-tight">
            Let's discuss how we can <br className="hidden md:block" /> elevate your next production.
          </h2>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="shrink-0">
          <Link 
            href="https://calendly.com/dadacomposer/30min" 
            target="_blank"
            className="bg-white text-deepblack font-light tracking-widest uppercase px-10 py-4 rounded-xl hover:bg-accent hover:text-white transition-colors text-sm shadow-lg block whitespace-nowrap"
          >
            Book a Session
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
