// Recupera Playback ID da Mux
// node get-mux-playback-ids.mjs

import Mux from '@mux/mux-node';
import fs from 'fs';

const mux = new Mux({
  tokenId: '468fcb8d-536a-4146-a888-ee1c08ecad44',
  tokenSecret: 'Xup/LRhhX1MHItPawVZLCRcbmhg92j4IUVkEkVCUfMiDWZx93QSMqmLGm0ZTV82mcM5FZHjXeis'
});

async function main() {
  if (!fs.existsSync('./mux-uploads.json')) {
    console.log('❌ File mux-uploads.json non trovato. L\'upload è terminato?');
    return;
  }

  const uploads = JSON.parse(fs.readFileSync('./mux-uploads.json', 'utf8'));
  console.log(`🔍 Controllo ${uploads.length} asset su Mux...\n`);

  const results = [];

  for (const item of uploads) {
    try {
      // Dobbiamo aspettare che l'asset sia pronto per avere il playback_id
      // Recuperiamo l'asset usando l'asset_id
      const asset = await mux.video.assets.retrieve(item.asset_id);
      
      if (asset.playback_ids && asset.playback_ids.length > 0) {
        const playbackId = asset.playback_ids[0].id;
        console.log(`✅ ${item.filename}: ${playbackId} (Stato: ${asset.status})`);
        results.push({
          filename: item.filename,
          playback_id: playbackId,
          status: asset.status,
          hls_url: `https://stream.mux.com/${playbackId}.m3u8`
        });
      } else {
        console.log(`⏳ ${item.filename}: In elaborazione... (Stato: ${asset.status})`);
        results.push({
          filename: item.filename,
          playback_id: null,
          status: asset.status
        });
      }
    } catch (err) {
      console.error(`❌ Errore per ${item.filename}: ${err.message}`);
    }
  }

  fs.writeFileSync('./mux-final-ids.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Risultati salvati in mux-final-ids.json');
}

main().catch(err => console.error(err));
