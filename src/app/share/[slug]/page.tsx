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
      <div className={`max-w-4xl mx-auto pt-12 md:pt-24 transition-all duration-300 ${
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
          <div className="max-w-2xl mx-auto mt-20 pt-10 border-t border-white/10 space-y-10">
            
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
                  <span>Publishing rights: 100% owned & controlled by writer.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-0.5 font-bold">✓</span>
                  <span>This track doesn't contain Lyrics.</span>
                </li>
              </ul>
            </div>

            {/* Letter to Lia */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm shadow-2xl text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4 text-sm text-white/80 leading-relaxed font-sans">
                <p className="font-semibold text-white">Hi Lia,</p>
                <p>
                  I built this interface to streamline our track submission workflow and keep everything organized. 
                  As you can see, all the details are right here. If a track is approved, feel free to download the ZIP file directly—it is already formatted according to Music Vine's guidelines.
                </p>
                <p>
                  You'll also find the tags and metadata that I would normally submit in the approved tracks form. 
                  I've also added a handy button to copy all your review notes, so you can easily send them to me via email if that's more convenient for you. 
                  Please note that I also see all your feedback in real-time as you type it.
                </p>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-[10px] tracking-widest uppercase">Best,</p>
                    <p className="font-bold text-white uppercase tracking-tight text-base mt-1 font-mono">Daniel</p>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest bg-accent/20 text-accent px-3 py-1 rounded-full font-semibold border border-accent/20">
                    Submission Portal
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
