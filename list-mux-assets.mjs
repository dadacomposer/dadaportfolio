// Recupera TUTTI gli asset recenti da Mux
// node list-mux-assets.mjs

import Mux from '@mux/mux-node';
import fs from 'fs';

const mux = new Mux({
  tokenId: '468fcb8d-536a-4146-a888-ee1c08ecad44',
  tokenSecret: 'Xup/LRhhX1MHItPawVZLCRcbmhg92j4IUVkEkVCUfMiDWZx93QSMqmLGm0ZTV82mcM5FZHjXeis'
});

async function main() {
  console.log('🔍 Recupero lista asset da Mux...\n');
  const assets = await mux.video.assets.list();
  
  const results = assets.data.map(asset => {
    const playbackId = asset.playback_ids?.[0]?.id;
    return {
      asset_id: asset.id,
      playback_id: playbackId,
      status: asset.status,
      created_at: asset.created_at,
      hls_url: playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null
    };
  });

  console.log(`✅ Trovati ${results.length} asset.`);
  results.forEach(r => console.log(`- ${r.asset_id} | ${r.status} | ${r.playback_id}`));

  fs.writeFileSync('./mux-assets-list.json', JSON.stringify(results, null, 2));
}

main().catch(err => console.error(err));
