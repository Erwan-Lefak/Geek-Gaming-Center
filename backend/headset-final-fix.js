const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🎧 RECHERCHE SOURCES CASQUE GAMING\n');
console.log('='.repeat(70));

// SteelSeries Arctis 7+ Gaming Headset
const headset = {
  name: 'Casque Gaming SteelSeries Arctis 7+',
  id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8',
  urls: [
    // Direct manufacturer product images
    'https://steelseries.com/static/assets/image/product/16183/6_gallery_1_v2.png',
    'https://steelseries.com/static/assets/image/product/16183/6_gallery_2.png',
    'https://steelseries.com/static/assets/image/product/16183/6_gallery_3.png',
    // Retailer CDNs
    'https://i5.walmartimages.com/asr/5e6c6b9a-8f4e-4f5a-b7c9-5e2d6f3a8c4e.1__5000268fe7c9a0d7c1e1f8a6c3e9c7f6.jpeg',
    'https://i5.walmartimages.com/asr/5e6c6b9a-8f4e-4f5a-b7c9-5e2d6f3a8c4e.2__5000268fe7c9a0d7c1e1f8a6c3e9c7f6.jpeg',
    // Best Buy
    'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6434/6434400_sd.jpg',
    'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6434/6434400ld.jpg',
    // Amazon
    'https://images-na.ssl-images-amazon.com/images/I/61LMP5BrYLL._AC_SL1500_.jpg',
    'https://images-na.ssl-images-amazon.com/images/I/71KfMn-Zq8L._AC_SL1500_.jpg',
    'https://images-na.ssl-images-amazon.com/images/I/81WfEYI7MnL._AC_SL1500_.jpg',
    // Tech review sites
    'https://www.rtings.com/images/review/testbed/6175a22f505f727a.jpg',
    'https://www.tomsguide.com/static/uploads/variants/1600x900/1665243123535.jpg',
    // Press images
    'https://www.steelseries.com/blog/wp-content/uploads/2021/10/Arctis-7-Plus-hero.jpg',
    'https://www.steelseries.com/blog/wp-content/uploads/2021/10/Arctis-7-Plus-lifestyle.jpg',
    // Other sources
    'https://www.techspot.com/articles-info/2316/images/2021-10-20-image.jpg',
    'https://cdn.mos.cms.futurecdn.net/FJkXbEhuheJgAWh6AaQ47W-1200-80.jpg',
    // Alternative retailer
    'https://assets.newegg.com/27-256-170-01.jpg',
    'https://assets.newegg.com/27-256-170-02.jpg',
    'https://assets.newegg.com/27-256-170-03.jpg'
  ]
};

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
      } else if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
        } else {
          reject(new Error(`No redirect location`));
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

async function downloadHeadset() {
  console.log(`⬇️  ${headset.name}\n`);
  console.log(`   ID: ${headset.id}\n`);

  const p = data.products.find(prod => prod.id === headset.id);
  if (!p) {
    console.log('❌ Produit introuvable dans products.json');
    return;
  }

  let success = false;
  for (let i = 0; i < headset.urls.length; i++) {
    const url = headset.urls[i];
    try {
      const extension = url.endsWith('.png') ? '.png' : '.jpg';
      const filename = `${p.id}${extension}`;
      const filepath = path.join(imagesDir, filename);

      // Supprimer l'ancienne image
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      console.log(`   [${i + 1}/${headset.urls.length}] ${url.substring(0, 75)}...`);

      await downloadImage(url, filepath);

      const stats = fs.statSync(filepath);

      // Vérifier la taille minimale
      if (stats.size < 30000) {
        fs.unlinkSync(filepath);
        throw new Error('Image trop petite (< 30KB)');
      }

      // Vérifier que c'est une image réelle
      const { execSync } = require('child_process');
      try {
        const fileType = execSync(`file "${filepath}"`, { encoding: 'utf-8' });
        if (fileType.includes('HTML') || fileType.includes('text') || fileType.includes('XML')) {
          fs.unlinkSync(filepath);
          throw new Error('Fichier HTML/XML détecté');
        }
      } catch (e) {
        // Si la commande file échoue, on vérifie juste la taille
      }

      p.image = `/products-images/${filename}`;
      console.log(`   ✅ SUCCÈS! (${stats.size} bytes)\n`);

      success = true;
      break;
    } catch (err) {
      const errMsg = err.message || err.toString();
      console.log(`   ❌ ${errMsg.substring(0, 60)}...`);
    }
  }

  if (!success) {
    console.log(`\n   ❌ Échec après ${headset.urls.length} tentatives\n`);
  }

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('='.repeat(70));
  console.log(`\n💾 Fichier products.json sauvegardé`);
  console.log(`\n📊 Image actuelle: ${p.image}`);
}

downloadHeadset().catch(console.error);
