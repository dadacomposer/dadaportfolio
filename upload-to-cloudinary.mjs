// ─── Upload audio da disco locale → Cloudinary → Sanity ──────────────────────
// node upload-to-cloudinary.mjs

import { createClient } from '@sanity/client';
import { v2 as cloudinary } from 'cloudinary';
import { readdir } from 'fs/promises';
import path from 'path';

const AUDIO_DIR = '/Users/dada/Downloads/DADA_collection_extracted/DADA - DADA collection';

const SANITY_TOKEN = 'sk8bK9QbhItsFpbkl8KTVR1tMDy7dSZYbZUUrCiqqULtd45fgv3oRku4heJj1VSxGs7iy5PTHfdD7mPcz56HoLuNud9QuGGIpTD3tNUxLkDhBJlquZRRnrgvfJyGn4oGP1aVF2D5MltuwSuGA6c7FJ92uDqjq9lc0NMB4priukUEyXyeIKfA';

cloudinary.config({
  cloud_name: 'dna1jd017',
  api_key: '455291543894694',
  api_secret: 'yiNei-Rqg9cJYvjPX9umf2VykR4',
});

const sanity = createClient({
  projectId: '4o79sm04',
  dataset: 'production',
  apiVersion: '2023-05-03',
  token: SANITY_TOKEN,
  useCdn: false,
});

// Estrae il titolo pulito dal nome file es: "01 - DADA - Falling Stars.mp3" → "Falling Stars"
function extractTitle(filename) {
  return filename
    .replace(/^\d+\s*-\s*DADA\s*-\s*/i, '')
    .replace(/\.mp3$/i, '')
    .trim();
}

// Crea un public_id Cloudinary sicuro dal titolo
function toPublicId(title) {
  return 'dada-composer/audio/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function main() {
  const files = (await readdir(AUDIO_DIR))
    .filter(f => f.endsWith('.mp3'))
    .sort();

  console.log(`🎵 Trovati ${files.length} brani da caricare\n`);

  // Controlla quanti track esistono già su Sanity
  const existing = await sanity.fetch(`*[_type == "track"] { _id, title, cloudinaryUrl }`);
  const existingByTitle = Object.fromEntries(existing.map(t => [t.title, t]));
  console.log(`📦 Trovati ${existing.length} track già su Sanity\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const title = extractTitle(file);
    const publicId = toPublicId(title);
    const filePath = path.join(AUDIO_DIR, file);

    // Controlla se già su Cloudinary
    let cloudinaryUrl = null;
    try {
      const existing_cl = await cloudinary.api.resource(publicId, { resource_type: 'video' });
      cloudinaryUrl = existing_cl.secure_url;
      process.stdout.write(`⏭️  "${title}" già su Cloudinary — skip upload\n`);
    } catch {
      // Non esiste, facciamo upload
      try {
        process.stdout.write(`⏳ Upload "${title}"...`);
        const result = await cloudinary.uploader.upload(filePath, {
          resource_type: 'video',
          public_id: publicId,
          overwrite: false,
          use_filename: false,
          context: `title=${title}|artist=DADA`,
        });
        cloudinaryUrl = result.secure_url;
        console.log(` ✅`);
        uploaded++;
      } catch (err) {
        console.error(` ❌ Errore upload: ${err.message}`);
        errors++;
        continue;
      }
    }

    // Aggiorna o crea il documento Sanity
    const existing_doc = existingByTitle[title];
    try {
      if (existing_doc) {
        // Aggiorna cloudinaryUrl sul documento esistente
        await sanity.patch(existing_doc._id).set({ cloudinaryUrl }).commit();
        process.stdout.write(`   Sanity aggiornato ✅\n`);
      } else {
        // Crea un nuovo documento track
        await sanity.create({
          _type: 'track',
          title,
          cloudinaryUrl,
          previewStart: 0,
        });
        process.stdout.write(`   Nuovo track creato su Sanity ✅\n`);
      }
    } catch (err) {
      console.error(`   Errore Sanity per "${title}": ${err.message}`);
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log(`✅ Caricati su Cloudinary: ${uploaded}`);
  console.log(`⏭️  Saltati (già presenti): ${skipped}`);
  console.log(`❌ Errori: ${errors}`);
  console.log('──────────────────────────────────────────────\n');
  console.log('🎉 Migrazione completata! Aggiorno ora il codice del sito...');
}

main().catch(err => {
  console.error('Errore fatale:', err.message);
  process.exit(1);
});
