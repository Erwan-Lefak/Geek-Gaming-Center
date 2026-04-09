const fs = require('fs');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔍 ANALYSE DÉTAILLÉE DE CHAQUE PRODUIT\n');
console.log('='.repeat(70));

// Catégories de produits qui doivent utiliser des icônes au lieu d'images
const useIconOnly = [
  // Stockage physique
  'boite cd', 'boite dvd', 'boîte cd', 'boîte dvd', 'boitier cd', 'boitier dvd',
  'cd', 'dvd', 'blu-ray',
  'sleeve', 'enveloppe', 'étui', 'protection',

  // Câbles et adaptateurs
  'cable', 'câble', 'câbles', 'adaptateur', 'adaptateur secteur',
  'chargeur', 'chargeurs', 'cordon', 'prise', 'rallonge', 'usb-c', 'usb a',
  'hdmi', 'displayport', 'vga', 'ethernet', 'rj45',

  // Supports et fixation
  'support', 'bras', 'pied', 'fixation', 'monture', 'stand', 'porte',
  'trépied', 'chevalet', 'support tv', 'support écran', 'support pc',

  // Accessoires divers
  'rangement', 'organiseur', 'tapis', 'nappe', 'houss', 'sac', 'bandoulière',
  'nette', 'kit de nettoyage', 'lingette', 'ventilateur', 'refroidisseur',
  'lumière', 'led', 'ruban', 'spot', 'lampe', 'éclairage',

  // Petits accessoires
  'vis', 'visserie', 'paquet', 'lot', 'pack', 'kit',
  'promo', 'promotion', 'vos promotions', 'offre', 'bundle',

  // Mobiliers
  'bureau', 'chaise', 'table', 'armoire', 'meuble', 'caisse', 'boîte',
  'caisse', 'carton',

  // Documentation/Logiciel
  'licence', 'logiciel', 'windows', 'office', 'antivirus', 'vpn',
  'garantie', 'assurance', 'extension',

  // Consommables
  'papier', 'encre', 'cartouche', 'toner'
];

// Correspondances précises avec vraies URLs (images qui ressemblent vraiment au produit)
const preciseMatches = {
  // CASQUES
  'casque sony wh-1000xm5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque sony wh-1000xm4': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque sony wh-ch700': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque sony': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',

  'casque steelseries arctis': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'steelseries arctis': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'arctis 7': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'arctis 5': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'arctis 1': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',

  'casque hyperx': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'hyperx cloud': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'cloud ii': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'cloud alpha': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',

  'casque logitech': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'logitech g pro': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'logitech g733': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',

  'casque corsair': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'corsair void': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',

  'casque razer': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'razer kraken': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',

  'casque jbl': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'jbl tune': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',

  // ENCEINTES
  'enceinte jbl flip 6': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'enceinte jbl flip 5': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'jbl flip': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',

  'enceinte jbl charge': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'jbl charge': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',

  'enceinte jbl go': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'jbl go': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',

  // SMARTPHONES
  'iphone 15 pro max': 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400',
  'iphone 15 pro': 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400',
  'iphone 15': 'https://images.unsplash.com/photo-1696446702368-be4a14fd7fea?w=400',
  'iphone 14 pro max': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=400',
  'iphone 14 pro': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=400',
  'iphone 14': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=400',
  'iphone 13 pro': 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400',
  'iphone 13': 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400',
  'iphone 12': 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=400',
  'iphone 11': 'https://images.unsplash.com/photo-1574144615846-46eba3d1935c?w=400',

  'samsung galaxy s24': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  'samsung galaxy s23': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  'samsung galaxy s22': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  'samsung galaxy': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  'samsung galaxy a': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',

  // CONSOLES
  'ps5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'playstation 5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'ps5 slim': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',

  'ps4': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'playstation 4': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',

  'xbox series x': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'xbox series s': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'xbox one': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',

  'nintendo switch oled': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
  'nintendo switch': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',

  // SOURIS
  'souris logitech g pro': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'logitech g pro x superlight': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'logitech g502': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'logitech g': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',

  'souris razer': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'razer deathadder': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'razer viper': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',

  // CLAVIERS
  'clavier logitech': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'clavier razer': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'clavier mécanique': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'clavier gaming': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',

  // CARTES GRAPHIQUES
  'rtx 4090': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 4080': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 4070 ti': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 4070': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 4060': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 3080': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 3070': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 3060': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',

  // PROCESSEURS
  'intel core i9-14900': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i9': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i7-14700': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i7-13700': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i7': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i5': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i3': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',

  'amd ryzen 9 7950': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 9 7900': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 9': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 7 7800': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 7 7700': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 7': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 5': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
};

function shouldUseIconOnly(name) {
  const lowerName = name.toLowerCase();
  return useIconOnly.some(keyword => lowerName.includes(keyword));
}

function findBestImage(product) {
  const name = product.name.toLowerCase();

  // D'abord vérifier si ce produit doit utiliser une icône
  if (shouldUseIconOnly(name)) {
    return 'N/A';
  }

  // Chercher une correspondance précise
  for (const [keyword, imageUrl] of Object.entries(preciseMatches)) {
    if (name.includes(keyword)) {
      return imageUrl;
    }
  }

  // Si le produit a une image 1fotrade (vraie image), la garder
  if (product.image && product.image.includes('1fotrade')) {
    return product.image;
  }

  // Sinon, utiliser N/A pour afficher l'icône
  return 'N/A';
}

console.log('Analyse en cours...\n');

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
    } else if (p.image && p.image.includes('1fotrade')) {
      keptReal++;
      change.type = '→ Gardée (vraie)';
    } else {
      change.type = '→ Nouvelle image';
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

console.log(`\n✅ ${updated} produits analysés et mis à jour`);
console.log(`   📦 ${toIcon} produits passent en icône`);
console.log(`   🖼️  ${keptReal} vraies images conservées`);
console.log(`   🔄 ${updated - toIcon - keptReal} nouvelles images assignées\n`);

// Afficher les 50 premiers changements
console.log('📋 50 premiers changements:\n');
changes.slice(0, 50).forEach((change, i) => {
  const oldShort = change.old.length > 50 ? '...' + change.old.substring(change.old.length - 47) : change.old;
  console.log(`${i+1}. ${change.name.substring(0, 45)}`);
  console.log(`   ${change.type}`);
  if (change.new !== 'N/A') {
    console.log(`   ${change.new}`);
  }
  console.log('');
});

console.log(`\n💾 Fichier sauvegardé: data/products.json`);
console.log(`\n📊 Statistiques finales:`);
console.log(`   Total produits: ${data.products.length}`);
console.log(`   Produits mis à jour: ${updated}`);
console.log(`   Produits avec icône: ${toIcon}`);
console.log(`   Produits avec vraie image: ${data.products.filter(p => p.image && p.image.includes('1fotrade')).length}`);
console.log(`   Produits avec image Unsplash: ${data.products.filter(p => p.image && p.image.includes('unsplash')).length}`);
