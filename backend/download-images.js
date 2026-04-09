const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');

// Créer le dossier public/products-images
const imagesDir = path.join(__dirname, '../public/products-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Fonction pour télécharger une image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = new URL(url);
    options.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    const filePath = path.join(imagesDir, filename);

    // Vérifier si le fichier existe déjà
    if (fs.existsSync(filePath)) {
      resolve(`/products-images/${filename}`);
      return;
    }

    const file = fs.createWriteStream(filePath);

    protocol.get(url, options, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(`/products-images/${filename}`);
        });
      } else {
        file.close();
        fs.unlinkSync(filePath); // Supprimer le fichier partiel
        reject(new Error(`Status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('📊 Téléchargement des images...');
console.log(`📁 Dossier: ${imagesDir}\n`);

let downloaded = 0;
let skipped = 0;
let errors = 0;
let total = 0;

// Télécharger 500 images (les plus utilisées)
const productsToProcess = data.products.filter(p => p.image && p.image.startsWith('http')).slice(0, 500);

async function processProducts() {
  for (const product of productsToProcess) {
    const imageUrl = product.image;

    // Ignorer les images locales ou invalides
    if (!imageUrl || !imageUrl.startsWith('http')) {
      continue;
    }

    total++;

    // Générer un nom de fichier
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${product.id}${ext}`;

    try {
      const localPath = await downloadImage(imageUrl, filename);

      // Mettre à jour le produit avec le chemin local
      product.image = localPath;
      downloaded++;

      process.stdout.write(`\r✅ Téléchargé: ${downloaded}/${total} images`);
    } catch (err) {
      errors++;
      // Garder l'URL originale en cas d'erreur
    }

    // Pause pour éviter d'être bloqué
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Sauvegarder les produits mis à jour
  fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));

  console.log(`\n\n📊 Résultat:`);
  console.log(`   ✅ Téléchargées: ${downloaded}`);
  console.log(`   ❌ Erreurs: ${errors}`);
  console.log(`   📁 Images stockées dans: public/products-images/`);
  console.log(`\n💾 Fichier mis à jour: data/products.json`);
}

processProducts().catch(console.error);
