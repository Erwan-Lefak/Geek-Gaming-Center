const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔧 CORRECTION DES IMAGES PRODUITS\n');
console.log('='.repeat(70));

// Correspondances précises avec de vraies images
const correctImages = {
  'f98cd7ed-5ce3-4737-be19-6057d4e428e8': 'https://images.unsplash.com/photo-1599319234526-3e5468672bd0?w=800', // Casque SteelSeries Arctis
  '8a448d98-eceb-43d1-85d3-11e9ae69875f': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=800', // iPhone 14 Pro Max
  '93f479b3-ef65-4d03-a191-f8bb44715332': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=800', // Intel Core i7
  'c5614f4d-dcce-4743-b240-680f5d842765': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', // Carte mère AM5
  'd3987ca1-aea1-4835-8a24-b0b1efae0217': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', // Routeur TP-Link
  '5492e8ec-f9f3-4c29-bdbb-4d4698377219': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'  // PS4 ( utiliser image PS5)
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

async function fixImages() {
  let downloaded = 0;
  let failed = 0;

  console.log('⬇️  Téléchargement des nouvelles images...\n');

  for (const [productId, imageUrl] of Object.entries(correctImages)) {
    const product = data.products.find(p => p.id === productId);
    if (!product) {
      console.log(`⚠️  Produit introuvable: ${productId}`);
      continue;
    }

    const filename = `${productId}.jpg`;
    const filepath = path.join(imagesDir, filename);
    const localPath = `/products-images/${filename}`;

    console.log(`⬇️  ${product.name.substring(0, 55)}`);

    try {
      // Supprimer l'ancienne image si elle existe
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

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

  // Corriger aussi les produits avec "true" comme image
  data.products.forEach(p => {
    if (p.image === true || (typeof p.image === 'boolean' && p.image === true)) {
      p.image = 'N/A';
      console.log(`🔧 Corrigé: ${p.name.substring(0, 50)} (image: true → N/A)`);
    }
  });

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ Terminé!`);
  console.log(`   Téléchargées: ${downloaded}`);
  console.log(`   Échouées: ${failed}`);
  console.log(`\n💾 Fichier sauvegardé`);

  // Vérification
  const products = [
    'Casque Gaming SteelSeries Arctis 7+',
    'iPhone 14 Pro Max',
    'Intel Core i7-14700KF (5,6 GHz)',
    'Gigabyte B650 Eagle AX',
    'TP-Link Deco E4',
    'PS4'
  ];

  console.log(`\n📋 Vérification:\n`);
  products.forEach(name => {
    const p = data.products.find(prod => prod.name.includes(name));
    if (p) {
      const hasImage = p.image && p.image !== 'N/A' && typeof p.image === 'string';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name.substring(0, 50)}`);
    }
  });

  const withImages = data.products.filter(p => p.image && p.image !== 'N/A').length;
  console.log(`\n📊 Total produits avec images: ${withImages}/${data.products.length}`);
}

fixImages().catch(console.error);
