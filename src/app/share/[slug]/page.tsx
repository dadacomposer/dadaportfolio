import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import SharePageClient from '@/components/SharePageClient';

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

  return <SharePageClient playlist={playlist} tracks={tracks} />;
}
