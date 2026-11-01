'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import {
  Plus,
  Edit,
  Package,
  AlertTriangle,
  X,
  Upload,
  Search,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  DashBadge,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

interface Product {
  id: string
  name: string
  sku?: string
  category: string
  subcategory?: string
  brand?: string
  description?: string
  stock?: number
  currentStock?: number
  minStock?: number
  price?: number
  sellingPrice?: number
  costPrice?: number
  image?: string
  thumbnail?: string
  images?: string[]
  featured?: boolean
  supplier?: {
    name: string
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    subcategory: '',
    brand: '',
    description: '',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minStock: 5,
    thumbnail: '',
    images: [] as string[],
  })

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const uploadData = new FormData()

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        uploadData.append('files', files[i])
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      })

      if (response.ok) {
        const data = await response.json()
        const newImages = data.files.map((f: any) => f.url)

        // Ajoute les images ; la première devient la miniature si aucune n'était définie
        setFormData(prev => ({
          ...prev,
          thumbnail: prev.thumbnail || newImages[0] || '',
          images: [...prev.images, ...newImages],
        }))
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => {
      const images = prev.images.filter((_, i) => i !== index)
      return {
        ...prev,
        images,
        thumbnail:
          prev.thumbnail === prev.images[index]
            ? images[0] || ''
            : prev.thumbnail,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = selectedProduct
        ? `/api/products/${selectedProduct.id}`
        : '/api/products'

      const method = selectedProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setSelectedProduct(null)
        setFormData({
          name: '',
          sku: '',
          category: '',
          subcategory: '',
          brand: '',
          description: '',
          costPrice: 0,
          sellingPrice: 0,
          currentStock: 0,
          minStock: 5,
          thumbnail: '',
          images: [],
        })
        fetchProducts()
        alert(selectedProduct ? 'Produit mis à jour avec succès !' : 'Produit créé avec succès !')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la sauvegarde du produit')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Erreur lors de la sauvegarde du produit')
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      sku: product.sku || '',
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      description: product.description || '',
      costPrice: Number(product.costPrice || 0),
      sellingPrice: Number(product.sellingPrice || product.price || 0),
      currentStock: Number(product.currentStock || product.stock || 0),
      minStock: Number(product.minStock || 5),
      thumbnail: (product.thumbnail || product.image || ''),
      images: product.images || (product.image ? [product.image] : []),
    })
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchProducts()
        alert('Produit supprimé avec succès!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const lowStockCount = products.filter(p => {
    const currentStock = p.currentStock || p.stock || 0
    const minStock = p.minStock || 5
    return currentStock <= minStock
  }).length

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  // Filter products
  const filteredProducts = products.filter(product => {
    // Search query filter
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter

    // Stock filter
    const currentStock = product.currentStock || product.stock || 0
    const minStock = product.minStock || 5
    let matchesStock = true

    if (stockFilter === 'low') {
      matchesStock = currentStock <= minStock
    } else if (stockFilter === 'out') {
      matchesStock = currentStock === 0
    }

    return matchesSearch && matchesCategory && matchesStock
  })

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Gestion des stocks"
        description="Catalogue produits et inventaire boutique"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {lowStockCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lowStockCount} alerte{lowStockCount > 1 ? 's' : ''} stock
              </span>
            )}
            <button
              onClick={() => { setShowModal(true); setSelectedProduct(null) }}
              className={dashBtnPrimaryCls}
            >
              <Plus className="h-4 w-4" />
              Nouveau produit
            </button>
          </div>
        }
      />

      <DashCard
        title={`${filteredProducts.length} produit${filteredProducts.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Nom, SKU ou catégorie…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(dashInputCls, 'pl-9')}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Toutes catégories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Tous les stocks</option>
              <option value="low">Stock bas</option>
              <option value="out">Rupture de stock</option>
            </select>
          </div>
        }
      >
        {loading && products.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Chargement des produits…</div>
        ) : filteredProducts.length === 0 ? (
          <DashEmpty
            icon={Package}
            title={
              searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'Aucun produit ne correspond à votre recherche'
                : 'Aucun produit trouvé'
            }
          />
        ) : (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr>
                  <th className={dashTableHeadCls}>Image</th>
                  <th className={dashTableHeadCls}>Produit</th>
                  <th className={dashTableHeadCls}>Catégorie</th>
                  <th className={dashTableHeadCls}>Stock</th>
                  <th className={dashTableHeadCls}>Prix achat</th>
                  <th className={dashTableHeadCls}>Prix vente</th>
                  <th className={dashTableHeadCls}>Marge</th>
                  <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  // Handle both old (price, stock) and new (sellingPrice, currentStock, costPrice) field names
                  const sellingPrice = product.sellingPrice || product.price || 0
                  const costPrice = product.costPrice || 0
                  const currentStock = product.currentStock || product.stock || 0
                  const minStock = product.minStock || 5
                  const thumbnail = product.thumbnail || product.image

                  const margin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice * 100).toFixed(0) : '0'
                  const isLowStock = currentStock <= minStock
                  const isOut = currentStock === 0
                  const isValidThumbnail = thumbnail && thumbnail !== 'N/A' && thumbnail !== '' && typeof thumbnail === 'string'

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4">
                        {isValidThumbnail ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/5">
                            <Image
                              src={thumbnail}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
                            <Package className="h-5 w-5 text-slate-600" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-200">{product.name}</div>
                        {product.sku && (
                          <div className="text-xs text-slate-500">SKU : {product.sku}</div>
                        )}
                        {product.brand && (
                          <div className="text-xs text-slate-500">Marque : {product.brand}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <DashBadge label={product.category} />
                        {product.subcategory && (
                          <div className="mt-1 text-xs text-slate-500">{product.subcategory}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'font-medium tabular-nums',
                              isOut ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-slate-200'
                            )}
                          >
                            {currentStock}
                          </span>
                          {isLowStock && (
                            <DashBadge label={isOut ? 'Rupture' : 'Stock bas'} tone={isOut ? 'rose' : 'amber'} />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">Min : {minStock}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 tabular-nums">
                        {costPrice > 0 ? Number(costPrice).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-200 tabular-nums">
                        {Number(sellingPrice).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 pr-4">
                        {costPrice > 0 ? (
                          <DashBadge
                            label={`${margin}%`}
                            tone={parseFloat(margin) > 30 ? 'emerald' : 'amber'}
                          />
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            title="Modifier"
                            className={dashBtnGhostCls}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            title="Supprimer"
                            className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>

      {/* Modal : produit */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedProduct(null)
        }}
        title={selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-slate-400">
              Nom du produit <span className="text-rose-400">*</span>
            </label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={dashInputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="mb-1 block text-sm text-slate-400">SKU</label>
              <input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={dashInputCls}
              />
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-sm text-slate-400">
                Catégorie <span className="text-rose-400">*</span>
              </label>
              <input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className={dashInputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="subcategory" className="mb-1 block text-sm text-slate-400">Sous-catégorie</label>
              <input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className={dashInputCls}
              />
            </div>
            <div>
              <label htmlFor="brand" className="mb-1 block text-sm text-slate-400">Marque</label>
              <input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className={dashInputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm text-slate-400">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={dashInputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="costPrice" className="mb-1 block text-sm text-slate-400">
                Prix d&apos;achat (FCFA) <span className="text-rose-400">*</span>
              </label>
              <input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                required
                className={dashInputCls}
              />
            </div>
            <div>
              <label htmlFor="sellingPrice" className="mb-1 block text-sm text-slate-400">
                Prix de vente (FCFA) <span className="text-rose-400">*</span>
              </label>
              <input
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                required
                className={dashInputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentStock" className="mb-1 block text-sm text-slate-400">Stock actuel</label>
              <input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                className={dashInputCls}
              />
            </div>
            <div>
              <label htmlFor="minStock" className="mb-1 block text-sm text-slate-400">Stock minimum</label>
              <input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                className={dashInputCls}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400">Images du produit</label>
            <div className="mt-2 space-y-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-primary-500/40 hover:text-primary-300">
                <Upload className="h-4 w-4" />
                Choisir des images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* Sélection de la miniature */}
              {formData.images.length > 0 && (
                <div>
                  <p className="mb-2 text-sm text-slate-500">Image principale (miniature)</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {formData.images.map((image, index) => {
                      const isValidImage = image && image !== 'N/A' && image !== '' && typeof image === 'string'
                      if (!isValidImage) return null

                      return (
                        <div
                          key={index}
                          className={cn(
                            'relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                            formData.thumbnail === image
                              ? 'border-primary-400 ring-2 ring-primary-500/30'
                              : 'border-white/10 hover:border-white/25'
                          )}
                          onClick={() => setFormData({ ...formData, thumbnail: image })}
                        >
                          <div className="relative aspect-square w-full">
                            <Image
                              src={image}
                              alt={`Produit ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                            className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white transition-colors hover:bg-rose-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {formData.thumbnail === image && (
                            <div className="absolute bottom-1 left-1 rounded bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              Principale
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={dashBtnOutlineCls}
            >
              Annuler
            </button>
            <button type="submit" className={dashBtnPrimaryCls}>
              {selectedProduct ? 'Mettre à jour' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
