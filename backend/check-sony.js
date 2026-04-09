const data = require('./data/products.json');

// Trouver le produit Casque Sony WH-1000XM5
const sony = data.products.find(p => p.name.includes('Sony WH-1000XM5'));

if (sony) {
  console.log('🎧 Produit Casque Sony WH-1000XM5:');
  console.log(`   Nom: ${sony.name}`);
  console.log(`   Image: ${sony.image}`);
  console.log(`   Catégorie: ${sony.category}`);
} else {
  console.log('❌ Produit non trouvé');
}

// Compter les images par type
const unsplash = data.products.filter(p => p.image && p.image.includes('unsplash')).length;
const externes = data.products.filter(p => p.image && p.image.includes('1fotrade')).length;
const locales = data.products.filter(p => p.image && p.image.startsWith('/products-')).length;

console.log('\n📊 Répartition des images:');
console.log(`   Unsplash (thématiques): ${unsplash}`);
console.log(`   1fotrade (vraies photos): ${externes}`);
console.log(`   Locales: ${locales}`);
console.log(`   Sans image/N/A: ${data.products.length - unsplash - externes - locales}`);

// Montrer 5 produits avec images Unsplash
console.log('\n🖼️  Exemples de produits avec images Unsplash:');
const sampleUnsplash = data.products.filter(p => p.image && p.image.includes('unsplash')).slice(0, 5);
sampleUnsplash.forEach((p, i) => {
  console.log(`\n${i+1}. ${p.name}`);
  console.log(`   ${p.image}`);
});
