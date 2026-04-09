/**
 * Script to recategorize products from the old pc-gaming dump into proper categories
 */

const fs = require('fs');
const path = require('path');

// Read products.json
const productsPath = path.join(__dirname, 'data', 'products.json');
const data = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Category mapping rules (ORDER MATTERS! More specific first)
const categoryRules = {
  'ordinateurs': [
    // Desktops - Must be BEFORE 'composants-pc' to catch complete PCs
    /Unit[ié]s*?\s+(Centrale|Centrale\s*Gaming)/i,
    /PC\s+(Gaming|Fixe)/i,
    // Mini PCs - Must be BEFORE 'composants-pc' to catch complete mini PCs
    /Mini\s+PC/i,
    /Barebone/i,
    /NUC/i,
    /Pandora/i,
    // All-in-One
    /All\s+In\s+One/i,
    /\bAIO\b/i,
    /Aspire\s+C\d+/i,
  ],
  'composants-pc': [
    // Processors
    /\b(Intel\s+(Core|i3|i5|i7|i9)|AMD\s+Ryron|CPU)\b/i,
    /\bRyzen\s+\d/i,
    /\bLGA\s*\d+\b/i,
    /\bAM\d+\b/i,
    // Motherboards
    /\b(Carte mère|Motherboard)\b/i,
    /\bGigabyte\s+(B|Z|X)\d+/i,
    /\bAsus\s+(TUF|Prime|ROG)/i,
    /\bMSI\s+[BZ]\d+/i,
    // RAM
    /\b(DDR|RAM|Memory)\b/i,
    /\bGo\s+DDR/i,
    // GPU
    /\b(GeForce|RTX|GTX|RX)\b/i,
    /\bNVIDIA\b/i,
    /\bAMD\s*Radeon\b/i,
    /\bCarte\s+graphique\b/i,
    // Storage
    /\b(SSD|HDD|NVMe|M\.2|SATA)\b/i,
    /\b(Lexar|PNY)\s+\d+Go/i,
    // Cases & Cooling
    /\bBoitier\b/i,
    /\bWatercooling\b/i,
    /\bRefroidissement\b/i,
    // Raspberry Pi boards only (not complete systems)
    /\bRaspberry\s+Pi\s+\d/i,
  ],
  'peripheriques-gaming': [
    // Mice
    /\bSouris/i,
    // Keyboards
    /\bClavier/i,
    // Headsets
    /\b(Casque|Headset|Arctis)\b/i,
    // Speakers
    /\b(Enceinte|Barre de son).*\b(Gaming|RGB|Mars|Spirit of Gamer|Havit)\b/i,
    // Gaming Accessories
    /\b(Tapis de souris|Support|Manette|Volant)\b/i,
  ],
  'consoles': [
    /\bPS[34-6]\b/i,
    /\bPlayStation\b/i,
    /\bXbox\b/i,
    /\bNintendo\b/i,
    /\bSwitch\b/i,
    /\bConsole\s+de\s+(streaming|jeux)/i,
  ],
  'accessoires-pc': [
    // Hubs
    /\bHub\s+USB\b/i,
    // Cables & Adapters
    /\b(Câble|Splitter|Adaptateur|Détrompeur)\b/i,
    // Accessories
    /\b(Support|Sacoche|Batterie|Extension)\b/i,
    // Peripherals
    /\b(Imprimante|Lecteur|Cartouche)\b/i,
    // Office equipment
    /\b(Enceinte|Colonne)\s+(T'nB|Office|Esperanza|Trust)\b/i,
    // Cleaning
    /\b(Spray|Nettoyant|Bombe)\b/i,
  ],
  'smartphones-tablettes': [
    /\biPhone\s*\d+/i,
    /\biPad\b/i,
    /\bTablette\b/i,
    /\b(AirPods|Écouteurs)\b/i,
    /\bStylet\b/i,
    /\bEtui\b/i,
  ],
  'goodies': [
    /\bGoodie\b/i,
    /\bWarhammer\b/i,
    /\bJeu\s+(de\s+)?société\b/i,
    /\b(Puzzle|Perplexus)\b/i,
  ],
  'logiciels': [
    /\b(Bitdefender|Norton|Kaspersky|Windows)\b/i,
    /\bAntivirus\b/i,
    /\bSécurité\b/i,
    /\bLicence\b/i,
  ],
};

/**
 * Determine category for a product based on its name and description
 */
function determineCategory(product) {
  const name = product.name || '';
  const description = product.description || '';
  const combined = `${name} ${description}`.toLowerCase();

  // Check each category rule
  for (const [category, rules] of Object.entries(categoryRules)) {
    for (const rule of rules) {
      if (rule.test(name) || rule.test(description)) {
        return category;
      }
    }
  }

  // Default: keep original category if it's valid, otherwise classify as accessoires-pc
  const validCategories = [
    'composants-pc',
    'peripheriques-gaming',
    'ordinateurs',
    'consoles',
    'accessoires-pc',
    'smartphones-tablettes',
    'goodies',
    'logiciels',
  ];

  if (validCategories.includes(product.category)) {
    return product.category;
  }

  return 'accessoires-pc'; // Default fallback
}

// Recategorize all products
let recategorizedCount = 0;
const categoryStats = {};

data.products.forEach((product) => {
  const oldCategory = product.category;
  const newCategory = determineCategory(product);

  if (oldCategory !== newCategory) {
    product.category = newCategory;
    recategorizedCount++;
  }

  // Track stats
  categoryStats[newCategory] = (categoryStats[newCategory] || 0) + 1;
});

// Save updated products.json
fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

// Print statistics
console.log('=== Recategorization Complete ===\n');
console.log(`Total products: ${data.products.length}`);
console.log(`Recategorized: ${recategorizedCount}\n`);
console.log('=== Category Distribution ===');
Object.entries(categoryStats)
  .sort(([, a], [, b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
  });
