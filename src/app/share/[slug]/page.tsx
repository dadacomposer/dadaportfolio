import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ShareCommentSystem from '@/components/admin/ShareCommentSystem';
import ShareActivityLog from '@/components/admin/ShareActivityLog';

export const dynamic = 'force-dynamic';

// Fetch data server-side
async function getPlaylist(slug: string) {
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

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPlaylist(slug);
  if (!data) notFound();

  const { playlist, tracks } = data;
  const playlistTitle = playlist.title.replace(' (Single Share)', '');

  return (
    <div className="min-h-screen bg-deepblack text-white p-6 md:p-12 font-sans selection:bg-accent selection:text-white relative overflow-x-hidden">
      
      {/* Activity Log (Musicvine mode only) */}
      {playlist.permission_level === 'musicvine' && (
        <ShareActivityLog playlistId={playlist.id} tracks={tracks} />
      )}

      {/* Main Content Area */}
      <div className={`max-w-4xl mx-auto pt-12 md:pt-24 lg:pt-0 lg:min-h-[calc(100vh-100px)] lg:flex lg:flex-col lg:justify-center transition-all duration-300 ${
        playlist.permission_level === 'musicvine' ? 'lg:pr-[370px] lg:max-w-[100%]' : ''
      }`}>
        
        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-none mb-4">{playlistTitle}</h1>
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
              playlistTitle={playlist.title}
              permissionLevel={playlist.permission_level} 
            />
          ))}
        </div>

        {/* Footer (for Musicvine mode only) */}
        {playlist.permission_level === 'musicvine' && (
          <div className="max-w-3xl mx-auto mt-20 pt-10 border-t border-white/10 space-y-10">
            
            {/* Music Vine Submission Declarations */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-4 backdrop-blur-sm">
              <h3 className="text-xs uppercase tracking-widest text-accent font-bold mb-4">Music Vine Submission Declarations</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>I am the only artist / composer to receive license commissions from this track.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>I own all rights to this track (master recording & composition) or have permission from all rights holders to submit this track.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>Track aligns with Music Vine's AI policy.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>I authorize Music Vine as my publisher.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>This track doesn't contain Lyrics.</span>
                </li>
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
