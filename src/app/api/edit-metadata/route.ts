import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { trackId, title, artist, album, artworkUrl, bpm, keywords, newAudioUrl, newCloudinaryId } = await req.json();

    if (!trackId || !title) {
      return NextResponse.json({ error: 'Missing trackId or title' }, { status: 400 });
    }

    // 1. Fetch track details from Supabase
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // 2. Prepare database updates
    const updateData: any = {
      title,
      artist: artist || 'DADA',
      album: album || 'DADA Portfolio',
      artwork_url: artworkUrl || null,
      bpm: bpm ? parseInt(bpm) : null,
      keywords: keywords || null
    };

    // If new audio is provided, update the audio details
    if (newAudioUrl && newCloudinaryId) {
      updateData.audio_url = newAudioUrl;
      updateData.cloudinary_id = newCloudinaryId;
    }

    // 3. Update database record in Supabase
    const { error: updateError } = await supabase
      .from('tracks')
      .update(updateData)
      .eq('id', trackId);

    if (updateError) throw updateError;

    // 4. If we replaced the audio file, delete the old file from Cloudinary to clean up
    if (newCloudinaryId && track.cloudinary_id && track.cloudinary_id !== newCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(track.cloudinary_id, { resource_type: 'video' });
      } catch (err) {
        console.error('Failed to delete old Cloudinary asset:', err);
      }
    }

    const finalAudioUrl = newAudioUrl || track.audio_url;

    return NextResponse.json({ success: true, audio_url: finalAudioUrl });
  } catch (error: any) {
    console.error('Error in edit-metadata API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
