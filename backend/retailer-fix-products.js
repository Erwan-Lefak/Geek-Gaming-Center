const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🏪 SOURCES RETAILERS ET CDN\n');
console.log('='.repeat(70));

// Retailer product images (often cached on public CDNs)
const products = [
  {
    name: 'iPhone 14 Pro Max',
    id: '8a448d98-eceb-43d1-85d3-11e9ae69875f',
    urls: [
      // Apple CDN - public product images
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=5120',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-gold?wid=5120',
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-silver?wid=5120',
      // Walmart CDN
      'https://i5.walmartimages.com/asr/d52c5f5a-8f4e-4f5a-b7c9-5e2d6f3a8c4e.5000268fe7c9a0d7c1e1f8a6c3e9c7f6.jpeg',
      'https://i5.walmartimages.com/asr/8f2a6e9d-6b5a-4c3d-9e8f-7a2b4c5d6e7f.8000x8000.jpeg',
      // Best Buy CDN
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6498/6498542_sd.jpg',
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6498/6498542ld.jpg',
      // B&H Photo
      'https://assets.bhphotovideo.com/images/item_images/1799360.jpg',
      // Target CDN
      'https://target.scene7.com/is/image/Target/GUEST_ff2c8c6e-5a5a-4a5c-8a5c-5a5c5a5c5a5c'
    ]
  },
  {
    name: 'Gigabyte B650 Eagle AX (AM5)',
    id: 'c5614f4d-dcce-4743-b240-680f5d842765',
    urls: [
      // Newegg CDN
      'https://c1.neweggimages.com/ProductImageCompressAll1280/13-131-133-01.jpg',
      'https://c1.neweggimages.com/ProductImageCompressAll1280/13-131-133-02.jpg',
      'https://c1.neweggimages.com/ProductImageCompressAll1280/13-131-133-03.jpg',
      'https://c1.neweggimages.com/ProductImageCompressAll1280/13-131-133-04.jpg',
      'https://c1.neweggimages.com/ProductImageCompressAll1280/13-131-133-05.jpg',
      // Amazon CDN
      'https://images-na.ssl-images-amazon.com/images/I/81WfEYI7MnL._AC_SL1500_.jpg',
      'https://images-na.ssl-images-amazon.com/images/I/71GvkKTObAL._AC_SL1500_.jpg',
      // Best Buy CDN
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6526/6526600_sd.jpg',
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6526/6526600ld.jpg',
      // Alternate retailer
      'https://www.microcenter.com/endeca/zoom/images/500/68/6507966_large.jpg',
      // Direct CDN
      'https://dlcdnweb.asus.com/ga/MB/images/products/1/xl/P1.jpg'
    ]
  }
];

const imagesDir = path.join(__dirname, '../public/products-images');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    // Pour les URLs HTTP, utiliser https
    const protocol = urlObj.protocol === 'http:' ? https : https;

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };

    const request = protocol.request(options, (response) => {
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
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
        } else {
          reject(new Error(`No redirect location for status ${response.statusCode}`));
        }
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
    request.end();
  });
}

async function downloadRetailerImages() {
  let downloaded = 0;
  let failed = 0;

  console.log('⬇️  Téléchargement depuis retailers...\n');

  for (const product of products) {
    const p = data.products.find(prod => prod.id === product.id);
    if (!p) {
      console.log(`⚠️  Produit introuvable: ${product.name}`);
      continue;
    }

    console.log(`⬇️  ${p.name.substring(0, 65)}`);

    let success = false;
    for (let i = 0; i < product.urls.length; i++) {
      const url = product.urls[i];
      try {
        const extension = url.endsWith('.png') ? '.png' : '.jpg';
        const filename = `${p.id}${extension}`;
        const filepath = path.join(imagesDir, filename);

        // Supprimer l'ancienne image
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }

        console.log(`   [${i + 1}/${product.urls.length}] ${url.substring(0, 75)}...`);

        await downloadImage(url, filepath);

        const stats = fs.statSync(filepath);

        // Vérifier la taille minimale
        if (stats.size < 20000) {
          fs.unlinkSync(filepath);
          throw new Error('Image trop petite');
        }

        downloaded++;
        p.image = `/products-images/${filename}`;
        console.log(`   ✅ SUCCÈS! (${stats.size} bytes)\n`);
        success = true;
        break;
      } catch (err) {
        const errMsg = err.message || err.toString();
        console.log(`   ❌ ${errMsg.substring(0, 55)}...`);
      }
    }

    if (!success) {
      failed++;
      console.log(`   ❌ Échec après ${product.urls.length} tentatives\n`);
    }
  }

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('='.repeat(70));
  console.log(`\n✅ Terminé!`);
  console.log(`   Téléchargées: ${downloaded}`);
  console.log(`   Échouées: ${failed}`);
  console.log(`\n💾 Fichier products.json sauvegardé`);

  // Vérification finale des 3 produits
  console.log(`\n📋 Vérification des 3 produits:\n`);
  const targetProducts = [
    'f98cd7ed-5ce3-4737-be19-6057d4e428e8',
    '8a448d98-eceb-43d1-85d3-11e9ae69875f',
    'c5614f4d-dcce-4743-b240-680f5d842765'
  ];

  targetProducts.forEach(id => {
    const p = data.products.find(prod => prod.id === id);
    if (p) {
      const hasImage = p.image && p.image !== 'N/A' && typeof p.image === 'string';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name.substring(0, 55)}`);
      if (hasImage) {
        console.log(`   ${p.image}`);
      }
    }
  });
}

downloadRetailerImages().catch(console.error);
