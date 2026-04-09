const fs = require('fs');
const https = require('https');

// Images par défaut pour chaque catégorie
const defaultImages = {
  'pc-gaming': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop',
  'accessoires': 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400&h=400&fit=crop',
  'consoles': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
  'goodies': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
};

// Fonction pour valider une URL
function isValidImageUrl(url) {
  if (!url || url === 'N/A' || url === 'null' || url === null || url === undefined) {
    return false;
  }

  // Garder les URLs externes valides
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  // Les chemins locaux ne fonctionnent pas
  return false;
}

// Fonction pour obtenir une image par défaut basée sur la catégorie
function getDefaultImage(category) {
  return defaultImages[category] || defaultImages['pc-gaming'];
}

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
console.log('📊 Total produits:', data.products.length);

let fixedImages = 0;
let keptImages = 0;
let defaultImagesUsed = 0;

// Corriger les images
data.products = data.products.map(product => {
  const currentImage = product.image;

  if (isValidImageUrl(currentImage)) {
    // Garder l'image valide
    keptImages++;
    return product;
  }

  // Remplacer par une image par défaut
  fixedImages++;
  defaultImagesUsed++;

  return {
    ...product,
    image: getDefaultImage(product.category)
  };
});

// Sauvegarder
fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));

console.log('\n✅ Images corrigées!');
console.log(`📈 Images gardées (valides): ${keptImages}`);
console.log(`🔧 Images corrigées: ${fixedImages}`);
console.log(`📊 Répartition par défaut:`);
Object.entries(defaultImages).forEach(([cat, url]) => {
  const count = data.products.filter(p => p.image === url).length;
  if (count > 0) {
    console.log(`   • ${cat}: ${count} produits`);
  }
});

console.log('\n💾 Fichier sauvegardé: data/products.json');
