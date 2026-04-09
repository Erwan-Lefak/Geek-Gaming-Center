/**
 * Admin Dashboard - Geek Gaming Center
 * Product management interface
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: 'consoles', label: 'Consoles' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'pc-gaming', label: 'PC Gaming' },
  { value: 'goodies', label: 'Goodies' }
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'consoles',
    stock: '',
    image: '',
    featured: false
  });

  // Charger les produits
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtrer les produits
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingProduct
      ? `/api/products/${editingProduct.id}`
      : '/api/products';

    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock)
        })
      });

      const json = await response.json();

      if (json.success) {
        await fetchProducts();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      const json = await response.json();

      if (json.success) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      image: product.image || '',
      featured: product.featured
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'consoles',
      stock: '',
      image: '',
      featured: false
    });
    setEditingProduct(null);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  // Calculer les statistiques
  const stats = {
    total: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    featured: products.filter(p => p.featured).length
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold kinetic-text text-white">
                ADMIN DASHBOARD
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Gestion des produits Geek Gaming Center
              </p>
            </div>
            <Link
              href="/store"
              className="jelly-button px-6 py-3 bg-gradient-to-r from-warning-500 to-warning-600 text-white font-semibold rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all flex items-center gap-2"
            >
              Voir la boutique
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bento-item">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-sm text-white/60">Total Produits</p>
              </div>
            </div>
          </div>

          <div className="bento-item">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalStock}</p>
                <p className="text-sm text-white/60">Stock Total</p>
              </div>
            </div>
          </div>

          <div className="bento-item">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {(stats.totalValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-white/60">Valeur Stock</p>
              </div>
            </div>
          </div>

          <div className="bento-item">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-400/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.featured}</p>
                <p className="text-sm text-white/60">Vedettes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-warning-500 transition-colors"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors"
            >
              <option value="all">Toutes catégories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="jelly-button px-6 py-3 bg-gradient-to-r from-warning-500 to-warning-600 text-white font-semibold rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-warning-500 border-t-transparent"></div>
            <p className="text-white/60 mt-4">Chargement des produits...</p>
          </div>
        ) : (
          <div className="bento-item overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-white font-semibold">Produit</th>
                    <th className="text-left py-4 px-4 text-white font-semibold">Catégorie</th>
                    <th className="text-left py-4 px-4 text-white font-semibold">Prix</th>
                    <th className="text-left py-4 px-4 text-white font-semibold">Stock</th>
                    <th className="text-left py-4 px-4 text-white font-semibold">Vedette</th>
                    <th className="text-left py-4 px-4 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg bg-white/5"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-white">{product.name}</p>
                            <p className="text-sm text-white/60 truncate max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                          {getCategoryLabel(product.category)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold gradient-text">{product.price.toLocaleString()} FCFA</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${
                          product.stock > 10 ? 'text-success' :
                          product.stock > 5 ? 'text-warning' :
                          'text-red-400'
                        }`}>
                          {product.stock} unités
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {product.featured ? (
                          <span className="px-3 py-1 bg-warning-500/20 text-warning rounded-full text-sm font-semibold">
                            Oui
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-sm">
                            Non
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/60">Aucun produit trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors"
                  placeholder="Ex: Manette PS5 DualSense"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors resize-none"
                  placeholder="Décrivez le produit..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors"
                    placeholder="75000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-warning-500 transition-colors"
                  placeholder="/products/mon-produit.jpg"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded bg-white/5 border-white/10 text-warning focus:ring-warning"
                />
                <label htmlFor="featured" className="text-sm font-semibold text-white">
                  Produit vedette
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 jelly-button px-6 py-3 bg-gradient-to-r from-warning-500 to-warning-600 text-white font-semibold rounded-lg hover:from-warning-600 hover:to-warning-700 transition-all"
                >
                  {editingProduct ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
