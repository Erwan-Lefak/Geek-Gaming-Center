const fs = require('fs');

// Images spécifiques par type de produit avec plus de précision
const specificProductImages = {
  // Enceintes - images spécifiques par marque/type
  'enceinte jbl': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', // JBL Flip style
  'jbl flip': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'jbl charge': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'jbl': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',

  'enceinte bluetooth': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'enceinte portable': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'enceinte': 'https://images.unsplash.com/photo-1545454675-3531c5c8e3f0?w=400', // Enceinte desktop

  'havit': 'https://images.unsplash.com/photo-1545454675-3531c5c8e3f0?w=400', // Enceinte desktop

  'soundbar': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400',

  // Casques
  'casque sony': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque sennheiser': 'https://images.unsplash.com/photo-1545454675-3531c5c8e3f0?w=400',
  'casque logitech': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque steelseries': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'casque hyperx': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
  'casque corsair': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque beats': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'casque': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',

  // Souris
  'souris logitech': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'souris razer': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'souris corsair': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  'souris': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',

  // Claviers
  'clavier logitech': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'clavier razer': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'clavier corsair': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'clavier': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',

  // Manettes
  'manette ps5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'manette xbox': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'manette switch': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
  'manette': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',

  // Consoles
  'ps5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'ps4': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'playstation': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'xbox series': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'xbox one': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'xbox': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'switch': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',

  // Smartphones
  'iphone 14': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=400',
  'iphone 13': 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400',
  'iphone 12': 'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=400',
  'iphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
  'samsung galaxy': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  'samsung': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',

  // Cartes graphiques
  'rtx 4090': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 4080': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 4070': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 3060': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 3070': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx 3080': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'rtx': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'gtx': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'carte graphique': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',

  // Processeurs
  'intel core i9': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i7': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i5': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel core i3': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'intel': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 9': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 7': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd ryzen 5': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'amd': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'processeur': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',

  // PC/Laptop
  'pc portable': 'https://images.unsplash.com/photo-1593642632823-8f785ba63604?w=400',
  'laptop': 'https://images.unsplash.com/photo-1593642632823-8f785ba63604?w=400',
  'pc gamer': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'pc gaming': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'kit pc': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'pc': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',

  // Stockage
  'ssd': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'disque dur': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'hdd': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',

  // RAM
  'ram': 'https://images.unsplash.com/photo-1562976540-150ccc683583d?w=400',
  'mémoire': 'https://images.unsplash.com/photo-1562976540-150ccc683583d?w=400',

  // Écrans
  'écran': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  'ecran': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',

  // Carte mère
  'carte mère': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
};

function findBestImage(product) {
  const name = product.name.toLowerCase();

  // Chercher l'image la plus spécifique possible
  // Trier les clés par longueur décroissante pour avoir les plus spécifiques d'abord
  const sortedKeys = Object.keys(specificProductImages).sort((a, b) => b.length - a.length);

  for (const keyword of sortedKeys) {
    if (name.includes(keyword)) {
      return specificProductImages[keyword];
    }
  }

  // Si pas de correspondance, garder l'image actuelle si elle existe
  return product.image;
}

// Charger et mettre à jour les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🎨 Amélioration des images avec correspondances spécifiques\n');

let updated = 0;
const changes = [];

data.products = data.products.map(p => {
  const newImage = findBestImage(p);

  if (newImage && newImage !== p.image) {
    updated++;
    changes.push({
      name: p.name.substring(0, 40),
      old: p.image.substring(40, 80),
      new: newImage.substring(40, 80)
    });
    return {
      ...p,
      image: newImage
    };
  }

  return p;
});

fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));

console.log(`✅ ${updated} produits mis à jour avec des images plus spécifiques\n`);

// Afficher quelques exemples de changements
console.log('📋 Exemples de changements:');
changes.slice(0, 10).forEach((change, i) => {
  console.log(`\n${i+1}. ${change.name}...`);
  console.log(`   Avant: ...${change.old}...`);
  console.log(`   Après:  ...${change.new}...`);
});

console.log(`\n💾 Fichier sauvegardé: data/products.json`);
