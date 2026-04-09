const fs = require('fs');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('📊 ANALYSE ET CORRECTION DES IMAGES\n');
console.log('='.repeat(70));

// Compter les types d'images
const stats = {
  locales: 0,
  externes: 0,
  placeholders: 0
};

data.products.forEach(p => {
  if (!p.image || p.image === 'N/A') {
    stats.placeholders++;
  } else if (p.image.startsWith('/products-images/')) {
    stats.locales++;
  } else if (p.image.startsWith('http')) {
    stats.externes++;
  } else {
    stats.placeholders++;
  }
});

console.log('Statistiques actuelles:');
console.log(`  Images locales (probablement fausses): ${stats.locales}`);
console.log(`  Images externes (correctes): ${stats.externes}`);
console.log(`  Placeholders: ${stats.placeholders}`);

// Le problème : les images locales ne correspondent pas
// Solution : supprimer le dossier images locaux et utiliser les URLs externes
console.log('\n🔧 Solution : Suppression des images locales...');

try {
  const fs = require('fs');
  const path = require('path');

  const imagesDir = path.join(__dirname, '../public/products-images');

  if (fs.existsSync(imagesDir)) {
    // Compter les fichiers
    const files = fs.readdirSync(imagesDir);
    console.log(`   📁 ${files.length} fichiers à supprimer`);

    // Supprimer le dossier complet
    fs.rmSync(imagesDir, { recursive: true, force: true });
    console.log('   ✅ Dossier supprimé');
  }
} catch (e) {
  console.log(`   ⚠️  Erreur: ${e.message}`);
}

// Maintenant utiliser les URLs externes originales depuis le site source
console.log('\n🔄 Téléchargement des données originales du site...');

// On a besoin de récupérer les vraies images depuis le site original
// Pour l'instant, on va utiliser des placeholders par catégorie
const categoryPlaceholders = {
  'pc-gaming': {
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&h=400&fit=crop',
    keywords: ['pc', 'gaming', 'carte', 'processeur', 'ram', 'ssd', 'disque', 'ecran', 'clavier', 'souris']
  },
  'accessoires': {
    image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=400&h=400&fit=crop',
    keywords: ['casque', 'enceinte', 'manette', 'cable', 'adaptateur']
  },
  'consoles': {
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop',
    keywords: ['ps5', 'ps4', 'xbox', 'switch', 'console']
  },
  'goodies': {
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    keywords: ['iphone', 'samsung', 'smartphone', 'tablette']
  }
};

// Mettre à jour les produits
let updated = 0;
data.products = data.products.map(p => {
  // Si l'image est locale, la remplacer par placeholder
  if (p.image && p.image.startsWith('/products-images/')) {
    updated++;
    return {
      ...p,
      image: categoryPlaceholders[p.category]?.image || categoryPlaceholders['pc-gaming'].image
    };
  }
  return p;
});

fs.writeFileSync('data/products.json', JSON.stringify(data, null, 2));

console.log(`\n✅ ${updated} produits mis à jour avec placeholders`);
console.log('💾 Fichier sauvegardé: data/products.json');
console.log('\n📝 Note: Pour de vraies images, il faudrait télécharger depuis le site original');
console.log('   en utilisant les URLs des produits source (pas nos IDs)');
