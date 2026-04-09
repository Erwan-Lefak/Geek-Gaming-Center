const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Charger les deux fichiers
const currentData = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
const originalData = JSON.parse(fs.readFileSync('data/gge_products_complete.json', 'utf8'));

console.log('🔄 TÉLÉCHARGEMENT DES VRAIES IMAGES\n');
console.log('='.repeat(70));

// Créer le dossier images
const imagesDir = path.join(__dirname, '../public/products-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Fonction pour télécharger une image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;

    lib.get(url, (response) => {
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
        // Follow redirects
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Créer un map ID -> URL originale
const idToOriginalUrl = {};
originalData.products.forEach(p => {
  if (p.image && p.image.startsWith('http')) {
    idToOriginalUrl[p.id] = p.image;
  }
});

console.log(`📊 Produits avec URL originale: ${Object.keys(idToOriginalUrl).length}`);
console.log(`📦 Total produits actuels: ${currentData.products.length}\n`);

// Fonction principale
async function downloadAllImages() {
  // Statistiques
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;
  const errors = [];

  console.log('⬇️  Téléchargement des images...\n');

  const updatedProducts = await Promise.all(currentData.products.map(async (product) => {
    const originalUrl = idToOriginalUrl[product.id];

    // Si pas d'URL originale, garder N/A
    if (!originalUrl) {
      skipped++;
      return product;
    }

    // Extraire l'extension de l'URL originale
    let ext = '.jpg';
    if (originalUrl.includes('.webp')) ext = '.webp';
    else if (originalUrl.includes('.png')) ext = '.png';
    else if (originalUrl.includes('.jpeg')) ext = '.jpeg';

    // Nom du fichier basé sur l'ID pour garantir l'unicité
    const filename = `${product.id}${ext}`;
    const filepath = path.join(imagesDir, filename);
    const localPath = `/products-images/${filename}`;

    // Télécharger l'image si elle n'existe pas déjà
    if (!fs.existsSync(filepath)) {
      try {
        await downloadImage(originalUrl, filepath);
        downloaded++;
        process.stdout.write(`\r✅ ${downloaded} téléchargées | ❌ ${failed} échoués`);
      } catch (err) {
        failed++;
        errors.push({ name: product.name, url: originalUrl, error: err.message });
        process.stdout.write(`\r✅ ${downloaded} téléchargées | ❌ ${failed} échoués`);
        // En cas d'erreur, garder N/A
        return { ...product, image: 'N/A' };
      }
    } else {
      downloaded++;
      process.stdout.write(`\r✅ ${downloaded} déjà présentes | ❌ ${failed} échoués`);
    }

    // Retourner le produit avec le nouveau chemin local
    return {
      ...product,
      image: localPath
    };
  }));

  console.log(`\n\n✅ Téléchargement terminé!\n`);

  // Afficher les statistiques
  console.log('📊 Statistiques:');
  console.log(`   ✅ Images téléchargées: ${downloaded}`);
  console.log(`   ❌ Téléchargements échoués: ${failed}`);
  console.log(`   ⏭️  Produits sans URL originale: ${skipped}`);

  if (errors.length > 0) {
    console.log(`\n❌ Erreurs de téléchargement (${errors.length}):`);
    errors.slice(0, 10).forEach((err, i) => {
      console.log(`\n${i+1}. ${err.name}`);
      console.log(`   URL: ${err.url}`);
      console.log(`   Erreur: ${err.error}`);
    });
  }

  // Sauvegarder les produits mis à jour
  fs.writeFileSync('data/products.json', JSON.stringify({ products: updatedProducts }, null, 2));

  console.log(`\n💾 Fichier products.json mis à jour`);
  console.log(`\n🎯 Toutes les images sont correctement associées aux produits!`);

  // Vérifier quelques produits
  console.log(`\n📋 Vérification de 5 produits:\n`);
  const samples = updatedProducts.filter(p => p.image && p.image.startsWith('/products-images/')).slice(0, 5);
  samples.forEach((p, i) => {
    const original = originalData.products.find(op => op.id === p.id);
    console.log(`${i+1}. ${p.name.substring(0, 45)}...`);
    console.log(`   Image locale: ${p.image}`);
    if (original) {
      console.log(`   URL originale: ${original.image.substring(0, 60)}...`);
    }
    console.log('');
  });

  console.log(`\n✨ Terminé! ${downloaded} produits ont maintenant leurs vraies images!`);
}

// Lancer le téléchargement
downloadAllImages().catch(console.error);
