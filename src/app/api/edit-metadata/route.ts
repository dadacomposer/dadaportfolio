import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v2 as cloudinary } from 'cloudinary';
import NodeID3 from 'node-id3';
import { WaveFile } from 'wavefile';

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

    // 2. Download audio file from Cloudinary/URL (use replacement audio if provided)
    const audioUrlToDownload = newAudioUrl || track.audio_url;
    const audioRes = await fetch(audioUrlToDownload);
    if (!audioRes.ok) throw new Error('Failed to download audio file');
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    // 3. Download artwork image if URL is provided
    let artworkBuffer: Buffer | null = null;
    let artworkMime = 'image/jpeg';
    if (artworkUrl) {
      try {
        const artRes = await fetch(artworkUrl);
        if (artRes.ok) {
          artworkBuffer = Buffer.from(await artRes.arrayBuffer());
          artworkMime = artRes.headers.get('content-type') || 'image/jpeg';
        }
      } catch (err) {
        console.error('Failed to download artwork for tagging:', err);
      }
    }

    // 4. Modify file buffer according to its format
    const extension = audioUrlToDownload.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
    let updatedBuffer = audioBuffer;

    if (extension === 'mp3') {
      const tags: any = {
        title: title,
        artist: artist || 'DADA',
        album: album || 'DADA Portfolio',
      };
      if (bpm) {
        tags.bpm = String(bpm);
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

      updatedBuffer = NodeID3.write(tags, audioBuffer) as any;
    } else if (extension === 'wav') {
      const wav = new WaveFile(audioBuffer);
      wav.setTag('INAM', title);
      wav.setTag('IART', artist || 'DADA');
      wav.setTag('IPRD', album || 'DADA Portfolio');
      updatedBuffer = Buffer.from(wav.toBuffer());
    }

    // 5. Upload the tagged file buffer back to Cloudinary, overwriting the target public_id
    const targetCloudinaryId = newCloudinaryId || track.cloudinary_id;
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: targetCloudinaryId,
          overwrite: true,
          invalidate: true, // Crucial to purge CDN cache
          resource_type: 'video' // Cloudinary requires 'video' for audio files
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(updatedBuffer);
    });

    // 6. Update database record in Supabase
    const { error: updateError } = await supabase
      .from('tracks')
      .update({
        title,
        artist: artist || 'DADA',
        album: album || 'DADA Portfolio',
        artwork_url: artworkUrl || null,
        audio_url: uploadResult.secure_url,
        cloudinary_id: targetCloudinaryId,
        bpm: bpm ? parseInt(bpm) : null,
        keywords: keywords || null
      })
      .eq('id', trackId);

    if (updateError) throw updateError;

    // 7. If we uploaded a new file under a new ID, delete the old file from Cloudinary to clean up
    if (newCloudinaryId && track.cloudinary_id && track.cloudinary_id !== newCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(track.cloudinary_id, { resource_type: 'video' });
      } catch (err) {
        console.error('Failed to delete old Cloudinary asset:', err);
      }
    }

    return NextResponse.json({ success: true, audio_url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('Error in edit-metadata API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
