// ─── Sanity → Cloudinary Audio Migration Script ─────────────────────────────
// 
// Questo script:
//  1. Recupera tutti i brani da Sanity
//  2. Carica ogni file audio su Cloudinary
//  3. Aggiorna il documento Sanity con il nuovo URL Cloudinary
//
// Come usarlo:
//  1. Riempi le variabili in CONFIG qui sotto
//  2. Esegui: node migrate-audio.mjs

import { createClient } from '@sanity/client';
import { v2 as cloudinary } from 'cloudinary';

// ──────────────────────────────────────────────────────────────────────────────
//  ⚙️  CONFIGURAZIONE — compila questi campi prima di eseguire
// ──────────────────────────────────────────────────────────────────────────────
const CONFIG = {
  sanity: {
    projectId: '4o79sm04',
    dataset: 'production',
    apiVersion: '2023-05-03',
    token: 'sk8bK9QbhItsFpbkl8KTVR1tMDy7dSZYbZUUrCiqqULtd45fgv3oRku4heJj1VSxGs7iy5PTHfdD7mPcz56HoLuNud9QuGGIpTD3tNUxLkDhBJlquZRRnrgvfJyGn4oGP1aVF2D5MltuwSuGA6c7FJ92uDqjq9lc0NMB4priukUEyXyeIKfA',
  },
  cloudinary: {
    cloud_name: 'dna1jd017',
    api_key: '455291543894694',
    api_secret: 'yiNei-Rqg9cJYvjPX9umf2VykR4',
  },
};
// ──────────────────────────────────────────────────────────────────────────────

const sanity = createClient({ ...CONFIG.sanity, useCdn: false });

cloudinary.config(CONFIG.cloudinary);

async function migrate() {
  console.log('🎵 Recupero brani da Sanity...');

  const tracks = await sanity.fetch(`*[_type == "track"] {
    _id,
    title,
    "audioUrl": audioFile.asset->url,
    "assetId": audioFile.asset._ref
  }`);

  console.log(`✅ Trovati ${tracks.length} brani\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const track of tracks) {
    if (!track.audioUrl) {
      console.warn(`⚠️  Brano "${track.title}" non ha URL audio — saltato`);
      continue;
    }

    try {
      process.stdout.write(`⏳ Caricamento "${track.title}" su Cloudinary...`);

      // Carica su Cloudinary direttamente dall'URL di Sanity
      const result = await cloudinary.uploader.upload(track.audioUrl, {
        resource_type: 'video', // Cloudinary usa 'video' per i file audio
        folder: 'dada-composer/audio',
        public_id: track._id, // usa l'ID Sanity come nome file (evita duplicati)
        overwrite: true,
        format: 'mp3',
        transformation: [
          { quality: 'auto' }, // ottimizza automaticamente
        ],
      });

      console.log(` ✅ Done → ${result.secure_url}`);

      // Aggiorna il documento Sanity con il nuovo URL Cloudinary
      // Usiamo un campo custom "cloudinaryUrl" per non sovrascrivere l'originale
      await sanity.patch(track._id).set({
        cloudinaryUrl: result.secure_url,
      }).commit();

      successCount++;
    } catch (err) {
      console.error(` ❌ Errore per "${track.title}":`, err.message);
      errorCount++;
    }
  }

  console.log('\n──────────────────────────────────');
  console.log(`✅ Migrati con successo: ${successCount}`);
  console.log(`❌ Errori: ${errorCount}`);
  console.log('──────────────────────────────────');
  console.log('\n⚠️  PASSO SUCCESSIVO:');
  console.log('   Aggiorna src/sanity/lib/client.ts per usare "cloudinaryUrl" invece di "audioFile.asset->url"');
  console.log('   Lo faccio io automaticamente una volta completata la migrazione!\n');
}

migrate().catch(err => {
  console.error('Errore fatale:', err);
  process.exit(1);
});
