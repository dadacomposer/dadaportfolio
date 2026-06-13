import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { cloudinaryTracks } from './src/data/cloudinaryTracks';

dotenv.config({ path: '.env.local' });

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrateTracks() {
  console.log(`Found ${cloudinaryTracks.length} tracks to migrate...`);
  
  for (const t of cloudinaryTracks) {
    const { error } = await supabase.from('tracks').insert([{
      title: t.title,
      cloudinary_id: t._id,
      audio_url: t.url,
      preview_start: t.previewStart || 0
    }]);

    if (error) {
      console.error(`Failed to insert ${t.title}:`, error.message);
    } else {
      console.log(`Migrated track: ${t.title}`);
    }
  }
  console.log('Track migration completed!');
}

migrateTracks().catch(console.error);
