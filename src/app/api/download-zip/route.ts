import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';
import NodeID3 from 'node-id3';
import { WaveFile } from 'wavefile';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');
    const playlistId = searchParams.get('playlistId');

    if (!trackId) {
      return NextResponse.json({ error: 'Missing trackId' }, { status: 400 });
    }

    // 1. Fetch track from Supabase
    const { data: track, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (error || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // 2. Fetch the audio file from its URL
    const audioRes = await fetch(track.audio_url);
    if (!audioRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch audio file from storage' }, { status: 500 });
    }
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    // 3. Fetch artwork image if URL is provided (for MP3 ID3 tag embedding)
    let artworkBuffer: Buffer | null = null;
    let artworkMime = 'image/jpeg';
    if (track.artwork_url) {
      try {
        const artRes = await fetch(track.artwork_url);
        if (artRes.ok) {
          artworkBuffer = Buffer.from(await artRes.arrayBuffer());
          artworkMime = artRes.headers.get('content-type') || 'image/jpeg';
        }
      } catch (err) {
        console.error('Failed to download artwork for tagging on-the-fly:', err);
      }
    }

    // 4. Modify file buffer according to its format
    const originalExt = track.audio_url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'wav';
    let updatedBuffer = audioBuffer;

    if (originalExt === 'mp3') {
      const tags: any = {
        title: track.title,
        artist: track.artist || 'DADA',
        album: track.album || 'DADA Portfolio',
      };
      if (track.bpm) {
        tags.bpm = String(track.bpm);
      }

      if (artworkBuffer) {
        tags.image = {
          mime: artworkMime,
          type: {
            id: 3,
            name: 'front cover'
          },
          description: 'Cover Art',
          imageBuffer: artworkBuffer
        };
      }

      try {
        updatedBuffer = NodeID3.write(tags, audioBuffer) as any;
      } catch (err) {
        console.error('Failed to write MP3 ID3 tags during download:', err);
      }
    } else if (originalExt === 'wav') {
      try {
        const wav = new WaveFile(audioBuffer);
        wav.setTag('INAM', track.title);
        wav.setTag('IART', track.artist || 'DADA');
        wav.setTag('IPRD', track.album || 'DADA Portfolio');
        updatedBuffer = Buffer.from(wav.toBuffer());
      } catch (err) {
        console.error('Failed to write WAV tags during download:', err);
      }
    }

    // 5. Prepare filenames
    const formattedTitle = track.title
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-+/g, '-');
    
    // Replace colon with hyphen for duration (e.g. 2:30 -> 2-30)
    const durationStr = (track.duration || '2-30').replace(':', '-');
    const zipFolderName = `${formattedTitle}-DADA`;
    const audioFileName = `${formattedTitle}-DADA-main-version-${durationStr}.${originalExt}`;

    // 6. Create ZIP
    const zip = new JSZip();
    const folder = zip.folder(zipFolderName);
    if (folder) {
      folder.file(audioFileName, updatedBuffer);
    } else {
      zip.file(audioFileName, updatedBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // 7. Save approval/download notification to comments in database
    try {
      const approvalText = `★ APPROVED: Track approved and ZIP downloaded (main-version-${durationStr}.${originalExt}).`;
      await supabase.from('comments').insert([{
        playlist_id: playlistId || null,
        track_id: track.id,
        author: 'System Notification',
        text: approvalText
      }]);
    } catch (err) {
      console.error('Failed to log approval comment:', err);
    }

    // 8. Return ZIP response
    return new Response(zipBuffer as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFolderName}.zip"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Error in download-zip API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
