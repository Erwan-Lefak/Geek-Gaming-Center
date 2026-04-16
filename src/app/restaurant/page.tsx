/**
 * Restaurant Page - Geek Gaming Center
 * Menu de restauration gaming et otaku
 * Synchronisé avec la base de données du dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { UtensilsCrossed, Clock, Star } from 'lucide-react';
import Header from '@/components/ui/Header';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

export default function RestaurantPage() {
  const [activeCategory, setActiveCategory] = useState<string>('plats');
  const [menuData, setMenuData] = useState<Record<string, MenuItem[]>>({})
  const [categories, setCategories] = useState<Array<{id: string, label: string}>>([])
  const [loading, setLoading] = useState(true)

  // Category mapping: database → page
  const categoryMapping: Record<string, string> = {
    'Plat principal': 'plats',
    'Entrée': 'plats',
    'Snack': 'snacks',
    'Boisson': 'boissons',
    'Dessert': 'desserts',
  }

  const categoryLabels: Record<string, string> = {
    'plats': 'Plats Principaux',
    'snacks': 'Snacks',
    'boissons': 'Boissons',
    'desserts': 'Desserts',
  }

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/restaurant/menu')
        if (!res.ok) throw new Error('Failed to fetch menu')
        const data = await res.json()

        // Transform database categories to page categories
        const transformedMenu: Record<string, MenuItem[]> = {}
        const seenCategories = new Set<string>()

        Object.entries(data.menu).forEach(([dbCategory, items]: [string, MenuItem[]]) => {
          const pageCategory = categoryMapping[dbCategory] || dbCategory.toLowerCase()

          if (!transformedMenu[pageCategory]) {
            transformedMenu[pageCategory] = []
          }

          transformedMenu[pageCategory].push(...items)
          seenCategories.add(pageCategory)
        })

        setMenuData(transformedMenu)
        setCategories(Array.from(seenCategories).map(cat => ({
          id: cat,
          label: categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
        })))
      } catch (error) {
        console.error('Error fetching menu:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Chargement du menu...</div>
        </div>
      </div>
    )
  }

  const currentItems = menuData[activeCategory] || []

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Info Bar */}
      <section className="bg-black py-6 border-b border-border mt-[8.5rem] md:mt-[6rem]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="restaurant-info-icon">
                <Clock className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white dark:text-black font-semibold">Horaires</p>
                <p className="text-sm text-white dark:text-black">Mar - Dim: 11h - 23h</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="restaurant-info-icon">
                <Star className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-white dark:text-black font-semibold">Qualité</p>
                <p className="text-sm text-white dark:text-black">Produits frais & maison</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-black py-6 px-4 border-b border-border">
        <div className="container mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-full font-bold transition-all duration-300 restaurant-category-button ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-surface hover:bg-elevated text-white dark:text-black'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {currentItems.length === 0 ? (
            <div className="text-center text-white/60 text-xl py-20">
              Aucun article disponible dans cette catégorie pour le moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 group"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  {/* Tags */}
                  {(item.isVegetarian || item.isVegan || item.isSpicy) && (
                    <div className="flex gap-2 px-4 py-2 bg-black/20">
                      {item.isVegetarian && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Végétarien
                        </span>
                      )}
                      {item.isVegan && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-500 text-xs rounded-full">
                          Vegan
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                          Épicé
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-orange-500">
                        {item.price.toLocaleString('fr-FR')} FCFA
                      </span>
                      {item.preparationTime && (
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.preparationTime} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
