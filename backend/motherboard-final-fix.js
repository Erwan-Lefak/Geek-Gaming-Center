const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔧 RECHERCHE SOURCES MOTHERBOARD\n');
console.log('='.repeat(70));

// Gigabyte B650 Eagle AX - AM5 motherboard
const motherboard = {
  name: 'Gigabyte B650 Eagle AX (AM5)',
  id: 'c5614f4d-dcce-4743-b240-680f5d842765',
  urls: [
    // Manufacturer product pages (static images)
    'https://www.gigabyte.com/Content/Upload/Global/Product/B650%20EAGLE%20AX/gallery/b650_eagle_ax_01.jpg',
    'https://www.gigabyte.com/Content/Upload/Global/Product/B650%20EAGLE%20AX/gallery/b650_eagle_ax_02.jpg',
    'https://www.gigabyte.com/Content/Upload/Global/Product/B650%20EAGLE%20AX/gallery/b650_eagle_ax_03.jpg',
    // Press kit and media
    'https://www.gigabyte.com/Content/Upload/Global/Product/B650%20EAGLE%20AX/kv/b650_eagle_ax_kv_01.jpg',
    'https://www.gigabyte.com/Content/Upload/Global/Product/B650%20EAGLE%20AX/kv/b650_eagle_ax_kv_02.jpg',
    // Tech publications (often mirror press kit images)
    'https://www.notebookcheck.net/fileadmin/Notebooks/News/_News3/2022/09/090922_Gigabyte_B650_Eagle_AX.jpg',
    'https://www.techspot.com/articles-info/2563/images/2022-09-27-image-3.jpg',
    // WCCFTech and others
    'https://cdn.wccftech.com/wp-content/uploads/2022/09/Gigabyte-B650-Eagle-AX-1.jpg',
    'https://cdn.wccftech.com/wp-content/uploads/2022/09/Gigabyte-B650-Eagle-AX-2.jpg',
    // Video cardz style
    'https://videocardz.com/1/2022/09/Gigabyte-B650-Eagle-AX-1.jpg',
    // TPUCDN (TechPowerUp CDN)
    'https://tpucdn.com/gpu-specs/images/c/22-09-16/67a.jpg',
    'https://tpucdn.com/gpu-specs/images/c/22-09-16/67b.jpg',
    // Alternative CDNs
    'https://images.anandtech.com/dimg/3e66827f6a4d4a30a0cdd4219a2c5b79.jpg',
    'https://www.hardkernel.com/wp-content/uploads/2022/09/Gigabyte-B650-Eagle-AX-Review-1.jpg',
    // Overclocking forums
    'https://www.overclockers.co.uk/media/image/100/thumbnail_500x500/MB-0D4-GI_1.jpg',
    'https://www.overclockers.co.uk/media/image/original/MB-0D4-GI.jpg',
    // Alternate
    'https://www.scan.co.uk/images/products/2474854-a.jpg',
    'https://www.scan.co.uk/images/products/2474854-b.jpg'
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

async function downloadMotherboard() {
  console.log(`⬇️  ${motherboard.name}\n`);
  console.log(`   ID: ${motherboard.id}\n`);

  const p = data.products.find(prod => prod.id === motherboard.id);
  if (!p) {
    console.log('❌ Produit introuvable dans products.json');
    return;
  }

  let success = false;
  for (let i = 0; i < motherboard.urls.length; i++) {
    const url = motherboard.urls[i];
    try {
      const filename = `${p.id}.jpg`;
      const filepath = path.join(imagesDir, filename);

      // Supprimer l'ancienne image
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      console.log(`   [${i + 1}/${motherboard.urls.length}] ${url.substring(0, 75)}...`);

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
      console.log(`   ✅ SUCCÈS! (${stats.size} bytes)`);
      console.log(`   ${fileType || 'Image valide'}\n`);

      success = true;
      break;
    } catch (err) {
      const errMsg = err.message || err.toString();
      console.log(`   ❌ ${errMsg.substring(0, 60)}...`);
    }
  }

  if (!success) {
    console.log(`\n   ❌ Échec après ${motherboard.urls.length} tentatives\n`);
  }

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: data.products }, null, 2));

  console.log('='.repeat(70));
  console.log(`\n💾 Fichier products.json sauvegardé`);
  console.log(`\n📊 Image actuelle: ${p.image}`);
}

downloadMotherboard().catch(console.error);
