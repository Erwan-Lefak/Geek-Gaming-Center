const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🎯 TÉLÉCHARGEMENT DIRECT DES IMAGES\n');
console.log('='.repeat(70));

// Images directes (URLs testées et fonctionnelles)
const specificImages = {
  'e9e6628f-4f82-403f-8734-be0b3b42bc72': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', // Souris gaming
  'f98cd7ed-5ce3-4737-be19-6057d4e428e8': 'https://images.unsplash.com/photo-1599319234526-3e5468672bd0?w=400', // Casque gaming
  '8a448d98-eceb-43d1-85d3-11e9ae69875f': 'https://images.unsplash.com/photo-1592899677712-a3aecd9f11f2?w=400'  // iPhone
};

const imagesDir = path.join(__dirname, '../public/products-images');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function downloadSpecificImages() {
  let downloaded = 0;
  let failed = 0;

  for (const [productId, imageUrl] of Object.entries(specificImages)) {
    const product = data.products.find(p => p.id === productId);
    if (!product) continue;

    const filename = `${productId}.jpg`;
    const filepath = path.join(imagesDir, filename);
    const localPath = `/products-images/${filename}`;

    console.log(`⬇️  ${product.name.substring(0, 50)}`);

    try {
      await downloadImage(imageUrl, filepath);

      const stats = fs.statSync(filepath);
      if (stats.size < 10000) {
        fs.unlinkSync(filepath);
        throw new Error('Image trop petite');
      }

      downloaded++;
      product.image = localPath;
      console.log(`   ✅ Téléchargée (${stats.size} bytes)\n`);
    } catch (err) {
      failed++;
      console.log(`   ❌ Erreur: ${err.message}\n`);
    }
  }

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('='.repeat(70));
  console.log(`\n✅ Terminé!`);
  console.log(`   Téléchargées: ${downloaded}`);
  console.log(`   Échouées: ${failed}`);

  // Vérifier
  const products = [
    { id: 'e9e6628f-4f82-403f-8734-be0b3b42bc72', name: 'Souris Gaming Logitech G Pro X Superlight' },
    { id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8', name: 'Casque Gaming SteelSeries Arctis 7+' },
    { id: '8a448d98-eceb-43d1-85d3-11e9ae69875f', name: 'iPhone 14 Pro Max' }
  ];

  console.log(`\n📋 Vérification finale:\n`);
  products.forEach(p => {
    const product = data.products.find(prod => prod.id === p.id);
    if (product) {
      const hasImage = product.image && product.image !== 'N/A';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name}`);
    }
  });

  const withImages = data.products.filter(p => p.image && p.image !== 'N/A').length;
  console.log(`\n📊 Total produits avec images: ${withImages}/${data.products.length}`);
}

downloadSpecificImages().catch(console.error);
