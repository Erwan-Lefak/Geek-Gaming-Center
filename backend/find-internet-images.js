const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les produits
const data = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

console.log('🔍 RECHERCHE D\'IMAGES CORRESPONDANTES SUR INTERNET\n');
console.log('='.repeat(70));

// Produits sans images valides
const productsNeedingImages = data.products.filter(p =>
  !p.image || p.image === 'N/A'
);

console.log(`📊 ${productsNeedingImages.length} produits sans images\n`);

// Créer le dossier images
const imagesDir = path.join(__dirname, '../public/products-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Fonction pour télécharger une image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : https;

    const timeout = 10000; // 10 secondes timeout
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeout);

    lib.get(url, (response) => {
      clearTimeout(timeoutId);

      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });

        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error(`Status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}

// Extraire les mots-clés du produit
function extractKeywords(productName) {
  const name = productName.toLowerCase();

  // Marques connues
  const brands = ['logitech', 'razer', 'corsair', 'steelseries', 'hyperx', 'sony', 'jbl',
                  'samsung', 'apple', 'iphone', 'asus', 'msi', 'gigabyte', 'amd', 'intel',
                  'nvidia', 'tp-link', 'netgear', 'dell', 'hp', 'epson', 'canon', 'kingston',
                  'lexar', 'sandisk', 'seagate', 'western digital', 'wd', 'tokyo', 'jonsbo',
                  'noctua', 'be quiet', 'cooler master', 'nzxt', 'lg', 'microsoft', 'xbox',
                  'nintendo', 'playstation', 'ps5', 'ps4', 'switch', 'spotify', 'amazon',
                  'google', 'baseus', 'oraimo', 'pny', 'zotac', 'asrock', 'msi'];

  // Types de produits
  const types = {
    'souris': 'gaming mouse',
    'clavier': 'gaming keyboard mechanical',
    'casque': 'gaming headset headphones',
    'enceinte': 'speaker bluetooth portable',
    'jbl': 'jbl speaker bluetooth',
    'microphone': 'microphone',
    'manette': 'gamepad controller',
    'écran': 'gaming monitor',
    'ecran': 'gaming monitor',
    'monitor': 'gaming monitor',
    'pc': 'gaming pc computer',
    'ordinateur': 'laptop computer',
    'laptop': 'laptop',
    'carte graphique': 'graphics card gpu',
    'gpu': 'graphics card',
    'rtx': 'nvidia rtx graphics card',
    'radeon': 'amd radeon graphics card',
    'processeur': 'cpu processor',
    'cpu': 'processor cpu',
    'intel core': 'intel processor',
    'amd ryzen': 'amd ryzen processor',
    'ram': 'ram memory ddr4',
    'mémoire': 'ram memory',
    'ssd': 'ssd hard drive',
    'disque dur': 'hard drive hdd',
    'carte mère': 'motherboard',
    'alimentation': 'power supply psu',
    'boitier': 'pc case',
    'ventirad': 'cpu cooler fan',
    'watercooling': 'water cooler aio',
    'ps5': 'playstation 5 console',
    'ps4': 'playstation 4 console',
    'xbox': 'xbox console',
    'switch': 'nintendo switch',
    'iphone': 'iphone smartphone',
    'samsung galaxy': 'samsung galaxy smartphone',
    'smartphone': 'smartphone phone',
    'tablette': 'tablet',
    'imprimante': 'printer',
    'scanner': 'scanner',
    'routeur': 'wifi router',
    'switch réseau': 'network switch',
    'adaptateur': 'adapter usb',
    'cable': 'cable usb',
    'webcam': 'webcam camera',
    'micro': 'microphone',
    'batterie': 'battery external power bank',
    'power bank': 'power bank portable charger',
    'hub usb': 'usb hub',
    'disque dur externe': 'external hard drive',
    'ssd externe': 'external ssd',
    'lecteur dvd': 'dvd drive',
    'graveur': 'dvd burner',
    'mini pc': 'mini computer',
    'all in one': 'all in one pc',
    'moniteur': 'monitor',
    'tv': 'television',
    'projecteur': 'projector',
    'enceinte bluetooth': 'bluetooth speaker',
    'casque bluetooth': 'bluetooth headphones',
    'écouteurs': 'earbuds headphones',
    'airpods': 'airpods earbuds',
    'tablette graphique': 'graphics tablet',
    'stylet': 'stylus pen',
    'clé usb': 'usb flash drive',
    'carte sd': 'sd card memory',
    'disque': 'hard drive',
    'ram ddr4': 'ram ddr4 memory',
    'ram ddr5': 'ram ddr5 memory',
    'wifi': 'wifi adapter',
    'carte wifi': 'wifi card',
    'carte réseau': 'network card lan',
    'refroidisseur': 'laptop cooler',
    'stand': 'laptop stand',
    'support': 'stand mount',
    'bras': 'monitor arm',
    'lampe': 'desk lamp led',
    'ventilateur': 'fan case',
    'lumière led': 'led light strip rgb',
    'tapis': 'mouse pad desk',
    'chaise': 'gaming chair',
    'bureau': 'desk computer',
    'rack': 'server rack',
    'nas': 'nas storage',
    'raid': 'raid controller'
  };

  // Trouver le type de produit
  let productType = null;
  for (const [keyword, type] of Object.entries(types)) {
    if (name.includes(keyword)) {
      productType = type;
      break;
    }
  }

  // Trouver la marque
  let brand = null;
  for (const b of brands) {
    if (name.includes(b)) {
      brand = b;
      break;
    }
  }

  // Construire la recherche
  const searchTerms = [];

  if (productType) {
    searchTerms.push(productType);
  }

  if (brand) {
    searchTerms.push(brand);
  }

  // Si pas de type trouvé, utiliser des mots du nom
  if (searchTerms.length === 0) {
    // Extraire les mots significatifs
    const significantWords = name.split(/[\s\(\)\-\+]+/).filter(word =>
      word.length > 2 &&
      !['noir', 'blanc', 'rouge', 'bleu', 'vert', 'gris', 'rose', 'or', 'argent',
        'gb', 'go', 'tb', 'to', 'mhz', 'ghz', 'ddr', 'usb', 'wifi', 'bt', 'fps',
        'pour', 'avec', 'sans', 'plus', 'max', 'pro', 'ultra', 'super', 'extreme',
        'gaming', 'game', 'player', 'edition', 'version', 'pack', 'kit', 'lot',
        'inch', 'pouces', "27", '24', '32', '15', '14', '13'].includes(word)
    );

    searchTerms.push(...significantWords.slice(0, 3));
  }

  return searchTerms.join(' ');
}

// URLs d'images alternatives basées sur des correspondances précises
const alternativeImageURLs = {
  'Souris Gaming Logitech G Pro X Superlight': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c3967?w=400',
  'Casque Gaming SteelSeries Arctis 7+': 'https://images.unsplash.com/photo-1599319234526-3e5468672bd0?w=400',
  'iPhone 14 Pro Max': 'https://images.unsplash.com/photo-1678652197835-62aeb33c5bb5?w=400',
  'iPhone 13': 'https://images.unsplash.com/photo-1632633173522-47456de71b76?w=400',
  'iPhone 11': 'https://images.unsplash.com/photo-1574144615846-46eba3d1935c?w=400',
  'Casque Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  'Enceinte JBL Flip 6': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'Intel Core i7': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'AMD Ryzen 9': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'AMD Ryzen 7': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'AMD Ryzen 5': 'https://images.unsplash.com/photo-1555617981-6ab11b264faa?w=400',
  'PS4': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'PS5': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
  'Xbox Series X': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
  'Nintendo Switch': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
  'Clavier Mécanique': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  'RTX 4060': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'RTX 4070': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'RTX 5060': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'RTX 5070': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'RTX 7900': 'https://images.unsplash.com/photo-1591489188760-0cef4fc1a886?w=400',
  'Écran ASUS ROG': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  'AirPods': 'https://images.unsplash.com/photo-1600294037681-c80b4cb4b534?w=400',
  'Amazon Echo': 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400',
  'Batterie externe': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
  'Hub USB': 'https://images.unsplash.com/photo-1625952451185-36a8af9a4af4?w=400',
  'Adaptateur USB': 'https://images.unsplash.com/photo-1625952451185-36a8af9a4af4?w=400',
  'Imprimante HP': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa3?w=400',
  'Imprimante Epson': 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa3?w=400',
  'Routeur TP-Link': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
  'SSD NVMe': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'SSD SATA': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'Ventirad': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'Watercooling': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
  'Carte mère': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  'Alimentation': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'Boitier PC': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'RAM DDR4': 'https://images.unsplash.com/photo-1562976540-150ccc683583d?w=400',
  'RAM DDR5': 'https://images.unsplash.com/photo-1562976540-150ccc683583d?w=400',
  'Webcam': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
  'Microphone': 'https://images.unsplash.com/photo-1519137684922-19f842a29927?w=400',
  'Enceinte Bluetooth': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  'Écouteurs': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  'Tablette': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
  'Laptop': 'https://images.unsplash.com/photo-1593642632823-8f785ba63604?w=400',
  'Mini PC': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  'All in One': 'https://images.unsplash.com/photo-1593642632550-8c9d7d6b9787?w=400',
  'Disque dur externe': 'https://images.unsplash.com/photo-1597852153241-4494772f835d?w=400',
  'Clé USB': 'https://images.unsplash.com/photo-1625952451185-36a8af9a4af4?w=400',
  'Carte SD': 'https://images.unsplash.com/photo-1606057185556-c6c81cd6dd81?w=400',
  'Chaise gaming': 'https://images.unsplash.com/photo-1598550486199-7b223ca9b5b7?w=400',
  'Bureau': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
  'Lampe LED': 'https://images.unsplash.com/photo-1565814636199-ae8133055c1f?w=400',
  'Support écran': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  'Tapis souris': 'https://images.unsplash.com/photo-1573328280209-a7a460d5b93a?w=400',
  'Lecteur DVD': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
};

async function findImageForProduct(product) {
  const name = product.name;

  // D'abord, vérifier les correspondances exactes
  for (const [key, url] of Object.entries(alternativeImageURLs)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return url;
    }
  }

  // Sinon, essayer Unsplash avec des mots-clés
  const keywords = extractKeywords(name);
  if (keywords) {
    return `https://source.unsplash.com/400x400/?${encodeURIComponent(keywords)}&sig=${product.id.substring(0, 8)}`;
  }

  return null;
}

