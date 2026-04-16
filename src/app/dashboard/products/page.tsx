'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Package, AlertTriangle, X, Upload, Search, Trash2 } from 'lucide-react'
import Image from 'next/image'

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
      const formData = new FormData()

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const newImages = data.files.map((f: any) => f.url)

        // Set first image as thumbnail if not set
        if (!formData.thumbnail && newImages.length > 0) {
          setFormData(prev => ({ ...prev, thumbnail: newImages[0] }))
        }

        // Add to images array
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))

    // Update thumbnail if it was the removed image
    if (formData.thumbnail === formData.images[index]) {
      setFormData(prev => ({
        ...prev,
        thumbnail: formData.images[0] || ''
      }))
    }
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
      }
    } catch (error) {
      console.error('Error saving product:', error)
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
    <div className="min-h-screen mt-28 lg:mt-20 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900 dark:text-white"
                style={{ color: 'var(--foreground)' }}
              >
                Gestion des Stocks
              </h1>
              <p
                className="text-sm text-gray-600 dark:text-gray-300 mt-1"
                style={{ color: 'var(--foreground)' }}
              >
                Catalogue produits et inventaire boutique
              </p>
            </div>
            <div className="flex items-center gap-4">
              {lowStockCount > 0 && (
                <Badge variant="danger" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockCount} alertes
                </Badge>
              )}
              <button
                onClick={() => { setShowModal(true); setSelectedProduct(null) }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Nouveau Produit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher par nom, SKU ou catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes catégories</option>
                {categories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="w-full md:w-48">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les stocks</option>
                <option value="low">Stock bas</option>
                <option value="out">Rupture de stock</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300" style={{ color: 'var(--foreground)' }}>
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--background)' }}>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                Chargement des produits...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                  ? 'Aucun produit ne correspond à votre recherche'
                  : 'Aucun produit trouvé'}
              </div>
            ) : (
              <div className="rounded-md border dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700 dark:bg-gray-800">
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Image</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Produit</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Catégorie</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Stock</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Prix Achat</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Prix Vente</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Marge</TableHead>
                      <TableHead className="text-gray-900 dark:text-white text-right" style={{ color: 'var(--foreground)' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      // Handle both old (price, stock) and new (sellingPrice, currentStock, costPrice) field names
                      const sellingPrice = product.sellingPrice || product.price || 0
                      const costPrice = product.costPrice || 0
                      const currentStock = product.currentStock || product.stock || 0
                      const minStock = product.minStock || 5
                      const thumbnail = product.thumbnail || product.image

                      const margin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice * 100).toFixed(0) : '0'
                      const isLowStock = currentStock <= minStock
                      const isValidThumbnail = thumbnail && thumbnail !== 'N/A' && thumbnail !== '' && typeof thumbnail === 'string'

                      return (
                        <TableRow key={product.id} className="dark:border-gray-700 dark:bg-gray-800">
                          <TableCell className="dark:bg-gray-800">
                            {isValidThumbnail ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <Image
                                  src={thumbnail}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>{product.name}</div>
                                {product.sku && (
                                  <div className="text-xs text-gray-600 dark:text-gray-300">SKU: {product.sku}</div>
                                )}
                                {product.brand && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">Marque: {product.brand}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="dark:bg-gray-800">
                            <div>
                              <Badge variant="default" style={{ color: 'var(--foreground)', backgroundColor: 'rgba(255,255,255,0.1)' }}>{product.category}</Badge>
                              {product.subcategory && (
                                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{product.subcategory}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`} style={{ color: isLowStock ? '' : 'var(--foreground)' }}>
                                {currentStock}
                              </span>
                              {isLowStock && (
                                <Badge variant="danger" className="text-xs">
                                  Stock bas
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300" style={{ color: 'var(--foreground)' }}>
                              Min: {minStock}
                            </div>
                          </TableCell>
                          <TableCell className="dark:bg-gray-800">
                            <span className="text-gray-900 dark:text-white" style={{ color: costPrice > 0 ? 'var(--foreground)' : 'var(--foreground)' }}>{costPrice > 0 ? Number(costPrice).toLocaleString('fr-FR') : '-'}</span> <span className="text-gray-600 dark:text-gray-300" style={{ color: 'var(--foreground)' }}>FCFA</span>
                          </TableCell>
                          <TableCell className="dark:bg-gray-800">
                            <span className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>{Number(sellingPrice).toLocaleString('fr-FR')}</span> <span className="text-gray-600 dark:text-gray-300" style={{ color: 'var(--foreground)' }}>FCFA</span>
                          </TableCell>
                          <TableCell className="dark:bg-gray-800">
                            {costPrice > 0 ? (
                              <Badge variant={parseFloat(margin) > 30 ? 'success' : 'warning'}>
                                {margin}%
                              </Badge>
                            ) : (
                              <Badge variant="secondary">-</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right dark:bg-gray-800">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(product)}
                                className="dark:text-white dark:hover:bg-gray-700"
                                style={{ color: 'var(--foreground)' }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedProduct(null)
        }}
        title={selectedProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subcategory">Sous-catégorie</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="brand">Marque</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costPrice">Prix d'achat (FCFA) *</Label>
              <Input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="sellingPrice">Prix de vente (FCFA) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Stock actuel</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="minStock">Stock minimum</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label>Images du produit</Label>
            <div className="mt-2 space-y-4">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choisir des images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Thumbnail selection */}
              {formData.images.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-300">Image principale (miniature)</Label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {formData.images.map((image, index) => {
                      const isValidImage = image && image !== 'N/A' && image !== '' && typeof image === 'string'
                      if (!isValidImage) return null

                      return (
                        <div
                          key={index}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            formData.thumbnail === image
                              ? 'border-primary-500 ring-2 ring-primary-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({ ...formData, thumbnail: image })}
                        >
                          <div className="relative w-full aspect-square">
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
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {formData.thumbnail === image && (
                          <div className="absolute bottom-1 left-1 px-2 py-1 bg-primary-500 text-white text-xs rounded">
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {selectedProduct ? 'Mettre à jour' : 'Créer le Produit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
