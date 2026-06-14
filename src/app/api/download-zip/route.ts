import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId');

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
    const audioBuffer = await audioRes.arrayBuffer();

    // 3. Prepare filenames
    const originalExt = track.audio_url.split('.').pop()?.split('?')[0] || 'wav';
    const formattedTitle = track.title
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-+/g, '-');
    
    // Replace colon with hyphen for duration (e.g. 2:30 -> 2-30)
    const durationStr = (track.duration || '2-30').replace(':', '-');
    const zipFolderName = `${formattedTitle}-DADA`;
    const audioFileName = `${formattedTitle}-DADA-main-version-${durationStr}.${originalExt}`;

    // 4. Create ZIP
    const zip = new JSZip();
    const folder = zip.folder(zipFolderName);
    if (folder) {
      folder.file(audioFileName, audioBuffer);
    } else {
      zip.file(audioFileName, audioBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // 5. Save approval/download notification to comments in database (like client-side used to do)
    try {
      const approvalText = `★ APPROVED: Track approved and ZIP downloaded (main-version-${durationStr}.${originalExt}).`;
      await supabase.from('comments').insert([{
        track_id: track.id,
        author: 'System Notification',
        text: approvalText
      }]);
    } catch (err) {
      console.error('Failed to log approval comment:', err);
    }

    // 6. Return ZIP response
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
