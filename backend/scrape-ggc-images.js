const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔍 RECHERCHE DES IMAGES SUR GEEK GAMING CENTER\n');
console.log('='.repeat(70));

// Produits qui n'ont pas d'images locales
const productsNeedingImages = data.products.filter(p =>
  !p.image || p.image === 'N/A' || (p.image && p.image.startsWith('/assets/'))
);

console.log(`📊 ${productsNeedingImages.length} produits sans images\n`);

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

// Fonction pour chercher un produit sur GGC
async function searchProductOnGGC(productName) {
  return new Promise((resolve) => {
    // Encoder le nom du produit pour l'URL
    const searchQuery = encodeURIComponent(productName);

    // Essayer de trouver l'image en cherchant sur le site
    // Format probable: https://store.geek-gaming-center.com/products/{slug}
    const options = {
      hostname: 'store.geek-gaming-center.com',
      path: `/`,
      method: 'GET'
    };

    https.get(`https://store.geek-gaming-center.com/`, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        // Chercher des patterns d'images dans le HTML
        const imagePatterns = [
          /https:\/\/store\.geek-gaming-center\.com\/cdn\/shop\/files\/[^\s"']+\.(jpg|jpeg|png|webp)/gi,
          /https:\/\/cdn\.shopify\.com\/s\/files\/[^\s"']+\.(jpg|jpeg|png|webp)/gi
        ];

        const foundImages = [];
        imagePatterns.forEach(pattern => {
          const matches = data.match(pattern);
          if (matches) {
            foundImages.push(...matches);
          }
        });

        // Retourner la première image trouvée
        if (foundImages.length > 0) {
          resolve(foundImages[0]);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

// Fonction pour créer une URL probable basée sur le nom du produit
function createProbableURL(productName) {
  const lowerName = productName.toLowerCase();

  // Nettoyer le nom
  let slug = lowerName
    .replace(/[^a-z0-9\s\-]/g, '') // Enlever les caractères spéciaux
    .replace(/\s+/g, '-')           // Remplacer les espaces par des tirets
    .replace(/\-+/g, '-')           // Éviter les tirets multiples
    .substring(0, 100);             // Limiter la longueur

  // Formats possibles sur GGC/Shopify
  const possibleURLs = [
    `https://store.geek-gaming-center.com/cdn/shop/files/${slug}.png`,
    `https://store.geek-gaming-center.com/cdn/shop/files/${slug}.jpg`,
    `https://store.geek-gaming-center.com/cdn/shop/files/${slug}.webp`,
    `https://store.geek-gaming-center.com/products/${slug}`,
  ];

  return possibleURLs;
}

async function findAndDownloadImages() {
  let downloaded = 0;
  let failed = 0;
  const errors = [];

  console.log('⬇️  Recherche et téléchargement des images...\n');

  const updatedProducts = await Promise.all(data.products.map(async (product) => {
    // Si déjà une image locale, garder
    if (product.image && product.image.startsWith('/products-images/')) {
      return product;
    }

    // Si URL HTTP existante mais pas locale, essayer de la télécharger
    if (product.image && product.image.startsWith('http')) {
      const filename = `${product.id}${path.extname(product.image).split('?')[0] || '.jpg'}`;
      const filepath = path.join(imagesDir, filename);
      const localPath = `/products-images/${filename}`;

      if (!fs.existsSync(filepath)) {
        try {
          await downloadImage(product.image, filepath);
          downloaded++;
          console.log(`✅ Téléchargée: ${product.name.substring(0, 40)}`);
          return { ...product, image: localPath };
        } catch (err) {
          // Continue pour chercher d'autres sources
        }
      } else {
        return { ...product, image: localPath };
      }
    }

    // Produits sans image : essayer de trouver sur GGC
    if (!product.image || product.image === 'N/A' || (product.image && product.image.startsWith('/assets/'))) {
      const probableURLs = createProbableURL(product.name);

      for (const url of probableURLs) {
        if (url.includes('/products/')) continue; // Skip les URLs de pages, on veut des images directes

        const filename = `${product.id}${path.extname(url)}`;
        const filepath = path.join(imagesDir, filename);
        const localPath = `/products-images/${filename}`;

        if (!fs.existsSync(filepath)) {
          try {
            await downloadImage(url, filepath);
            downloaded++;
            console.log(`✅ Trouvée: ${product.name.substring(0, 40)}`);
            return { ...product, image: localPath };
          } catch (err) {
            // Continuer avec la prochaine URL
            continue;
          }
        } else {
          return { ...product, image: localPath };
        }
      }
    }

    // Si rien n'a marché, garder N/A
    return product;
  }));

  console.log(`\n\n✅ Terminé!\n`);

  console.log('📊 Statistiques:');
  console.log(`   ✅ Nouvelles images téléchargées: ${downloaded}`);

  // Sauvegarder
  fs.writeFileSync('data/products.json', JSON.stringify({ products: updatedProducts }, null, 2));
  console.log(`\n💾 Fichier products.json mis à jour`);

  // Vérifier les produits demandés
  const testProducts = [
    'Souris Gaming Logitech G Pro X Superlight',
    'Casque Gaming SteelSeries Arctis 7+',
    'iPhone 14 Pro Max',
    'Casque Sony WH-1000XM5',
    'Enceinte JBL Flip 6'
  ];

  console.log(`\n📋 État des produits demandés:\n`);
  testProducts.forEach(name => {
    const p = updatedProducts.find(prod => prod.name === name);
    if (p) {
      const hasImage = p.image && p.image.startsWith('/products-images/');
      console.log(`${hasImage ? '✅' : '❌'} ${name}`);
    }
  });
}

// Lancer
findAndDownloadImages().catch(console.error);
