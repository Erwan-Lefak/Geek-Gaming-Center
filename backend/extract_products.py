#!/usr/bin/env python3
"""
Script pour extraire TOUS les produits du site Geek Gaming Center
Utilise BeautifulSoup avec les sélecteurs CSS appropriés pour WooCommerce
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from datetime import datetime
from urllib.parse import urljoin

BASE_URL = "https://store.geek-gaming-center.com"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
}

def map_category_to_db(category_text):
    """Map les catégories du site vers nos catégories de BDD"""
    category_mapping = {
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
    }

    if not category_text:
        return 'pc-gaming'

    for key, value in category_mapping.items():
        if key.lower() in category_text.lower():
            return value

    return 'pc-gaming'

def extract_price_from_text(text):
    """Extrait le prix en FCFA depuis le texte"""
    if not text:
        return None

    # Chercher tous les prix dans le texte (format: XX XXX FCFA)
    matches = re.findall(r'(\d[\d\s]*)\s*FCFA', text)

    if matches:
        # Prendre le dernier prix (généralement le prix actuel, pas barré)
        price = matches[-1].replace(' ', '')
        try:
            return int(price)
        except ValueError:
            pass

    return None

def scrape_page(page_num):
    """Scrape une page spécifique de produits"""
    if page_num == 1:
        url = BASE_URL + "/"
    else:
        url = f"{BASE_URL}/page/{page_num}/"

    products = []

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # WooCommerce utilise la classe "product" pour les produits
        # Chercher tous les éléments avec class="product" ou similaire
        product_elements = soup.select('.product, .type-product, [class*="product-item"], [class*="col"]')

        for elem in product_elements:
            text = elem.get_text()

            # Vérifier si c'est un produit (doit contenir FCFA)
            if 'FCFA' not in text:
                continue

            # Extraire le nom du produit
            name_elem = elem.select_one('.woocommerce-loop-product__title, .product-title, h2, h3')
            if not name_elem:
                continue

            name = name_elem.get_text(strip=True)
            if not name or len(name) < 3:
                continue

            # Extraire le prix
            price = extract_price_from_text(text)
            if not price or price <= 0:
                continue

            # Déterminer le stock
            stock = 5  # Valeur par défaut
            if 'rupture' in text.lower():
                stock = 0
            elif 'en stock' in text.lower():
                stock = 5

            # Extraire la catégorie
            category = 'pc-gaming'
            cat_elem = elem.select_one('.product-category, [class*="category"]')
            if cat_elem:
                category = map_category_to_db(cat_elem.get_text(strip=True))

            # Extraire l'image
            image = None
            img_elem = elem.select_one('img')
            if img_elem and img_elem.get('src'):
                image = urljoin(BASE_URL, img_elem['src'])

            # Créer le produit
            product = {
                'id': str(abs(hash(name)) % 10000000),
                'name': name,
                'description': f"{name} - {'En stock' if stock > 0 else 'Rupture de stock'}",
                'price': price,
                'category': category,
                'stock': stock,
                'image': image,
                'featured': False,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }

            products.append(product)

        return products

    except requests.RequestException as e:
        print(f"   ❌ Erreur page {page_num}: {e}")
        return []

def scrape_all_products():
    """Scrape tous les produits du site"""
    all_products = []
    total_pages = 152

    print("="*70)
    print("🎮 EXTRACTION DES PRODUITS GEEK GAMING CENTER")
    print("="*70)
    print(f"📊 Pages à scraper: {total_pages}")
    print(f"🎯 Produits attendus: ~2268")
    print("="*70)
    print(f"🚀 Démarrage à {datetime.now().strftime('%H:%M:%S')}")
    print("="*70)

    start_time = time.time()

    for page_num in range(1, total_pages + 1):
        print(f"\n📄 Page {page_num}/{total_pages}...", end=' ', flush=True)

        products = scrape_page(page_num)

        if products:
            all_products.extend(products)
            print(f"✅ {len(products)} produits (Total: {len(all_products)})")
        else:
            print(f"⚠️  Aucun produit trouvé")

        # Sauvegarde intermédiaire toutes les 10 pages
        if page_num % 10 == 0:
            backup_file = f'data/products_backup_page_{page_num}.json'
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump({'products': all_products}, f, indent=2, ensure_ascii=False)
            elapsed = time.time() - start_time
            avg_time = elapsed / page_num
            remaining = avg_time * (total_pages - page_num)
            print(f"   💾 Sauvegarde: {backup_file}")
            print(f"   ⏱️  Temps: {elapsed/60:.1f} min | Restant: ~{remaining/60:.1f} min")

        # Pause respectueuse
        time.sleep(1.5)

    # Sauvegarde finale
    print("\n" + "="*70)
    print("✅ EXTRACTION TERMINÉE!")
    print("="*70)

    output_file = 'data/gge_products_complete.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({'products': all_products}, f, indent=2, ensure_ascii=False)

    elapsed = time.time() - start_time
    print(f"📁 Fichier final: {output_file}")
    print(f"📊 Produits extraits: {len(all_products)}")
    print(f"⏱️  Durée totale: {elapsed/60:.1f} minutes")

    # Statistiques
    if all_products:
        prices = [p.get('price', 0) for p in all_products if p.get('price', 0) > 0]

        if prices:
            print(f"\n💰 STATISTIQUES DE PRIX:")
            print(f"   Prix moyen: {sum(prices)/len(prices):.0f} FCFA")
            print(f"   Prix min: {min(prices):,} FCFA")
            print(f"   Prix max: {max(prices):,} FCFA")

        # Compter par catégorie
        categories = {}
        for p in all_products:
            cat = p.get('category', 'Non catégorisé')
            categories[cat] = categories.get(cat, 0) + 1

        print(f"\n📂 CATÉGORIES ({len(categories)}):")
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {cat}: {count} produits")

    return all_products

if __name__ == "__main__":
    try:
        products = scrape_all_products()
        print(f"\n🎉 Extraction terminée! {len(products)} produits extraits.")
    except KeyboardInterrupt:
        print("\n\n⚠️  Extraction interrompue")
    except Exception as e:
        print(f"\n\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
