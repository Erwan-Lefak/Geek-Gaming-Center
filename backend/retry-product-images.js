const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔧 NOUVEAUX TÉLÉCHARGEMENTS - IMAGES CORRECTES\n');
console.log('='.repeat(70));

// Produits avec de meilleures URLs
const products = [
  {
    name: 'Casque Gaming SteelSeries Arctis 7+',
    id: 'f98cd7ed-5ce3-4737-be19-6057d4e428e8',
    urls: [
      'https://images.unsplash.com/photo-1612444530582-fc66183b16f7?w=800', // Casque gaming RGB
      'https://images.unsplash.com/photo-1599669454699-248893623440?w=800', // Casque gaming
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', // Casque
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'  // Casque audio
    ]
  },
  {
    name: 'iPhone 14 Pro Max',
    id: '8a448d98-eceb-43d1-85d3-11e9ae69875f',
    urls: [
      'https://images.unsplash.com/photo-1663499478441-2a1c06d76dc6?w=800', // iPhone moderne
      'https://images.unsplash.com/photo-1592899677712-a3aecd9f11f2?w=800', // iPhone
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800'  // Smartphone
    ]
  },
  {
    name: 'Intel Core i7-14700KF',
    id: '93f479b3-ef65-4d03-a191-f8bb44715332',
    urls: [
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800', // Processeur Intel
      'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=800', // CPU
      'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=800', // Processeur
      'https://images.unsplash.com/photo-1563770495408-2aefa71d5770?w=800'  // Chip
    ]
  },
  {
    name: 'Gigabyte B650 Eagle AX (AM5)',
    id: 'c5614f4d-dcce-4743-b240-680f5d842765',
    urls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', // Carte mère
      'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800', // Motherboard
      'https://images.unsplash.com/photo-1555663245-8c06-2c1e6c60b7e?w=800'  // Carte mère
    ]
  },
  {
    name: 'TP-Link Deco E4 AC1200 (3-Pack)',
    id: 'd3987ca1-aea1-4835-8a24-b0b1efae0217',
    urls: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800', // Routeur WiFi
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', // Routeur
      'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800'  // Equipment réseau
    ]
  },
  {
    name: 'PS4 Slim + Jeux',
    id: '5492e8ec-f9f3-4c29-bdbb-4d4698377219',
    urls: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', // PS5 (pour la PS4)
      'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800', // Console de jeu
      'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800'  // Game controller
    ]
  }
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

async function downloadNewImages() {
  let downloaded = 0;
  let failed = 0;

  console.log('⬇️  Téléchargement des nouvelles images...\n');

  for (const product of products) {
    const p = data.products.find(prod => prod.id === product.id);
    if (!p) {
      console.log(`⚠️  Produit introuvable: ${product.name}`);
      continue;
    }

    console.log(`⬇️  ${p.name.substring(0, 55)}`);

    let success = false;
    for (const url of product.urls) {
      try {
        const filename = `${p.id}.jpg`;
        const filepath = path.join(imagesDir, filename);

        // Supprimer l'ancienne image
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
        p.image = `/products-images/${filename}`;
        console.log(`   ✅ Téléchargée (${stats.size} bytes)`);
        success = true;
        break;
      } catch (err) {
        const errMsg = err.message || err.toString();
        console.log(`   ❌ ${errMsg.substring(0, 50)}...`);
      }
    }

    if (!success) {
      failed++;
      console.log(`   ❌ Échec après ${product.urls.length} tentatives`);
    }

    console.log('');
  }

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('='.repeat(70));
  console.log(`\n✅ Terminé!`);
  console.log(`   Téléchargées: ${downloaded}`);
  console.log(`   Échouées: ${failed}`);
  console.log(`\n💾 Fichier sauvegardé`);

  // Vérification
  console.log(`\n📋 Vérification:\n`);
  products.forEach(prod => {
    const p = data.products.find(product => product.id === prod.id);
    if (p) {
      const hasImage = p.image && p.image !== 'N/A' && typeof p.image === 'string';
      console.log(`${hasImage ? '✅' : '❌'} ${p.name.substring(0, 50)}`);
    }
  });
}

downloadNewImages().catch(console.error);
