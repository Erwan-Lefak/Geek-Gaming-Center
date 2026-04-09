/**
 * Script pour extraire TOUS les produits du site Geek Gaming Center
 * Utilise une approche directe avec fetch et parsing HTML
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://store.geek-gaming-center.com';
const TOTAL_PAGES = 152;

// Mapping des catégories
const CATEGORY_MAP = {
  'Consoles': 'consoles',
  'Cartes Graphiques': 'pc-gaming',
  'Processeurs': 'pc-gaming',
  'Cartes Mères': 'pc-gaming',
  'Disque Dur': 'pc-gaming',
  'SSD': 'pc-gaming',
  'RAM': 'pc-gaming',
  'Mémoire': 'pc-gaming',
  'Stockage': 'pc-gaming',
  'Boitier': 'pc-gaming',
  'Alimentation': 'pc-gaming',
  'Refroidissement': 'pc-gaming',
  'Périphériques': 'accessoires',
  'Accessoires': 'accessoires',
  'Smartphones': 'goodies',
  'PC Bureautique': 'pc-gaming',
  'PC Gaming': 'pc-gaming',
  'Ecrans': 'pc-gaming',
  'Affichage': 'pc-gaming',
  'Réseau': 'pc-gaming',
};

function mapCategory(categoryText) {
  if (!categoryText) return 'pc-gaming';

  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (categoryText.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return 'pc-gaming';
}

function extractPrice(text) {
  // Cherche tous les prix au format "XX XXX FCFA"
  const matches = text.match(/(\d[\d\s]*)\s*FCFA/gi);
  if (matches && matches.length > 0) {
    // Prend le dernier prix (généralement le prix actuel)
    const price = matches[matches.length - 1].replace(/[^0-9]/g, '');
    return parseInt(price);
  }
  return null;
}

function fetchPage(pageNum) {
  return new Promise((resolve, reject) => {
    const url = pageNum === 1
      ? BASE_URL + '/'
      : `${BASE_URL}/page/${pageNum}/`;

    console.log(`📄 Page ${pageNum}/${TOTAL_PAGES}...`);

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      console.error(`   ❌ Erreur: ${err.message}`);
      resolve(null);
    });
  });
}

function parseProducts(html) {
  const products = [];

  // Le site est une app Next.js, on cherche les données dans le HTML
  // Cherche les produits avec différentes approches

  // 1. Cherche des patterns de produits dans le HTML
  // Format typique: <h3>Product Name</h3>...FCFA...

  // Split par les balises h2 ou h3 qui contiennent les noms de produits
  const productPattern = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
  const nameMatches = [...html.matchAll(productPattern)];

  for (const match of nameMatches) {
    const name = match[1].trim();

    // Cherche le contexte autour du nom (500 caractères)
    const start = Math.max(0, match.index - 200);
    const end = Math.min(html.length, match.index + 500);
    const context = html.substring(start, end);

    // Vérifie si ce contexte contient FCFA
    if (!context.includes('FCFA')) continue;

    const price = extractPrice(context);
    if (!price || price <= 0) continue;

    // Détermine le stock
    let stock = 5;
    if (context.toLowerCase().includes('rupture')) {
      stock = 0;
    } else if (context.toLowerCase().includes('en stock')) {
      stock = 5;
    }

    // Cherche la catégorie dans le contexte
    let category = 'pc-gaming';
    for (const [key, value] of Object.entries(CATEGORY_MAP)) {
      if (context.toLowerCase().includes(key.toLowerCase())) {
        category = value;
        break;
      }
    }

    // Crée le produit
    products.push({
      id: String(Math.abs(hashCode(name)) % 10000000),
      name,
      description: `${name} - ${stock > 0 ? 'En stock' : 'Rupture de stock'}`,
      price,
      category,
      stock,
      image: null,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return products;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

async function extractAllProducts() {
  console.log('='.repeat(70));
  console.log('🎮 EXTRACTION DES PRODUITS GEEK GAMING CENTER');
  console.log('='.repeat(70));
  console.log(`📊 Pages à scraper: ${TOTAL_PAGES}`);
  console.log(`🎯 Produits attendus: ~2268`);
  console.log('='.repeat(70));
  console.log(`🚀 Démarrage à ${new Date().toLocaleTimeString('fr-FR')}`);
  console.log('='.repeat(70));

  const allProducts = [];
  const startTime = Date.now();

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    const html = await fetchPage(page);

    if (!html) {
      console.log(`   ⚠️  Page ${page} non disponible`);
      continue;
    }

    const products = parseProducts(html);

    if (products.length > 0) {
      allProducts.push(...products);
      console.log(`   ✅ ${products.length} produits (Total: ${allProducts.length})`);
    } else {
      console.log(`   ⚠️  Aucun produit trouvé`);
    }

    // Sauvegarde intermédiaire toutes les 10 pages
    if (page % 10 === 0) {
      const backupFile = path.join(__dirname, 'data', `products_backup_page_${page}.json`);
      fs.writeFileSync(backupFile, JSON.stringify({ products: allProducts }, null, 2));

      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const avgTime = elapsed / page;
      const remaining = avgTime * (TOTAL_PAGES - page);
      console.log(`   💾 Sauvegarde: products_backup_page_${page}.json`);
      console.log(`   ⏱️  Temps: ${elapsed.toFixed(1)} min | Restant: ~${remaining.toFixed(1)} min`);
    }

    // Pause respectueuse
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Sauvegarde finale
  console.log('\n' + '='.repeat(70));
  console.log('✅ EXTRACTION TERMINÉE!');
  console.log('='.repeat(70));

  const outputFile = path.join(__dirname, 'data', 'gge_products_complete.json');
  fs.writeFileSync(outputFile, JSON.stringify({ products: allProducts }, null, 2));

  const elapsed = (Date.now() - startTime) / 1000 / 60;
  console.log(`📁 Fichier final: ${outputFile}`);
  console.log(`📊 Produits extraits: ${allProducts.length}`);
  console.log(`⏱️  Durée totale: ${elapsed.toFixed(1)} minutes`);

  // Statistiques
  if (allProducts.length > 0) {
    const prices = allProducts.filter(p => p.price > 0).map(p => p.price);

    if (prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      console.log('\n💰 STATISTIQUES DE PRIX:');
      console.log(`   Prix moyen: ${avgPrice.toFixed(0)} FCFA`);
      console.log(`   Prix min: ${minPrice.toLocaleString('fr-FR')} FCFA`);
      console.log(`   Prix max: ${maxPrice.toLocaleString('fr-FR')} FCFA`);
    }

    // Compter par catégorie
    const categories = {};
    allProducts.forEach(p => {
      const cat = p.category || 'Non catégorisé';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    console.log('\n📂 CATÉGORIES:');
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   • ${cat}: ${count} produits`);
      });
  }

  return allProducts;
}

// Exécution
extractAllProducts()
  .then(products => {
    console.log(`\n🎉 Extraction terminée! ${products.length} produits extraits.`);
  })
  .catch(err => {
    console.error(`\n❌ Erreur: ${err.message}`);
    process.exit(1);
  });
