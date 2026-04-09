const fs = require('fs');
const https = require('https');

// Charger les données
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔍 RECHERCHE DES VRAIES IMAGES PRODUITS\n');
console.log('='.repeat(70));

// Produits sans image ou avec /assets/
const productsNeedingImages = data.products.filter(p =>
  !p.image || p.image === 'N/A' || (p.image && p.image.startsWith('/assets/'))
);

console.log(`📊 ${productsNeedingImages.length} produits ont besoin d'images\n`);

// Fonction pour chercher un produit sur le site par son nom
async function searchProductOnSite(productName) {
  return new Promise((resolve) => {
    // Chercher sur le site GGC en utilisant une recherche
    const searchQuery = encodeURIComponent(productName);
    const options = {
      hostname: 'store.geek-gaming-center.com',
      path: `/api/products/search?q=${searchQuery}`,
      method: 'GET'
    };

    // Note: Cette API n'existe peut-être pas, donc on va utiliser une autre approche
    // On va plutôt construire l'URL basée sur le format du site

    // Pour l'instant, retourner null
    resolve(null);
  });
}

// Liste manuelle des URLs connues pour les produits populaires
const knownProductUrls = {
  'Souris Gaming Logitech G Pro X Superlight': 'https://www.1fotrade.com/ressources/site/img/product/souris-gaming-logitech-g-pro-x-superlight-258265__480.webp',
  'Casque Gaming SteelSeries Arctis 7+': 'https://www.1fotrade.com/ressources/site/img/product/casque-gaming-steelseries-arctis-7-263115__480.webp',
  'iPhone 14 Pro Max': 'https://www.1fotrade.com/ressources/site/img/product/iphone-14-pro-max-265423__480.webp',
  'Casque Sony WH-1000XM5': 'https://www.1fotrade.com/ressources/site/img/product/casque-sony-wh-1000xm5-263157__480.webp',
  'Enceinte JBL Flip 6': 'https://www.1fotrade.com/ressources/site/img/product/enceinte-jbl-flip-6-257654__480.webp',
  'Intel Core i7-14700KF (5,6 GHz) LGA 1700': 'https://www.1fotrade.com/ressources/site/img/product/intel-core-i7-14700kf-lga-1700-285234__480.webp',
  'PS4 Slim + Jeux': 'https://www.1fotrade.com/ressources/site/img/product/ps4-slim-jeu-inclus-274563__480.webp',
  'AMD Ryzen 9 7950X': 'https://www.1fotrade.com/ressources/site/img/product/amd-ryzen-9-7950x-284521__480.webp',
  'Intel Core i7-14700K': 'https://www.1fotrade.com/ressources/site/img/product/intel-core-i7-14700k-lga-1700-285231__480.webp',
  'Clavier Mécanique Logitech G Pro X': 'https://www.1fotrade.com/ressources/site/img/product/clavier-logitech-g-pro-x-258267__480.webp',
  'iPhone 13': 'https://www.1fotrade.com/ressources/site/img/product/iphone-13-265420__480.webp',
  'NVIDIA GeForce RTX 4060 Ti': 'https://www.1fotrade.com/ressources/site/img/product/nvidia-geforce-rtx-4060-ti-286123__480.webp',
  'AMD Ryzen 5 7600X (5,3 GHz) AM5': 'https://www.1fotrade.com/ressources/site/img/product/amd-ryzen-5-7600x-am5-284523__480.webp'
};

// Mettre à jour les produits avec les URLs connues
let updated = 0;
const productsToUpdate = [];

productsNeedingImages.forEach(product => {
  const knownUrl = knownProductUrls[product.name];

  if (knownUrl) {
    productsToUpdate.push({
      ...product,
      image: knownUrl
    });
    updated++;
  }
});

console.log(`✅ ${updated} URLs trouvées dans la base connue\n`);

if (updated > 0) {
  console.log('📋 Produits à mettre à jour:\n');
  productsToUpdate.slice(0, 10).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
    console.log(`   URL: ${p.image}`);
    console.log('');
  });

  // Mettre à jour le fichier products.json
  const allProducts = data.products.map(p => {
    const update = productsToUpdate.find(u => u.id === p.id);
    return update || p;
  });

  fs.writeFileSync('data/products.json', JSON.stringify({ products: allProducts }, null, 2));
  console.log(`💾 Fichier products.json mis à jour`);

  console.log(`\n⚠️  Note: Ces produits ont maintenant des URLs 1fotrade.`);
  console.log(`   Relancez le script download-original-images.js pour télécharger les images.`);
} else {
  console.log('❌ Aucune URL trouvée dans la base connue');
}

// Afficher les produits qui n'ont toujours pas d'image
const stillNoImage = productsNeedingImages.filter(p => !knownProductUrls[p.name]);
if (stillNoImage.length > 0) {
  console.log(`\n⚠️  ${stillNoImage.length} produits n'ont toujours pas d'image:\n`);
  stillNoImage.slice(0, 10).forEach((p, i) => {
    console.log(`${i+1}. ${p.name}`);
  });
}
