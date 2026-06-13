import { createClient } from 'next-sanity';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
});

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function migrate() {
  console.log('Fetching projects from Sanity...');
  const projects = await sanityClient.fetch(`*[_type == "project"] {
    title,
    role,
    category,
    year,
    "video_url": videoFile.asset->url,
    "thumbnail_url": coverImage.asset->url,
    "external_url": externalUrl
  }`);

  console.log(`Found ${projects.length} projects. Migrating to Supabase...`);

  for (const p of projects) {
    const { error } = await supabase.from('projects').insert([{
      title: p.title || 'Untitled',
      role: p.role,
      category: p.category,
      year: p.year,
      video_url: p.video_url,
      thumbnail_url: p.thumbnail_url,
      external_url: p.external_url,
    }]);
    
    if (error) {
      console.error(`Failed to migrate ${p.title}:`, error);
    } else {
      console.log(`Migrated: ${p.title}`);
    }
  }
  
  console.log('Migration complete!');
}

migrate().catch(console.error);
