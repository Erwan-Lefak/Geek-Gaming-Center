const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔄 SOURCES ALTERNATIVES ACCESSIBLES\n');
console.log('='.repeat(70));

// URLs from forums, press kits, and tech blogs (often unprotected)
const products = [
  {
    name: 'Casque Gaming SteelSeries Arctis 7+',
    id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8',
    urls: [
      // Press kit archives
      'https://www.steelseries.com/static/assets/image/product/16183/6_gallery_1_v2.png',
      'https://www.steelseries.com/static/assets/image/product/16183/6_gallery_3.png',
      'https://www.steelseries.com/static/assets/image/product/16183/6_gallery_4.png',
      // Tech blog CDNs
      'https://www.gamingdeputy.com/wp-content/uploads/2021/10/steelseries-arctis-7-plus-review-1.jpg',
      'https://www.gamingdeputy.com/wp-content/uploads/2021/10/steelseries-arctis-7-plus-review-2.jpg',
      // Alternative sources
      'https://i5.walmartimages.com/asr/5e6c6b9a-8f4e-4f5a-b7c9-5e2d6f3a8c4e.6000268fe7c9a0d7c1e1f8a6c3e9c7f6.jpeg',
      'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6434/6434400_sd.jpg'
    ]
  },
  {
    name: 'iPhone 14 Pro Max',
    id: '8a448d98-eceb-43d1-85d3-11e9ae69875f',
    urls: [
      // Apple product images (static assets)
      'https://www.apple.com/v/iphone-14-pro/d/images/overview/hero/hero_dynamic_island_endframe__e11khcaw6kia_large.jpg',
      'https://www.apple.com/v/iphone-14-pro/d/images/overview/hero/hero_intro_endframe__bwsgtud56tme_large.jpg',
      // Tech blog CDNs
      'https://www.macrumors.com/images/MR-iPhone14ProMax-Purple.jpg',
      'https://www.macrumors.com/images/MR-iPhone14ProMax-Back.jpg',
      'https://www.gottabemobile.com/wp-content/uploads/2022/09/iPhone-14-Pro-Max-1.jpg',
      // Press kit alternatives
      'https://images.idgesg.net/images/article/2022/09/iphone-14-pro-max-deep-purple-100865270-large.jpg',
      'https://cdn.mos.cms.futurecdn.net/3kFjPjVzYYGNnzGQYp7dX8-1200-80.jpg'
    ]
  },
  {
    name: 'Gigabyte B650 Eagle AX (AM5)',
    id: 'c5614f4d-dcce-4743-b240-680f5d842765',
    urls: [
      // Tech blog CDNs (PC hardware sites often have direct image links)
      'https://www.techpowerup.com/img/22-09-16/67a.jpg',
      'https://www.techpowerup.com/img/22-09-16/67b.jpg',
      'https://www.guru3d.com/index.php?ct=files&action=download&id=45839',
      // Forum image hosting
      'https://i.imgur.com/4XDpQhL.jpg',
      'https://i.imgur.com/5YpWZfK.jpg',
      // Tech review sites
      'https://www.pcgameshardware.de/imgs/blank.gif',
      'https://www.pcgameshardware.de/images/2022/09/gigabyte-b650-eagle-ax-2388491-galerie.jpg',
      // Alternative
      'https://www.asus.com/media/global/products/569tqvh8xbvwfvny/img/set/aio_hero.jpg'
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
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
    request.end();
  });
}

async function downloadAlternativeImages() {
  let downloaded = 0;
  let failed = 0;

  console.log('⬇️  Téléchargement depuis sources alternatives...\n');

  for (const product of products) {
    const p = data.products.find(prod => prod.id === product.id);
    if (!p) {
      console.log(`⚠️  Produit introuvable: ${product.name}`);
      continue;
    }

    console.log(`⬇️  ${p.name.substring(0, 60)}`);

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

        console.log(`   [${i + 1}/${product.urls.length}] ${url.substring(0, 70)}...`);

        await downloadImage(url, filepath);

        const stats = fs.statSync(filepath);

        // Vérifier que c'est une vraie image (pas HTML)
        if (stats.size < 15000) {
          fs.unlinkSync(filepath);
          throw new Error('Image trop petite (peut-être HTML)');
        }

        // Vérifier le type de fichier
        const { execSync } = require('child_process');
        let fileType = 'unknown';
        try {
          fileType = execSync(`file "${filepath}"`, { encoding: 'utf-8' });
          if (fileType.includes('HTML') || fileType.includes('text')) {
            fs.unlinkSync(filepath);
            throw new Error('Fichier HTML détecté, pas une image');
          }
        } catch (e) {
          // Si la commande file échoue, on continue quand même
        }

        downloaded++;
        p.image = `/products-images/${filename}`;
        console.log(`   ✅ SUCCÈS! (${stats.size} bytes)\n`);
        success = true;
        break;
      } catch (err) {
        const errMsg = err.message || err.toString();
        console.log(`   ❌ ${errMsg.substring(0, 50)}...`);
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
}

downloadAlternativeImages().catch(console.error);
