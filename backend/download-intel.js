const fs = require('fs');
const https = require('https');
const path = require('path');

const data = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

async function downloadIntel() {
  const product = data.products.find(p => p.name.includes('Intel Core i7-14700KF'));

  if (!product) {
    console.log('❌ Produit non trouvé');
    return;
  }

  console.log('⬇️  Intel Core i7-14700KF (5,6 GHz) LGA 1700');

  const urls = [
    'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=800',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
    'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=800'
  ];

  const imagesDir = path.join(__dirname, '../public/products-images');

  for (const url of urls) {
    try {
      const filepath = path.join(imagesDir, `${product.id}.jpg`);

      await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
              file.close();
              const stats = fs.statSync(filepath);
              if (stats.size > 10000) {
                product.image = `/products-images/${product.id}.jpg`;
                console.log(`   ✅ Téléchargée (${stats.size} bytes)`);
                resolve(true);
              } else {
                fs.unlinkSync(filepath);
                reject('Trop petite');
              }
            });
          } else {
            reject(`Status ${res.statusCode}`);
          }
        }).on('error', reject);
      });

      console.log('   ✅ Image sauvegardée!');
      break;
    } catch (err) {
      console.log(`   ❌ ${err}`);
    }
  }

  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));
  console.log('\n💾 Sauvegardé!');
  console.log(`\n✅ Intel Core i7-14700KF: ${product.image !== 'N/A' ? 'OK' : 'N/A'}`);
}

downloadIntel().catch(console.error);
