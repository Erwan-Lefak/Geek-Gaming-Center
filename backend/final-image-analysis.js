const fs = require('fs');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔍 ANALYSE FINALE DES IMAGES PRODUIT PAR PRODUIT\n');
console.log('='.repeat(70));

// Produits qui DOIVENT utiliser une icône (pas d'image appropriée possible)
const mustUseIcon = [
  'boite cd', 'boite dvd', 'boîte cd', 'boîte dvd',
  'cable', 'câble', 'adaptateur', 'chargeur',
  'support', 'bras', 'pied', 'fixation', 'stand',
  'rangement', 'organiseur', 'tapis', 'nappe',
  'nette', 'kit de nettoyage', 'lingette',
  'lumière', 'led', 'ruban', 'spot', 'lampe',
  'vis', 'visserie', 'paquet', 'lot', 'promo', 'promotion',
  'bureau', 'chaise', 'table', 'armoire', 'meuble',
  'licence', 'logiciel', 'antivirus', 'vpn',
  'garantie', 'assurance',
  'papier', 'encre', 'cartouche', 'toner',
  'vos promotions', 'offre'
];

// Conserver les vraies images 1fotrade pour tous sauf mustUseIcon
function findBestImage(product) {
  const name = product.name.toLowerCase();

  // Si produit doit utiliser icône
  for (const keyword of mustUseIcon) {
    if (name.includes(keyword)) {
      return 'N/A';
    }
  }

  // Si le produit a déjà une vraie image 1fotrade, la garder
  if (product.image && product.image.includes('1fotrade')) {
    return product.image;
  }

  // Pour les autres, utiliser N/A (icône) au lieu d'images Unsplash génériques
  // Car les images Unsplash ne correspondent pas vraiment aux produits spécifiques
  return 'N/A';
}

console.log('Analyse des produits...\n');

let toIcon = 0;
let keptReal = 0;
let updated = 0;
const changes = [];

data.products = data.products.map(p => {
  const newImage = findBestImage(p);

  if (newImage !== p.image) {
    updated++;
    const change = {
      name: p.name,
      old: p.image,
      new: newImage
    };

    if (newImage === 'N/A') {
      toIcon++;
      change.type = '→ Icône';
    } else {
      keptReal++;
      change.type = '→ Image gardée';
    }

    changes.push(change);

    return {
      ...p,
      image: newImage
    };
  }

  return p;
});

// Sauvegarder
fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));

console.log(`\n✅ ${updated} produits mis à jour\n`);
console.log(`📊 Répartition:`);
console.log(`   📦 Produits avec icône: ${toIcon}`);
console.log(`   🖼️  Produits avec vraie image: ${data.products.filter(p => p.image && p.image.includes('1fotrade')).length}`);
console.log(`   ❌ Produits sans image: ${data.products.filter(p => !p.image || p.image === 'N/A').length}`);

console.log(`\n📋 30 premiers produits passés en icône:\n`);
const toIconChanges = changes.filter(c => c.new === 'N/A').slice(0, 30);
toIconChanges.forEach((change, i) => {
  console.log(`${i+1}. ${change.name}`);
});

console.log(`\n💾 Fichier sauvegardé: data/products.json`);
console.log(`\n✨ Maintenant seuls les produits avec de vraies images ont des photos!`);
