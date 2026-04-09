const fs = require('fs');
const path = require('path');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔧 NETTOYAGE DES PRODUITS SANS IMAGES VALIDES\n');

const imagesDir = path.join(__dirname, '../public/products-images');

let resetCount = 0;

const cleanedProducts = data.products.map(product => {
  if (!product.image) return product;

  // Si le produit a une image locale
  if (product.image.startsWith('/products-images/')) {
    const filename = path.basename(product.image);
    const filepath = path.join(imagesDir, filename);

    // Vérifier si le fichier existe et est une vraie image
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);

      // Si le fichier fait moins de 10KB, c'est probablement un faux fichier (HTML)
      if (stats.size < 10240) {
        console.log(`⚠️  Fichier suspect supprimé: ${filename} (${stats.size} bytes)`);
        fs.unlinkSync(filepath);
        resetCount++;
        return { ...product, image: 'N/A' };
      }
    } else {
      // Le fichier n'existe pas
      resetCount++;
      return { ...product, image: 'N/A' };
    }
  }

  return product;
});

fs.writeFileSync('data/products.json', JSON.stringify({ products: cleanedProducts }, null, 2));

console.log(`\n✅ ${resetCount} produits remis à N/A (icône)`);
console.log(`💾 Fichier products.json mis à jour`);

// Vérifier les produits demandés
const testProducts = [
  'Souris Gaming Logitech G Pro X Superlight',
  'Casque Gaming SteelSeries Arctis 7+',
  'iPhone 14 Pro Max',
  'Casque Sony WH-1000XM5',
  'Enceinte JBL Flip 6'
];

console.log(`\n📋 État final des produits demandés:\n`);
testProducts.forEach(name => {
  const p = cleanedProducts.find(prod => prod.name === name);
  if (p) {
    const hasImage = p.image && p.image !== 'N/A';
    console.log(`${hasImage ? '✅' : '❌'} ${name}`);
    if (!hasImage) {
      console.log(`   → Utilise une icône de catégorie`);
    }
  }
});

// Compter les stats finales
const withImages = cleanedProducts.filter(p => p.image && p.image.startsWith('/products-images/')).length;
const withIcons = cleanedProducts.filter(p => !p.image || p.image === 'N/A').length;

console.log(`\n📊 Statistiques finales:`);
console.log(`   📦 Produits avec images: ${withImages}`);
console.log(`   🎨 Produits avec icônes: ${withIcons}`);
console.log(`   📊 Total: ${cleanedProducts.length}`);
