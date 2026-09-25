const fs = require('fs');
const path = require('path');

const client = null;

const artifactDir = '/Users/dada/.gemini/antigravity/brain/4c7ae52e-9909-4c87-ac2f-2f762450fed8';

const imageMap = [
  { project: 'MARTINLEE', file: 'media__1778464257176.png' },
  { project: 'THEMARKETEXIT', file: 'media__1778464257218.png' },
  { project: 'MORAL AMBITION', file: 'media__1778464257321.png' }
];

async function updateWithRealImages() {
  console.log('Uploading real project images to Sanity...');
  
  const projects = await client.fetch(`*[_type == "project"]{_id, title}`);

  for (const item of imageMap) {
    try {
      const filePath = path.join(artifactDir, item.file);
      const match = projects.find(p => p.title.toUpperCase().includes(item.project));
      
      if (match) {
        console.log(`Uploading real image for ${match.title}...`);
        const asset = await client.assets.upload('image', fs.createReadStream(filePath));
        
        await client.patch(match._id)
          .set({
            coverImage: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id
              }
            }
          })
          .commit();
        console.log(`✓ ${match.title} updated with real image.`);
      }
    } catch (err) {
      console.error(`✗ Error updating ${item.project}:`, err.message);
    }
  }
}

updateWithRealImages();
