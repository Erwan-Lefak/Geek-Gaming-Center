const data = require('./data/products.json');

// Vérifier quelques produits
const products = [
  'Souris Gaming Logitech G Pro X Superlight',
  'Intel Core i7-14700KF (5,6 GHz) LGA 1700',
  'Enceinte JBL Flip 6'
];

products.forEach(name => {
  const p = data.products.find(prod => prod.name === name);
  if (p) {
    console.log('📦', p.name);
    console.log('   Image:', p.image);
    console.log('');
  }
});

// Compter les types
const unsplash = data.products.filter(p => p.image && p.image.includes('unsplash')).length;
const fotrade = data.products.filter(p => p.image && p.image.includes('1fotrade')).length;
const na = data.products.filter(p => !p.image || p.image === 'N/A').length;

console.log('📊 Stats:');
console.log('   Unsplash:', unsplash);
console.log('   1fotrade:', fotrade);
console.log('   N/A:', na);
