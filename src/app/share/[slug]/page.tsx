import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ShareCommentSystem from '@/components/admin/ShareCommentSystem';

// Fetch data server-side
async function getPlaylist(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: playlist } = await supabase
    .from('playlists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!playlist) return null;

  // Fetch the tracks related to this playlist
  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .in('id', playlist.track_ids);

  return { playlist, tracks: tracks || [] };
}

export default async function SharePage({ params }: { params: { slug: string } }) {
  const data = await getPlaylist(params.slug);
  if (!data) notFound();

  const { playlist, tracks } = data;

  return (
    <div className="min-h-screen bg-deepblack text-white p-6 md:p-12 font-sans selection:bg-accent selection:text-white">
      <div className="max-w-4xl mx-auto pt-12 md:pt-24">
        
        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none mb-4">{playlist.title}</h1>
          <p className="text-white/50 tracking-widest uppercase text-xs md:text-sm">
            Curated by DADA • {tracks.length} Tracks
            {playlist.permission_level === 'musicvine' && ' • Feedback Mode'}
            {playlist.permission_level === 'download' && ' • Download Available'}
          </p>
        </div>

        {/* Tracks List */}
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <ShareCommentSystem 
              key={track.id} 
              track={track} 
              index={index}
              playlistId={playlist.id}
              permissionLevel={playlist.permission_level} 
            />
          ))}
        </div>

        {/* Footer (for Musicvine mode only) */}
        {playlist.permission_level === 'musicvine' && (
          <div className="mt-20 pt-10 border-t border-white/10 text-center">
            <p className="text-xs tracking-widest uppercase text-white/40 mb-4">
              When finished reviewing, please use the "Copy All Feedback" button on any track and paste the result into an email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