async function downloadImages() {
  let downloaded = 0;
  let failed = 0;
  const errors = [];

  console.log('⬇️  Téléchargement des images...\n');

  const updatedProducts = await Promise.all(productsNeedingImages.map(async (product) => {
    const imageUrl = await findImageForProduct(product);

    if (!imageUrl) {
      return product;
    }

    // Déterminer l'extension
    let ext = '.jpg';
    if (imageUrl.includes('.png')) ext = '.png';
    else if (imageUrl.includes('.webp')) ext = '.webp';

    const filename = `${product.id}${ext}`;
    const filepath = path.join(imagesDir, filename);
    const localPath = `/products-images/${filename}`;

    // Télécharger si elle n'existe pas
    if (!fs.existsSync(filepath)) {
      try {
        await downloadImage(imageUrl, filepath);

        // Vérifier que le fichier n'est pas un fichier HTML (erreur 404)
        const stats = fs.statSync(filepath);
        if (stats.size < 5000) {
          // Fichier trop petit, probablement une erreur
          fs.unlinkSync(filepath);
          throw new Error('Fichier trop petit (probablement HTML)');
        }

        downloaded++;
        console.log(`✅ ${product.name.substring(0, 45)}`);
        return { ...product, image: localPath };
      } catch (err) {
        failed++;
        if (failed <= 10) {
          errors.push({ name: product.name, error: err.message });
        }
        return product; // Garder N/A
      }
    } else {
      downloaded++;
      return { ...product, image: localPath };
    }
  }));

  console.log(`\n\n✅ Terminé!\n`);

  console.log('📊 Statistiques:');
  console.log(`   ✅ Images téléchargées: ${downloaded}`);
  console.log(`   ❌ Échecs: ${failed}`);

  if (errors.length > 0) {
    console.log(`\n❌ Erreurs (${errors.length}):`);
    errors.forEach((err, i) => {
      console.log(`   ${i+1}. ${err.name.substring(0, 40)} - ${err.error}`);
    });
  }

  // Mettre à jour les produits
  const allProducts = data.products.map(p => {
    const updated = updatedProducts.find(up => up.id === p.id);
    return updated || p;
  });

  fs.writeFileSync('data/products.json', JSON.stringify({ products: allProducts }, null, 2));

  console.log(`\n💾 Fichier products.json mis à jour`);

  // Vérifier les produits demandés
  const testProducts = [
    'Souris Gaming Logitech G Pro X Superlight',
    'Casque Gaming SteelSeries Arctis 7+',
    'iPhone 14 Pro Max',
    'Casque Sony WH-1000XM5',
    'Enceinte JBL Flip 6'
  ];

  console.log(`\n📋 État des produits demandés:\n`);
  testProducts.forEach(name => {
    const p = allProducts.find(prod => prod.name === name);
    if (p) {
      const hasImage = p.image && p.image.startsWith('/products-images/');
      console.log(`${hasImage ? '✅' : '❌'} ${name}`);
    }
  });
}

// Lancer
downloadImages().catch(console.error);
