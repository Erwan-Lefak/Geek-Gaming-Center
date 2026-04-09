const data = require('./data/products.json');

console.log('📊 ÉTAT FINAL DES PRODUITS\n');
console.log('='.repeat(70));

const products = [
  'Souris Gaming Logitech G Pro X Superlight',
  'Casque Gaming SteelSeries Arctis 7+',
  'iPhone 14 Pro Max',
  'Casque Sony WH-1000XM5',
  'Enceinte JBL Flip 6'
];

console.log('Produits demandés:\n');
products.forEach(name => {
  const p = data.products.find(prod => prod.name === name);
  if (p) {
    const hasImage = p.image && p.image !== 'N/A';
    console.log(`${hasImage ? '✅' : '❌'} ${p.name}`);
  }
});

const withImages = data.products.filter(p => p.image && p.image !== 'N/A').length;
const withIcons = data.products.filter(p => !p.image || p.image === 'N/A').length;

console.log(`\n📊 Statistiques globales:`);
console.log(`   📦 Total produits: ${data.products.length}`);
console.log(`   🖼️  Avec images: ${withImages} (${Math.round(withImages/data.products.length*100)}%)`);
console.log(`   🎨 Avec icônes: ${withIcons} (${Math.round(withIcons/data.products.length*100)}%)`);

// Vérifier les produits avec icônes (ce qui reste)
const productsWithIcons = data.products.filter(p => !p.image || p.image === 'N/A').slice(0, 10);
if (productsWithIcons.length > 0) {
  console.log(`\n📋 Exemples de produits avec icônes (${productsWithIcons.length} restants):`);
  productsWithIcons.forEach((p, i) => {
    console.log(`   ${i+1}. ${p.name.substring(0, 50)}`);
  });
}
