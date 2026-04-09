const https = require('https');
const fs = require('fs');
const path = require('path');

function mapCategory(cat) {
  if (!cat) return 'pc-gaming';
  const c = cat.toLowerCase();
  if (c.includes('consoles')) return 'consoles';
  if (c.includes('pc') || c.includes('processeur') || c.includes('carte') ||
      c.includes('ram') || c.includes('ssd') || c.includes('stockage') ||
      c.includes('boitier') || c.includes('alimentation') || c.includes('ecran')) return 'pc-gaming';
  if (c.includes('peripherique') || c.includes('accessoire')) return 'accessoires';
  if (c.includes('smartphone') || c.includes('telephone')) return 'goodies';
  return 'pc-gaming';
}

console.log('🔄 Fetching all products from API...');

https.get('https://store.geek-gaming-center.com/api/products', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log('✅ Fetched', products.length, 'products');

      // Map to our format
      const mapped = products.map((p, i) => ({
        id: p.id || String(i),
        name: p.name || 'Unknown',
        description: p.description || p.name || 'Produit',
        price: parseInt(p.price) || 0,
        category: mapCategory(p.category),
        stock: 5,
        image: p.imageUrl || p.image || null,
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Save to file
      const outputDir = path.join(__dirname, 'data');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = path.join(outputDir, 'gge_products_complete.json');
      fs.writeFileSync(outputFile, JSON.stringify({ products: mapped }, null, 2));
      console.log('💾 Saved to', outputFile);

      // Stats
      const categories = {};
      mapped.forEach(p => {
        categories[p.category] = (categories[p.category] || 0) + 1;
      });

      console.log('\n📂 Categories:');
      Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
          console.log('  •', cat + ':', count);
        });

      console.log('\n🎉 Done!');

    } catch (e) {
      console.error('Error:', e.message);
      console.error(e.stack);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
