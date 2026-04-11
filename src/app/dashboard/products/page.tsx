'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Package, AlertTriangle } from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  sellingPrice: number
  costPrice: number
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
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 0,
    minStock: 5,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=100')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
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
          costPrice: 0,
          sellingPrice: 0,
          currentStock: 0,
          minStock: 5,
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
      sku: product.sku,
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
    })
    setShowModal(true)
  }

  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length

  return (
    <div className="min-h-screen mt-28 lg:mt-20 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h1>
              <p className="text-sm text-gray-600 mt-1">
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
              <Button onClick={() => { setShowModal(true); setSelectedProduct(null) }}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Produit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Chargement des produits...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun produit trouvé
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Prix Achat</TableHead>
                      <TableHead>Prix Vente</TableHead>
                      <TableHead>Marge</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const margin = ((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(0)
                      const isLowStock = product.currentStock <= product.minStock

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-600">SKU: {product.sku}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{product.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                                {product.currentStock}
                              </span>
                              {isLowStock && (
                                <Badge variant="danger" className="text-xs">
                                  Stock bas
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              Min: {product.minStock}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.costPrice.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>
                            {product.sellingPrice.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>
                            <Badge variant={parseFloat(margin) > 30 ? 'success' : 'warning'}>
                              {margin}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
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
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end gap-3 pt-4">
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
