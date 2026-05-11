// ─── Upload SOLO su Cloudinary (senza Sanity) ────────────────────────────────
// node upload-cloudinary-only.mjs

import { v2 as cloudinary } from 'cloudinary';
import { readdir } from 'fs/promises';
import path from 'path';

const AUDIO_DIR = '/Users/dada/Downloads/DADA_collection_extracted/DADA - DADA collection';

cloudinary.config({
  cloud_name: 'dna1jd017',
  api_key: '455291543894694',
  api_secret: 'yiNei-Rqg9cJYvjPX9umf2VykR4',
});

function extractTitle(filename) {
  return filename
    .replace(/^\d+\s*-\s*DADA\s*-\s*/i, '')
    .replace(/\.mp3$/i, '')
    .trim();
}

function toPublicId(title) {
  return 'dada-composer/audio/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function main() {
  const files = (await readdir(AUDIO_DIR)).filter(f => f.endsWith('.mp3')).sort();
  console.log(`🎵 ${files.length} brani da caricare su Cloudinary\n`);

  const results = [];

  for (const file of files) {
    const title = extractTitle(file);
    const publicId = toPublicId(title);
    const filePath = path.join(AUDIO_DIR, file);

    // Controlla se già su Cloudinary
    try {
      const existing = await cloudinary.api.resource(publicId, { resource_type: 'video' });
      console.log(`⏭️  "${title}" già su Cloudinary`);
      results.push({ title, url: existing.secure_url });
      continue;
    } catch {}

    // Upload
    try {
      process.stdout.write(`⏳ "${title}"...`);
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: 'video',
        public_id: publicId,
        overwrite: false,
        context: `title=${title}|artist=DADA`,
      });
      console.log(` ✅ ${result.secure_url}`);
      results.push({ title, url: result.secure_url });
    } catch (err) {
      console.error(` ❌ ${err.message}`);
    }
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('📋 RIEPILOGO URL (incollali in Sanity manualmente o usali nel codice):');
  console.log('══════════════════════════════════════════════\n');
  for (const { title, url } of results) {
    console.log(`${title}: ${url}`);
  }

  // Salva anche in un file JSON per uso successivo
  const fs = await import('fs');
  fs.writeFileSync('./cloudinary-urls.json', JSON.stringify(results, null, 2));
  console.log('\n✅ URL salvati anche in cloudinary-urls.json');
}

main().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
