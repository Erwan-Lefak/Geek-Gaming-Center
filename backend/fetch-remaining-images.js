const fs = require('fs');
const https = require('https');
const path = require('path');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

const remaining = [
  { id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8', urls: [
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
    'https://images.unsplash.com/photo-1599319234526-3e5468672bd0?w=400'
  ]},
  { id: '8a448d98-eceb-43d1-85d3-11e9ae69875f', urls: [
    'https://images.unsplash.com/photo-1592899677712-a3aecd9f11f2?w=400',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
    'https://images.unsplash.com/photo-1610736255105-63f8f9f1a3be?w=400'
  ]}
];

const imagesDir = path.join(__dirname, '../public/products-images');

async function tryDownload(productId, urls) {
  for (const url of urls) {
    try {
      console.log(`   Trying: ${url.substring(40, 70)}...`);
      await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode === 200) {
            const filepath = path.join(imagesDir, `${productId}.jpg`);
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
              file.close();
              const stats = fs.statSync(filepath);
              if (stats.size > 10000) {
                resolve(path.join('/products-images', `${productId}.jpg`));
              } else {
                fs.unlinkSync(filepath);
                reject('Too small');
              }
            });
          } else {
            reject(`Status ${res.statusCode}`);
          }
        }).on('error', reject);
      });
      console.log(`   ✅ Success!`);
      return true;
    } catch (err) {
      console.log(`   ❌ ${err}`);
    }
  }
  return false;
}

async function main() {
  console.log('🎯 TÉLÉCHARGEMENT DES PRODUITS RESTANTS\n\n');

  for (const product of remaining) {
    const p = data.products.find(prod => prod.id === product.id);
    if (!p) continue;

    console.log(`⬇️  ${p.name}`);

    const imagePath = await tryDownload(product.id, product.urls);

    if (imagePath) {
      p.image = imagePath;
      console.log(`   ✅ Image saved!\n`);
    } else {
      console.log(`   ❌ All URLs failed\n`);
    }
  }

  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('💾 Saved!');

  // Vérification
  const products = [
    { id: 'e9e6628f-4f82-403f-8734-be0b3b42bc72', name: 'Souris Gaming Logitech G Pro X Superlight' },
    { id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8', name: 'Casque Gaming SteelSeries Arctis 7+' },
    { id: '8a448d98-eceb-43d1-85d3-11e9ae69875f', name: 'iPhone 14 Pro Max' }
  ];

  console.log('\n📋 Verification:\n');
  products.forEach(p => {
    const prod = data.products.find(pr => pr.id === p.id);
    if (prod) {
      const hasImage = prod.image && prod.image !== 'N/A';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name}`);
    }
  });

  const withImages = data.products.filter(p => p.image && p.image !== 'N/A').length;
  console.log(`\n📊 Total: ${withImages}/${data.products.length}`);
}

main().catch(console.error);
