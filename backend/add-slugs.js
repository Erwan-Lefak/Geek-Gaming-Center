/**
 * Add slugs to all products in products.json
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert a string to a URL-friendly slug
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Add slugs to products
 */
function addSlugs() {
  const productsPath = path.join(__dirname, 'data', 'products.json');
  const srcProductsPath = path.join(__dirname, '../src/lib/data/products.json');

  // Read products.json
  const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  // Track existing slugs to ensure uniqueness
  const existingSlugs = new Set();

  // Add slug to each product
  data.products = data.products.map(product => {
    let baseSlug = slugify(product.name);

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    existingSlugs.add(slug);

    return {
      ...product,
      slug
    };
  });

  // Write back to both files
  fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));
  fs.writeFileSync(srcProductsPath, JSON.stringify(data, null, 2));

  console.log(`✅ Added slugs to ${data.products.length} products`);
  console.log(`📝 Updated: backend/data/products.json`);
  console.log(`📝 Updated: src/lib/data/products.json`);

  // Show examples
  console.log('\n📋 Examples:');
  data.products.slice(0, 5).forEach(product => {
    console.log(`  - ${product.name}`);
    console.log(`    → /store/products/${product.slug}`);
  });
}

addSlugs();
