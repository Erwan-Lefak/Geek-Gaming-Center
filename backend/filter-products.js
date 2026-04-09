/**
 * Filter products to ~50 per category based on GGC 2025 report
 * Priority: Products from report > Featured > With images > Others
 */

const fs = require('fs');
const path = require('path');

// Read products.json
const productsPath = path.join(__dirname, 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Products mentioned in the 2025 report (DESCENTE RÉELLE GGC)
// These are the ACTUAL products GGC received and should sell
const reportProducts = [
  // GPU from report
  'RTX 5060', 'RTX 5070', 'RTX 3060', 'RTX 3070', 'RTX 4070', 'RTX 4060',
  'GTX 1070', 'GTX 1660 Ti', 'RTX 2060', 'RTX 5050',
  'RX 580', 'RTX 5060 Ti', 'RTX 5070 Ti',
  // CPU
  'i7-14700KF', 'i7-14700K', 'i5-14400F', 'i5-12400F',
  'Ryzen 7 7700', 'Ryzen 5 7600X', 'Ryzen 5 5600X',
  'i7 6700k', 'i5 4790', 'Pentium',
  // Motherboards
  'Asus TUF B760-Plus WiFi', 'Asus TUF B760M-BTF WiFi',
  'Asus TUF B450M-Plus II', 'Asus TUF B450-Plus II',
  'MSI Pro B760M-P', 'MSI Pro B760-P WiFi',
  'MSI B650M Gaming Plus WiFi', 'Gigabyte B650 Eagle AX',
  'z170', 'z290', 'z390',
  // RAM
  'Corsair Vengeance RGB 32GB DDR5 5200',
  'Corsair Vengeance RGB 32GB DDR5 5600',
  'DDR4 3000Mhz Corsair', 'DDR4 Hyper X', 'Crucial', 'G-Skill',
  // SSD
  'Lexar NQ100 512Go', 'Lexar NQ790 2To',
  'PNY CS900 1To', 'Verbatim Vi560 S3 512Go', 'Verbatim Vi3000 1To',
  'Silicon Power A60 1TB', 'Crucial P3 Plus 2TB',
  'SSD 240 Go', 'SSD 120 Go', 'SSD M2 Nvme 256Go', 'SSD M2 Nvme 480 Go',
  // Cooling
  'MSI MAG CoreLiquid A13 RGB 360mm',
  'Watercooling Xigmatek Connect RGB 360mm',
  'Jonsbo CR-1400 Evo RGB', 'Jonsbo CR-1400 DV2 RGB',
  'Thermaltake UX200 SE RGB', 'Arctic MX-4',
  // Consoles
  'PS5 Slim', 'PS5 Digitale', 'PS4 Slim', 'PS4 Pro', 'PS4 Fat', 'Xbox Series X',
  // Accessories
  'Manette Ps5', 'Manettes PS5',
  'Volant Logitech G29', 'Pistolets Oculus VR',
  'Asus PCE-AX1800', 'TP-Link TL-WN881ND',
  'Projecteur LCD',
];

// Maximum products per category
const MAX_PER_CATEGORY = 50;

// Priority score function
function getPriorityScore(product) {
  let score = 0;

  // 1. From 2025 report (highest priority)
  const inReport = reportProducts.some(keyword => {
    const regex = new RegExp(keyword, 'i');
    return regex.test(product.name);
  });
  if (inReport) score += 1000;

  // 2. Featured flag
  if (product.featured) score += 100;

  // 3. Has image installed
  if (product.image) {
    // Check if image file exists in public/products-images/
    const imageId = product.image.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/, '');
    const imagePath = path.join(__dirname, '../../public/products-images', imageId + '.*');
    try {
      const files = require('fs').readdirSync(path.join(__dirname, '../../public/products-images'));
      const hasImage = files.some(f => f.startsWith(imageId));
      if (hasImage) score += 50;
    } catch (e) {
      // Directory doesn't exist yet, ignore
    }
  }

  // 4. Stock availability
  if (product.stock > 0) score += 10;

  // 5. Price (higher price = premium product)
  score += Math.min(product.price / 10000, 10); // Max +10 points

  return score;
}

// Filter products by category
const filteredData = { products: [] };

for (const category of ['composants-pc', 'peripheriques-gaming', 'accessoires-pc', 'ordinateurs', 'consoles', 'smartphones-tablettes', 'goodies', 'logiciels']) {
  const categoryProducts = data.products.filter(p => p.category === category);

  // Add priority score
  const scoredProducts = categoryProducts.map(p => ({
    ...p,
    _priorityScore: getPriorityScore(p),
  }));

  // Sort by priority score (descending)
  scoredProducts.sort((a, b) => b._priorityScore - a._priorityScore);

  // Keep top MAX_PER_CATEGORY
  const topProducts = scoredProducts.slice(0, MAX_PER_CATEGORY);

  // Remove priority score field
  const finalProducts = topProducts.map(({ _priorityScore, ...p }) => p);

  filteredData.products.push(...finalProducts);

  console.log(`${category}: ${finalProducts.length}/${categoryProducts.length} kept`);

  // Show top 5 for debugging
  console.log(`  Top 5: ${finalProducts.slice(0, 5).map(p => p.name.substring(0, 40)).join(' | ')}`);
}

// Save filtered products
const backupPath = path.join(__dirname, 'data', 'products-backup.json');
fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
console.log(`\n✅ Backup saved to: ${backupPath}`);

fs.writeFileSync(productsPath, JSON.stringify(filteredData, null, 2));
console.log(`✅ Filtered products saved to: ${productsPath}`);

console.log(`\n=== Summary ===`);
console.log(`Original products: ${data.products.length}`);
console.log(`Filtered products: ${filteredData.products.length}`);
console.log(`Products removed: ${data.products.length - filteredData.products.length}`);
