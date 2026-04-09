const originalData = require('./data/gge_products_complete.json');

// Compter les types d'URLs
const httpUrls = originalData.products.filter(p => p.image && p.image.startsWith('http')).length;
const assetUrls = originalData.products.filter(p => p.image && p.image.startsWith('/assets/')).length;
const naUrls = originalData.products.filter(p => !p.image || p.image === 'N/A').length;

console.log('📊 Types d\'images dans gge_products_complete.json:');
console.log('   URLs HTTP (1fotrade):', httpUrls);
console.log('   Paths /assets/:', assetUrls);
console.log('   N/A:', naUrls);

// Afficher quelques exemples de chaque type
console.log('\n📋 Exemples de URLs HTTP:');
originalData.products.filter(p => p.image && p.image.startsWith('http')).slice(0, 3).forEach((p, i) => {
  console.log(`${i+1}. ${p.name.substring(0, 40)}`);
  console.log(`   ${p.image}`);
  console.log('');
});

console.log('\n📋 Exemples de paths /assets/:');
originalData.products.filter(p => p.image && p.image.startsWith('/assets/')).slice(0, 3).forEach((p, i) => {
  console.log(`${i+1}. ${p.name.substring(0, 40)}`);
  console.log(`   ${p.image}`);
  console.log('');
});
