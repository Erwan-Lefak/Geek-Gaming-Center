/**
 * Store Page - Geek Gaming Center
 * Gaming accessories, consoles, games, merchandising
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, Quote, ShoppingCart, Gamepad2, Headphones, Keyboard, Mouse, Monitor, Shirt, Coffee, Store, Truck, CreditCard, LucideIcon } from 'lucide-react';
import ProductIcon from '@/components/ProductIcon';
import ProductImage from '@/components/ProductImage';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatFCFA } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  featured: boolean;
}

interface Category {
  value: string;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export default function StorePage() {
  const { addItem } = useCart();
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const itemsPerPage = 12; // 12 produits par page

  const categories: Category[] = [
    { value: 'all', label: 'Tous', title: 'Tous les produits', description: 'Découvrez notre catalogue complet', icon: ShoppingCart, color: 'from-primary-500/20 to-primary-600/20' },
    { value: 'consoles', label: 'Consoles', title: 'Consoles de jeu', description: 'PS5, Switch, Xbox et plus', icon: Gamepad2, color: 'from-primary-500/20 to-primary-600/20' },
    { value: 'accessoires', label: 'Accessoires', title: 'Accessoires Gaming', description: 'Casques, claviers, souris', icon: Headphones, color: 'from-warning-500/20 to-warning-600/20' },
    { value: 'pc-gaming', label: 'PC Gaming', title: 'PC Gaming', description: 'Composants et PC complets', icon: Monitor, color: 'from-accent-500/20 to-accent-600/20' },
    { value: 'goodies', label: 'Goodies', title: 'Goodies', description: 'Smartphones et objets connectés', icon: Shirt, color: 'from-success-500/20 to-success-600/20' },
  ];

  // Charger les produits depuis l'API
  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  // Charger les produits vedettes une seule fois
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Réinitialiser la page quand la catégorie change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url = activeCategory === 'all'
        ? '/api/products'
        : `/api/products?category=${activeCategory}`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?featured=true');
      const json = await response.json();

      if (json.success) {
        setFeaturedProducts(json.data.slice(0, 8)); // 8 produits vedettes max
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  // Calculer les produits pour la page actuelle
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    if (!cat || !cat.icon) return <ShoppingCart className="w-12 h-12 text-primary-400" />;
    const Icon = cat.icon;
    return <Icon className="w-12 h-12 text-primary-400" />;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'from-primary-500/20 to-primary-600/20';
  };

  const handleAddToCart = async (productId: string, stock: number) => {
    if (stock === 0) {
      alert('Ce produit est en rupture de stock');
      return;
    }

    setAddingToCart(productId);
    try {
      await addItem(productId, 1);
      // Success feedback could be added here (toast, etc.)
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Same design as Arena page */}
      <section className="relative flex items-center justify-center overflow-hidden h-[calc(100vh-6rem)] sm:h-[calc(100vh-6rem)] mt-[8.5rem] md:mt-[6rem]">
        {/* Background with image */}
        <div className="absolute inset-0">
          <Image
            src="/store-hero.jpg"
            alt="Boutique Geek Gaming Center"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Red Gradient Overlay - adapts to theme */}
        <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${
          theme === 'light'
            ? 'from-red-950/85 via-red-950/75 to-white'
            : 'from-red-950/85 via-red-950/90 to-black'
        }`} />

        {/* Content - Split layout */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Main heading */}
              <h1 className="text-[4rem] sm:text-[4.7rem] md:text-[5.3rem] lg:text-[6.7rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-4">
                BOUTIQUE
              </h1>

              {/* Tagline */}
              <div className="flex items-center gap-2 mb-6" style={{ color: '#f97316' }}>
                <ChevronRight className="w-6 h-6" style={{ color: '#f97316', stroke: '#f97316' }} />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide" style={{ color: '#f97316' }}>
                  TOUT POUR LES GAMERS À YAOUNDÉ
                </p>
                <ChevronRight className="w-6 h-6" style={{ color: '#f97316', stroke: '#f97316' }} />
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <p className="text-lg sm:text-xl text-white/80 mb-4 uppercase">
                  CONSOLES, ACCESSOIRES, JEUX VIDÉO ET GOODIES
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#products"
                    className="jelly-button group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-warning-500 to-warning-600 font-semibold text-xl sm:text-2xl md:text-3xl text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 uppercase"
                  >
                    Voir les produits
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <Link
                    href="/store/contact"
                    className="jelly-button group relative inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-white/30 font-semibold text-xl sm:text-2xl md:text-3xl text-white hover:bg-white/10 transition-all duration-300 uppercase"
                  >
                    Nous contacter
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side - Store images */}
            <div className="relative hidden lg:flex flex-row gap-3">
              {/* Image 1 */}
              <div className="w-64 h-96 overflow-hidden group -skew-x-15">
                <div className="absolute inset-0 skew-x-15 transform-origin-left">
                  <Image
                    src="/store-hero.jpg"
                    alt="Boutique"
                    width={256}
                    height={384}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Image 2 */}
              <div className="w-64 h-96 overflow-hidden group -skew-x-15">
                <div className="absolute inset-0 skew-x-15 transform-origin-left">
                  <Image
                    src="/section-salle-de-jeux.jpg"
                    alt="Produits Gaming"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Image 3 */}
              <div className="w-64 h-96 overflow-hidden group -skew-x-15">
                <div className="absolute inset-0 skew-x-15 transform-origin-left">
                  <Image
                    src="/section-restaurant.jpg"
                    alt="Accessoires"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-black via-red-950/30 to-red-900/50">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Produits <span className="gradient-text">Vedettes</span>
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all">
                  Voir tout
                </button>
              </div>
            </div>

            {/* Carousel */}
            <div className="overflow-x-auto pb-6">
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/products/${product.id}`}
                    className="w-72 flex-shrink-0 bento-item group overflow-hidden flex flex-col"
                  >
                    {/* Product Image/Icon */}
                    <div className={`aspect-square bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 overflow-hidden`}>
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        category={product.category}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">{product.name}</h3>
                      <p className="text-sm text-white/70 mb-2 line-clamp-2">{product.description}</p>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <span className="text-xl font-bold gradient-text">
                          {formatFCFA(product.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product.id, product.stock);
                          }}
                          disabled={addingToCart === product.id || product.stock === 0}
                          className="px-3 py-2 bg-gradient-to-r from-warning-500 to-warning-600 text-white font-semibold rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {addingToCart === product.id ? '...' : ''}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Products with Pagination */}
      <section id="products" className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 md:mb-16 gap-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Tous les Produits
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeCategory === cat.value
                      ? 'bg-warning-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-warning-500 border-t-transparent"></div>
              <p className="text-white/60 mt-4">Chargement des produits...</p>
            </div>
          ) : (
            <>
              {/* Products count */}
              <p className="text-white/60 mb-6">
                Affichage de {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} sur {products.length} produits
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/products/${product.id}`}
                    className="bento-item group overflow-hidden flex flex-col"
                  >
                    {/* Product Image/Icon */}
                    <div className={`aspect-square bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105 overflow-hidden`}>
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        category={product.category}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">{product.name}</h3>
                      <p className="text-sm text-white/70 mb-2 flex-grow line-clamp-2">{product.description}</p>
                      <p className={`text-xs mb-4 ${
                        product.stock > 10 ? 'text-success' :
                        product.stock > 5 ? 'text-warning' :
                        'text-red-400'
                      }`}>
                        En stock: {product.stock} unités
                      </p>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <span className="text-xl font-bold gradient-text">
                          {formatFCFA(product.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent navigation
                            e.stopPropagation();
                            handleAddToCart(product.id, product.stock);
                          }}
                          disabled={addingToCart === product.id || product.stock === 0}
                          className="px-4 py-2 bg-gradient-to-r from-warning-500 to-warning-600 text-white font-semibold rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all duration-300 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {addingToCart === product.id ? '...' : 'Ajouter'}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/60">Aucun produit disponible dans cette catégorie</p>
                </div>
              )}

              {/* Pagination Controls */}
              {products.length > 0 && totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-white/60 text-sm">
                    Page {currentPage} sur {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === 1
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Précédent
                    </button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                              currentPage === pageNum
                                ? 'bg-warning-500 text-white'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === totalPages
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bento-item">
              <div className="flex items-center gap-4 mb-4">
                <Store className="w-8 h-8 text-warning" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Boutique</h3>
              </div>
              <p className="text-base text-white/80">
                Venez découvrir notre large gamme de produits gaming en magasin à Mvog Ada.
              </p>
            </div>

            <div className="bento-item">
              <div className="flex items-center gap-4 mb-4">
                <Truck className="w-8 h-8 text-primary-400" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Livraison</h3>
              </div>
              <p className="text-base text-white/80 mb-2">
                Livraison disponible à Yaoundé
              </p>
              <p className="text-base text-white/80">
                Livraison dans tout le Cameroun
              </p>
            </div>

            <div className="bento-item">
              <div className="flex items-center gap-4 mb-4">
                <CreditCard className="w-8 h-8 text-success" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Paiement</h3>
              </div>
              <p className="text-base text-white/80">
                Espèces, Mobile Money, Cartes bancaires acceptées
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
