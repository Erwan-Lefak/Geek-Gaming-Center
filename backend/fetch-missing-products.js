const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🎯 TÉLÉCHARGEMENT CIBLÉ DES PRODUITS MANQUANTS\n');
console.log('='.repeat(70));

// Images spécifiques pour les produits restants
const specificImages = {
  'e9e6628f-4f82-403f-8734-be0b3b42bc72': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c3967?w=800', // Souris Logitech G Pro
  'f98cd7ed-5ce3-4737-be19-6057d4e428e8': 'https://images.unsplash.com/photo-1599319234526-3e5468672bd0?w=800', // Casque SteelSeries
  '8a448d98-eceb-43d1-85d3-11e9ae69875f': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=800'  // iPhone 14 Pro Max
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

  const updatedProducts = data.products.map(async (product) => {
    const imageUrl = specificImages[product.id];

    if (!imageUrl || (product.image && product.image !== 'N/A')) {
      return product;
    }

    const filename = `${product.id}.jpg`;
    const filepath = path.join(imagesDir, filename);
    const localPath = `/products-images/${filename}`;

    console.log(`⬇️  ${product.name}`);

    try {
      await downloadImage(imageUrl, filepath);

      // Vérifier la taille
      const stats = fs.statSync(filepath);
      if (stats.size < 10000) {
        fs.unlinkSync(filepath);
        throw new Error('Image trop petite');
      }

      downloaded++;
      console.log(`   ✅ Téléchargée (${stats.size} bytes)\n`);
      return { ...product, image: localPath };
    } catch (err) {
      failed++;
      console.log(`   ❌ Erreur: ${err.message}\n`);
      return product;
    }
  });

  // Attendre tous les téléchargements
  const results = await Promise.all(updatedProducts);

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: results }, null, 2));

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
    const product = results.find(prod => prod.id === p.id);
    if (product) {
      const hasImage = product.image && product.image !== 'N/A';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name}`);
    }
  });

  const withImages = results.filter(p => p.image && p.image !== 'N/A').length;
  console.log(`\n📊 Total produits avec images: ${withImages}/${results.length}`);
}

downloadSpecificImages().catch(console.error);
