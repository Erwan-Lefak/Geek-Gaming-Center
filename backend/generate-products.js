const fs = require('fs');
const path = require('path');

const products = [
  // Cartes Graphiques
  { id: "1", name: "Carte Graphique Nvidia RTX 3060 12GB (Occas)", description: "Carte graphique Nvidia RTX 3060 12GB d'occasion", price: 117900, category: "pc-gaming", stock: 1 },
  { id: "2", name: "Carte Graphique AMD Radeon RX 7600 8GB", description: "Carte graphique AMD Radeon RX 7600 8GB", price: 163095, category: "pc-gaming", stock: 2 },
  { id: "3", name: "Carte Graphique Nvidia RTX 4070 Super 12GB", description: "Carte graphique Nvidia RTX 4070 Super 12GB", price: 425095, category: "pc-gaming", stock: 1 },
  { id: "4", name: "Carte Graphique Nvidia RTX 4080 Super 16GB", description: "Carte graphique Nvidia RTX 4080 Super 16GB", price: 654345, category: "pc-gaming", stock: 2 },
  
  // Kits PC
  { id: "5", name: "Kit PC Gamer Intel i5-12400F / RTX 3060 / 16GB RAM", description: "Kit PC complet avec Intel i5-12400F, RTX 3060 et 16GB RAM", price: 457845, category: "pc-gaming", stock: 1 },
  { id: "6", name: "Kit PC Gamer Intel i7-13700K / RTX 4070 / 32GB RAM", description: "Kit PC haut de gamme avec Intel i7-13700K, RTX 4070 et 32GB RAM", price: 1112845, category: "pc-gaming", stock: 1 },
  { id: "7", name: "Kit PC Gamer AMD Ryzen 7 7800X3D / RX 7900 XT / 32GB RAM", description: "Kit PC ultra gaming avec AMD Ryzen 7 7800X3D, RX 7900 XT et 32GB RAM", price: 1440345, category: "pc-gaming", stock: 1 },
  { id: "8", name: "Kit PC Gamer Intel i9-14900K / RTX 4090 / 64GB RAM", description: "Kit PC extrême avec Intel i9-14900K, RTX 4090 et 64GB RAM", price: 2815845, category: "pc-gaming", stock: 1, featured: true },
  { id: "9", name: "Kit PC Gaming Intel i5-14400F / RTX 4060 Ti / 16GB RAM", description: "Kit PC gaming Intel i5-14400F, RTX 4060 Ti, 16GB RAM", price: 654345, category: "pc-gaming", stock: 2 },
  
  // SSD
  { id: "10", name: "SSD 500GB NVMe M.2", description: "Disque SSD NVMe M.2 500GB haute performance", price: 29475, category: "pc-gaming", stock: 3 },
  { id: "11", name: "SSD 1TB NVMe M.2 PCIe 4.0", description: "Disque SSD NVMe M.2 PCIe 4.0 1TB ultra rapide", price: 51745, category: "pc-gaming", stock: 5 },
  { id: "12", name: "SSD 2TB NVMe M.2 PCIe 5.0", description: "Disque SSD NVMe M.2 PCIe 5.0 2TB ultra haute performance", price: 123795, category: "pc-gaming", stock: 3 },
  { id: "13", name: "SSD 4TB NVMe M.2 PCIe 5.0", description: "Disque SSD NVMe M.2 PCIe 5.0 4TB ultra haute capacité", price: 261345, category: "pc-gaming", stock: 2 },
  
  // RAM
  { id: "14", name: "RAM DDR4 16Go (2x8Go) 3200MHz", description: "Kit mémoire RAM DDR4 16Go (2x8Go) 3200MHz", price: 22925, category: "pc-gaming", stock: 2 },
  { id: "15", name: "RAM DDR5 32Go (2x16Go) 6000MHz", description: "Kit mémoire RAM DDR5 32Go (2x16Go) 6000MHz", price: 84495, category: "pc-gaming", stock: 4 },
  
  // Consoles
  { id: "16", name: "Console PS5 (Edition Standard)", description: "Console PlayStation 5 Edition Standard", price: 326845, category: "consoles", stock: 2, featured: true },
  { id: "17", name: "Console Nintendo Switch OLED", description: "Console Nintendo Switch OLED avec écran 7 pouces", price: 228595, category: "consoles", stock: 2, featured: true },
  { id: "18", name: "Console Nintendo Switch 2 (Précommande)", description: "Console Nintendo Switch 2 - Précommande", price: 261345, category: "consoles", stock: 4, featured: true },
  
  // Accessoires Consoles
  { id: "19", name: "Manette PS5 DualSense", description: "Manette officielle PS5 DualSense avec retour haptique", price: 42575, category: "accessoires", stock: 3, featured: true },
  { id: "20", name: "Manette Switch Pro", description: "Manette Pro Controller pour Nintendo Switch", price: 45195, category: "accessoires", stock: 3 },
  { id: "21", name: "Manette Switch 2 Pro", description: "Manette Pro Controller pour Nintendo Switch 2", price: 51745, category: "accessoires", stock: 4 },
  { id: "22", name: "Manette Xbox Elite Series 2", description: "Manette Xbox Elite Series 2 premium", price: 117245, category: "accessoires", stock: 2, featured: true },
  
  // Jeux Vidéo
  { id: "23", name: "Jeu PS5 - EA Sports FC 25", description: "Jeu PS5 EA Sports FC 25", price: 49125, category: "accessoires", stock: 4 },
  { id: "24", name: "Jeu PS5 - Call of Duty: Black Ops 6", description: "Jeu PS5 Call of Duty: Black Ops 6", price: 51745, category: "accessoires", stock: 3 },
  { id: "25", name: "Jeu Switch 2 - Mario Kart 9", description: "Jeu Switch 2 Mario Kart 9", price: 45195, category: "accessoires", stock: 5 },
  
  // Téléphones
  { id: "26", name: "Smartphone iPhone 15 128GB", description: "Smartphone Apple iPhone 15 128GB", price: 529895, category: "goodies", stock: 2, featured: true },
  { id: "27", name: "Smartphone Samsung Galaxy S24 128GB", description: "Smartphone Samsung Galaxy S24 128GB", price: 457845, category: "goodies", stock: 3, featured: true },
  { id: "28", name: "Coque iPhone 15", description: "Coque de protection pour iPhone 15", price: 18995, category: "accessoires", stock: 5 },
  
  // Composants PC
  { id: "29", name: "Carte Mère Z790", description: "Carte mère Z790 pour Intel 13ème/14ème génération", price: 143445, category: "pc-gaming", stock: 1, featured: true },
  { id: "30", name: "Boîtier PC Gamer", description: "Boîtier PC gamer avec fenêtre latérale et RGB", price: 38645, category: "pc-gaming", stock: 3 },
  { id: "31", name: "Ventirad CPU", description: "Ventirad CPU haute performance", price: 16375, category: "pc-gaming", stock: 4 },
  { id: "32", name: "Alimentation 600W 80+ Bronze", description: "Alimentation PC 600W certifiée 80+ Bronze", price: 36025, category: "pc-gaming", stock: 2 },
  { id: "33", name: "Alimentation 1000W 80+ Gold", description: "Alimentation PC 1000W certifiée 80+ Gold", price: 97595, category: "pc-gaming", stock: 3 },
  { id: "34", name: "Watercooling CPU 360mm", description: "Kit watercooling CPU 360mm haute performance", price: 104145, category: "pc-gaming", stock: 2 },
  { id: "35", name: "Ecran Samsung 27\" 144Hz 1ms IPS", description: "Moniteur gaming Samsung 27 pouces 144Hz 1ms IPS", price: 149995, category: "pc-gaming", stock: 3 }
];

const db = {
  products: products.map(p => ({
    ...p,
    image: null,
    featured: p.featured || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
};

fs.writeFileSync(
  path.join(__dirname, 'data/products.json'),
  JSON.stringify(db, null, 2)
);

console.log(`✅ Generated ${products.length} products successfully!`);
