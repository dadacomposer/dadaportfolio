// Upload VIDEO su MUX
// node upload-to-mux.mjs

import Mux from '@mux/mux-node';
import { readdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

const VIDEO_DIR = '/Users/dada/Downloads/VIDEOSPORTFOLIO';

const mux = new Mux({
  tokenId: '468fcb8d-536a-4146-a888-ee1c08ecad44',
  tokenSecret: 'Xup/LRhhX1MHItPawVZLCRcbmhg92j4IUVkEkVCUfMiDWZx93QSMqmLGm0ZTV82mcM5FZHjXeis'
});

async function main() {
  const files = (await readdir(VIDEO_DIR)).filter(f => f.endsWith('.mp4'));
  console.log(`🎬 Caricamento di ${files.length} video su Mux...\n`);

  const results = [];

  for (const file of files) {
    const filePath = path.join(VIDEO_DIR, file);

    try {
      process.stdout.write(`⏳ Creazione upload per "${file}"...`);
      
      // Crea un upload diretto (Direct Upload)
      const upload = await mux.video.uploads.create({
        new_asset_settings: { 
          playback_policy: ['public']
        },
        cors_origin: '*', // permette upload dal browser se servisse
      });

      console.log(` ✅ URL creato.`);
      console.log(`🚀 Caricamento file (questo richiederà tempo per i file grandi)...`);

      // Carichiamo il file tramite l'URL di upload fornito da Mux
      const stats = fs.statSync(filePath);
      const fileStream = fs.createReadStream(filePath);
      
      const response = await fetch(upload.url, {
        method: 'PUT',
        body: fileStream,
        headers: {
          'Content-Length': stats.size,
        },
        duplex: 'half' // necessario per node fetch con stream
      });

      if (response.ok) {
        console.log(`✅ Caricamento "${file}" completato!`);
        results.push({ 
          filename: file, 
          upload_id: upload.id,
          asset_id: upload.asset_id 
        });
      } else {
        console.error(`❌ Errore durante il caricamento: ${response.statusText}`);
      }

    } catch (err) {
      console.error(`❌ Errore: ${err.message}`);
    }
  }

  fs.writeFileSync('./mux-uploads.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Dati salvati in mux-uploads.json. Ora Mux elaborerà i video.');
  console.log('Attendi qualche minuto e poi controlleremo i Playback ID.');
}

main().catch(err => {
  console.error('Errore fatale:', err.message);
});
