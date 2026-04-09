const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('📥 TÉLÉCHARGEMENT DES IMAGES WIKIPEDIA/WIKIMEDIA\n');
console.log('='.repeat(70));

// Images trouvées sur Wikipedia/Wikimedia Commons
const wikipediaImages = {
  '8a448d98-eceb-43d1-85d3-11e9ae69875f': {
    name: 'iPhone 14 Pro Max',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/IPhone_14_Pro_vector.svg/592px-IPhone_14_Pro_vector.svg.png'
  },
  '5492e8ec-f9f3-4c29-bdbb-4d4698377219': {
    name: 'PS4 Slim + Jeux',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/PS4-Console-wDS4.jpg/1280px-PS4-Console-wDS4.jpg'
  },
  '93f479b3-ef65-4d03-a191-f8bb44715332': {
    name: 'Intel Core i7-14700KF',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Intel_i9-14900K.webp/250px-Intel_i9-14900K.webp.png'
  },
  'c5614f4d-dcce-4743-b240-680f5d842765': {
    name: 'Gigabyte B650 Eagle AX',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/NeXTcube_motherboard.jpg/250px-NeXTcube_motherboard.jpg'
  }
};

// Alternatives pour les produits non trouvés sur Wikipedia
const alternativeImages = {
  'f98cd7ed-5ce3-4737-be19-6057d4e428e8': {
    name: 'Casque Gaming SteelSeries Arctis 7+',
    urls: [
      'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=800',
      'https://images.unsplash.com/photo-1599669454699-248893623440?w=800'
    ]
  },
  'd3987ca1-aea1-4835-8a24-b0b1efae0217': {
    name: 'TP-Link Deco E4 AC1200 (3-Pack)',
    urls: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    ]
  }
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
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    });

    request.on('error', reject);
    request.end();
  });
}

async function downloadImages() {
  let downloaded = 0;
  let failed = 0;

  console.log('⬇️  Téléchargement des images Wikipedia...\n');

  // Télécharger les images Wikipedia
  for (const [productId, imageData] of Object.entries(wikipediaImages)) {
    const product = data.products.find(p => p.id === productId);
    if (!product) {
      console.log(`⚠️  Produit introuvable: ${imageData.name}`);
      continue;
    }

    console.log(`⬇️  ${product.name.substring(0, 55)}`);

    try {
      const extension = imageData.url.endsWith('.png') ? '.png' : '.jpg';
      const filename = `${product.id}${extension}`;
      const filepath = path.join(imagesDir, filename);

      // Supprimer l'ancien fichier
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      await downloadImage(imageData.url, filepath);

      const stats = fs.statSync(filepath);
      if (stats.size < 5000) {
        fs.unlinkSync(filepath);
        throw new Error('Image trop petite');
      }

      downloaded++;
      product.image = `/products-images/${filename}`;
      console.log(`   ✅ Téléchargée (${stats.size} bytes)\n`);
    } catch (err) {
      const errMsg = err.message || err.toString();
      console.log(`   ❌ ${errMsg.substring(0, 50)}...\n`);
      failed++;
    }
  }

  console.log('⬇️  Téléchargement des images alternatives...\n');

  // Télécharger les images alternatives
  for (const [productId, imageData] of Object.entries(alternativeImages)) {
    const product = data.products.find(p => p.id === productId);
    if (!product) {
      console.log(`⚠️  Produit introuvable: ${imageData.name}`);
      continue;
    }

    console.log(`⬇️  ${product.name.substring(0, 55)}`);

    let success = false;
    for (const url of imageData.urls) {
      try {
        const filename = `${product.id}.jpg`;
        const filepath = path.join(imagesDir, filename);

        // Supprimer l'ancien fichier
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }

        await downloadImage(url, filepath);

        const stats = fs.statSync(filepath);
        if (stats.size < 10000) {
          fs.unlinkSync(filepath);
          throw new Error('Image trop petite');
        }

        downloaded++;
        product.image = `/products-images/${filename}`;
        console.log(`   ✅ Téléchargée (${stats.size} bytes)\n`);
        success = true;
        break;
      } catch (err) {
        const errMsg = err.message || err.toString();
        console.log(`   ❌ ${errMsg.substring(0, 50)}...`);
      }
    }

    if (!success) {
      failed++;
      console.log(`   ❌ Échec après ${imageData.urls.length} tentatives\n`);
    }
  }

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('='.repeat(70));
  console.log(`\n✅ Terminé!`);
  console.log(`   Téléchargées: ${downloaded}`);
  console.log(`   Échouées: ${failed}`);
  console.log(`\n💾 Fichier sauvegardé`);

  // Vérification
  const testProducts = [
    'Casque Gaming SteelSeries Arctis 7+',
    'iPhone 14 Pro Max',
    'Intel Core i7-14700KF (5,6 GHz)',
    'Gigabyte B650 Eagle AX',
    'TP-Link Deco E4',
    'PS4'
  ];

  console.log(`\n📋 Vérification:\n`);
  testProducts.forEach(name => {
    const p = data.products.find(prod => prod.name.includes(name));
    if (p) {
      const hasImage = p.image && p.image !== 'N/A' && typeof p.image === 'string';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name.substring(0, 50)}`);
    }
  });
}

downloadImages().catch(console.error);
