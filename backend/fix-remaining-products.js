const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔧 CORRECTION DES 3 DERNIERS PRODUITS\n');
console.log('='.repeat(70));

// Trouver les IDs
const products = [
  { name: 'Casque Gaming SteelSeries Arctis 7+', urls: [
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'
  ]},
  { name: 'iPhone 14 Pro Max', urls: [
    'https://images.unsplash.com/photo-1592899677712-a3aecd9f11f2?w=800',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
    'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=800'
  ]},
  { name: 'Intel Core i7-14700KF', urls: [
    'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=800',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
    'https://images.unsplash.com/photo-1555663245-8c06-2c1e6c60b7e?w=800'
  ]}
];

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

async function fixRemaining() {
  let downloaded = 0;

  for (const product of products) {
    const p = data.products.find(prod => prod.name === product.name);
    if (!p) continue;

    console.log(`\n⬇️  ${p.name}`);

    for (const url of product.urls) {
      try {
        const filename = `${p.id}.jpg`;
        const filepath = path.join(imagesDir, filename);

        // Supprimer l'ancien fichier
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }

        await downloadImage(url, filepath);

        const stats = fs.statSync(filepath);
        if (stats.size < 10000) {
          fs.unlinkSync(filepath);
          throw new Error('Trop petite');
        }

        downloaded++;
        p.image = `/products-images/${filename}`;
        console.log(`   ✅ Téléchargée (${stats.size} bytes)`);
        break;
      } catch (err) {
        const errMsg = err.message || err.toString();
        console.log(`   ❌ ${errMsg.substring(0, 50)}...`);
      }
    }
  }

  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ Terminé! ${downloaded} produits téléchargés`);
  console.log(`\n💾 Fichier sauvegardé`);

  // Vérification finale
  const testProducts = [
    'Casque Gaming SteelSeries Arctis 7+',
    'iPhone 14 Pro Max',
    'Intel Core i7-14700KF'
  ];

  console.log(`\n📋 Vérification finale:\n`);
  testProducts.forEach(name => {
    const p = data.products.find(prod => prod.name === name);
    if (p) {
      const hasImage = p.image && p.image !== 'N/A' && typeof p.image === 'string';
      console.log(`${hasImage ? '✅' : '❌'} ${name}`);
    }
  });
}

fixRemaining().catch(console.error);
