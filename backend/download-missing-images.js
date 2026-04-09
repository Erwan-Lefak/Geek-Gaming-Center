const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔄 TÉLÉCHARGEMENT DES IMAGES MANQUANTES\n');
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
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Trouver les produits qui ont des URLs HTTP mais pas encore d'images locales
const productsNeedingDownload = data.products.filter(p =>
  p.image && p.image.startsWith('http') && !p.image.startsWith('/products-images/')
);

console.log(`📊 ${productsNeedingDownload.length} produits à télécharger\n`);

if (productsNeedingDownload.length === 0) {
  console.log('✅ Tous les produits ont déjà leurs images locales!');
  process.exit(0);
}

async function downloadImages() {
  let downloaded = 0;
  let failed = 0;
  const errors = [];

  console.log('⬇️  Téléchargement des images...\n');

  // Télécharger les images
  const updatedProducts = await Promise.all(data.products.map(async (product) => {
    // Si le produit a déjà une image locale, on garde
    if (product.image && product.image.startsWith('/products-images/')) {
      return product;
    }

    // Si le produit a une URL HTTP, on la télécharge
    if (product.image && product.image.startsWith('http')) {
      // Extraire l'extension
      let ext = '.jpg';
      if (product.image.includes('.webp')) ext = '.webp';
      else if (product.image.includes('.png')) ext = '.png';
      else if (product.image.includes('.jpeg')) ext = '.jpeg';

      const filename = `${product.id}${ext}`;
      const filepath = path.join(imagesDir, filename);
      const localPath = `/products-images/${filename}`;

      // Télécharger si elle n'existe pas
      if (!fs.existsSync(filepath)) {
        try {
          await downloadImage(product.image, filepath);
          downloaded++;
          process.stdout.write(`\r✅ ${downloaded} téléchargées | ❌ ${failed} échoués`);
        } catch (err) {
          failed++;
          errors.push({ name: product.name, url: product.image, error: err.message });
          process.stdout.write(`\r✅ ${downloaded} téléchargées | ❌ ${failed} échoués`);
          return { ...product, image: 'N/A' };
        }
      } else {
        downloaded++;
      }

      return {
        ...product,
        image: localPath
      };
    }

    // Sinon garder le produit tel quel
    return product;
  }));

  console.log(`\n\n✅ Téléchargement terminé!\n`);

  // Afficher les statistiques
  console.log('📊 Statistiques:');
  console.log(`   ✅ Images téléchargées: ${downloaded}`);
  console.log(`   ❌ Téléchargements échoués: ${failed}`);

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
  console.log(`\n✨ ${downloaded} nouveaux produits ont maintenant leurs images!`);

  // Vérifier les produits qui nous intéressent
  const testProducts = [
    'Souris Gaming Logitech G Pro X Superlight',
    'Casque Gaming SteelSeries Arctis 7+',
    'iPhone 14 Pro Max',
    'Casque Sony WH-1000XM5',
    'Enceinte JBL Flip 6'
  ];

  console.log(`\n📋 Vérification des produits demandés:\n`);
  testProducts.forEach(name => {
    const p = updatedProducts.find(prod => prod.name === name);
    if (p) {
      const hasImage = p.image && p.image.startsWith('/products-images/');
      console.log(`${hasImage ? '✅' : '❌'} ${name}`);
      if (p.image && p.image.startsWith('/products-images/')) {
        console.log(`   Image: ${p.image}`);
      }
      console.log('');
    }
  });
}

// Lancer le téléchargement
downloadImages().catch(console.error);
