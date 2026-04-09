const fs = require('fs');

// Images spécifiques par type de produit (mots-clés)
const productTypeImages = {
  // Cartes graphiques
  'carte graphique': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'gpu': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'radeon': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',

  // Consoles
  'ps5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'ps4': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'switch': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
  'xbox': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',

  // Smartphones
  'iphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
  'samsung': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  'smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',

  // Casques/audio
  'casque': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'headset': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'enceinte': 'https://images.unsplash.com/photo-1545454675-3531c5c8e3f0?w=400',
  'jbl': 'https://images.unsplash.com/photo-1545454675-3531c5c8e3f0?w=400',
  'sony': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',

  // PC/Laptop
  'pc': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'ordinateur': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'laptop': 'https://images.unsplash.com/photo-1593642632823-8f785ba63604?w=400',
  'kit pc': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',

  // Composants PC
  'processeur': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'cpu': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'ram': 'https://images.unsplash.com/photo-1562976540-150ccc683583d?w=400',
  'ssd': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'disque': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'carte mère': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',

  // Périphériques
  'souris': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'clavier': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'manette': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
  'écran': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
};

// Images par défaut par catégorie
const categoryDefaults = {
  'pc-gaming': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'accessoires': 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400',
  'consoles': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'goodies': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
};

function findBestImage(product) {
  const name = product.name.toLowerCase();

  // Chercher une image spécifique basée sur les mots-clés
  for (const [keyword, imageUrl] of Object.entries(productTypeImages)) {
    if (name.includes(keyword)) {
      return imageUrl;
    }
  }

  // Sinon, utiliser l'image par défaut de la catégorie
  return categoryDefaults[product.category] || categoryDefaults['pc-gaming'];
}

// Charger et mettre à jour les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🎨 Amélioration des images avec correspondance par type de produit\n');

let updated = 0;
const before = {};

data.products = data.products.map(p => {
  // Sauvegarder l'ancienne image pour stats
  if (!before[p.category]) before[p.category] = 0;
  before[p.category]++;

  // Si l'image est Unsplash (placeholder) ou locale, améliorer avec correspondance
  if (p.image && (p.image.includes('unsplash') || p.image.startsWith('/products-'))) {
    updated++;
    return {
      ...p,
      image: findBestImage(p)
    };
  }
  return p;
});

fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));

console.log(`✅ ${updated} produits mis à jour avec images spécifiques`);
console.log('\n📊 Répartition par catégorie:');
Object.entries(before).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count} produits`);
});

console.log('\n💾 Fichier sauvegardé: data/products.json');
console.log('\n🎯 Les images correspondent maintenant au type de produit!');
