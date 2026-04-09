const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🎯 TENTATIVE FINALE - IMAGES CORRECTES\n');
console.log('='.repeat(70));

// Sources multiples pour chaque produit
const products = [
  {
    name: 'Casque Gaming SteelSeries Arctis 7+',
    id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8',
    urls: [
      // Manufacturer CDN (often unprotected)
      'https://steelseriescdn.azureedge.net/images/products/16183/1a99f7f44ab342e496414f2164060b1a.800x800.jpg',
      'https://steelseriescdn.azureedge.net/images/products/16183/5954ac59-23e0-44f1-a0a8-4092cf2f5d79.png',
      // Tech review sites
      'https://cdn.mos.cms.futurecdn.net/FJkXbEhuheJgAWh6AaQ47W-1200-80.jpg',
      'https://r.jina.ai/http://www.steelseries.com/gaming-headsets/arctis-7-plus',
      // Alternative direct URLs
      'https://images-na.ssl-images-amazon.com/images/I/61LMP5BrYLL._AC_SL1500_.jpg',
      'https://media.steelseriescdn.com/thumbnails/catalog/products/16183/a7e9cb5a0d7a462b9cbffb8c6ebd9f69.1000x1000.png'
    ]
  },
  {
    name: 'iPhone 14 Pro Max',
    id: '8a448d98-eceb-43d1-85d3-11e9ae69875f',
    urls: [
      // Apple press kit
      'https://www.apple.com/v/iphone-14-pro/c/images/overview/hero/hero_intro_endframe__bwsgtud56tme_large.jpg',
      'https://www.apple.com/v/iphone-14-pro/c/images/overview/design/design_finish_deep_purple__bax4yv75cg6q_large.jpg',
      'https://www.apple.com/pr/images/iphone-14-pro/iphone-14-pro-finishes-220907.jpg',
      // Tech review sites
      'https://cdn.mos.cms.futurecdn.net/dPQV48NnV2Pq6hqcNhuPE4-1200-80.jpg',
      'https://r.jina.ai/http://www.apple.com/iphone-14-pro/',
      // Retailer CDN
      'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=400'
    ]
  },
  {
    name: 'Gigabyte B650 Eagle AX (AM5)',
    id: 'c5614f4d-dcce-4743-b240-680f5d842765',
    urls: [
      // Manufacturer CDN
      'https://www.gigabyte.com/Content/Upload/Global/Product/800/B650%20EAGLE%20AX-1598667646883.jpg',
      'https://www.gigabyte.com/Content/Upload/Global/Product/1000/B650%20EAGLE%20AX-1598667646883.jpg',
      // Tech review sites
      'https://cdn.mos.cms.futurecdn.net/tRwRJ6hTQQv7TCFuCrRP5a-1200-80.jpg',
      'https://images.idgesg.net/images/article/2022/09/gigabyte-b650-eagle-ax-100865267-large.jpg',
      // Press kit
      'https://r.jina.ai/http://www.gigabyte.com/Motherboard/B650-EAGLE-AX-rev-1x',
      // Retailer images
      'https://media.newegg.com/products/20-131-133/20-131-133-01.jpg'
    ]
  }
];

const imagesDir = path.join(__dirname, '../public/products-images');

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': urlObj.origin
      }
    };

    const request = https.request(options, (response) => {
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
    });

    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
    request.end();
  });
}

async function downloadFinalImages() {
  let downloaded = 0;
  let failed = 0;

  console.log('⬇️  Téléchargement des images finales...\n');

  for (const product of products) {
    const p = data.products.find(prod => prod.id === product.id);
    if (!p) {
      console.log(`⚠️  Produit introuvable: ${product.name}`);
      continue;
    }

    console.log(`⬇️  ${p.name.substring(0, 60)}`);
    console.log(`   ID: ${p.id}`);

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

        console.log(`   Tentative ${i + 1}/${product.urls.length}: ${url.substring(0, 70)}...`);

        await downloadImage(url, filepath);

        const stats = fs.statSync(filepath);
        if (stats.size < 10000) {
          fs.unlinkSync(filepath);
          throw new Error('Image trop petite');
        }

        downloaded++;
        p.image = `/products-images/${filename}`;
        console.log(`   ✅ Téléchargée (${stats.size} bytes)\n`);
        success = true;
        break;
      } catch (err) {
        const errMsg = err.message || err.toString();
        console.log(`   ❌ ${errMsg.substring(0, 60)}...`);
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

  // Vérification
  console.log(`\n📋 Vérification:\n`);
  products.forEach(prod => {
    const p = data.products.find(product => product.id === prod.id);
    if (p) {
      const hasImage = p.image && p.image !== 'N/A' && typeof p.image === 'string';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name.substring(0, 55)}`);
      if (hasImage) {
        console.log(`   Image: ${p.image}`);
      }
    }
  });

  console.log(`\n📊 Total produits avec images: ${data.products.filter(p => p.image && p.image !== 'N/A').length}/${data.products.length}`);
}

downloadFinalImages().catch(console.error);
