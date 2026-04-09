const currentData = require('./data/products.json');

const localImages = currentData.products.filter(p => p.image && p.image.startsWith('/products-images/')).length;
const na = currentData.products.filter(p => !p.image || p.image === 'N/A').length;

console.log('📊 État actuel des produits:');
console.log('   ✅ Produits avec images locales:', localImages);
console.log('   ❌ Produits sans image (icône):', na);
console.log('   📦 Total:', currentData.products.length);

// Afficher quelques exemples de produits avec images
console.log('\n📋 5 produits avec images téléchargées:\n');
currentData.products.filter(p => p.image && p.image.startsWith('/products-images/')).slice(0, 5).forEach((p, i) => {
  console.log(`${i+1}. ${p.name.substring(0, 50)}`);
  console.log(`   Image: ${p.image}`);
  console.log('');
});
