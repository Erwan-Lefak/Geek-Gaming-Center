/**
 * Restaurant Page - Geek Gaming Center
 * Menu de restauration gaming et otaku
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UtensilsCrossed, Clock, Star } from 'lucide-react';
import Header from '@/components/ui/Header';

export default function RestaurantPage() {
  const [activeCategory, setActiveCategory] = useState<'plats' | 'snacks' | 'boissons' | 'desserts'>('plats');

  const menuItems = {
    plats: [
      {
        name: 'Burger Gamer Signature',
        description: 'Double steak, fromage fondue, bacon croustillant, sauce maison',
        price: 6500,
        popular: true
      },
      {
        name: 'Tacos Akatsuki',
        description: 'Sauce fromagère spéciale, viande hachée, frites, nuggets',
        price: 4500,
        popular: true
      },
      {
        name: 'Ramen Naruto',
        description: 'Broth maison, nouilles fraîches, porc braisé, oeuf mollet',
        price: 5500,
        popular: false
      },
      {
        name: 'Pizza One Piece',
        description: 'Grande taille, sauce tomate, mozzarella, pepperoni, olives',
        price: 8000,
        popular: true
      },
      {
        name: 'Wings Dragon Ball',
        description: '6 ailes de poulet marinées, sauce buffalo au choix',
        price: 4000,
        popular: false
      },
      {
        name: 'Pokebowl Pokemon',
        description: 'Riz vinaigré, thon, saumon, avocat, mangue, sésame',
        price: 7000,
        popular: false
      }
    ],
    snacks: [
      {
        name: 'Nachos Gaming',
        description: 'Chips de maïs, guacamole, salsa, fromage fondu',
        price: 3500,
        popular: true
      },
      {
        name: 'Chicken Tenders',
        description: '4 tenders de poulet panés avec sauce barbecue',
        price: 3000,
        popular: false
      },
      {
        name: 'Onion Rings',
        description: 'Anneaux d\'oignons croustillants',
        price: 2500,
        popular: false
      },
      {
        name: 'Mozzarella Sticks',
        description: '6 bâtonnets de mozzarella frits',
        price: 3000,
        popular: true
      },
      {
        name: 'French Fries',
        description: 'Frites maison avec ketchup et mayonnaise',
        price: 2000,
        popular: false
      },
      {
        name: 'Loaded Fries',
        description: 'Frites avec fromage, bacon, sauce cheddar',
        price: 4000,
        popular: true
      }
    ],
    boissons: [
      {
        name: 'Coca-Cola',
        description: '33cl ou 50cl, frais',
        price: 1000,
        popular: false
      },
      {
        name: 'Energy Drink Gaming',
        description: 'Monster, Red Bull ou Burn',
        price: 2000,
        popular: true
      },
      {
        name: 'Jus de Fruits',
        description: 'Orange, Ananas, ou Multivitamin',
        price: 1500,
        popular: false
      },
      {
        name: 'Eau Minérale',
        description: '50cl',
        price: 500,
        popular: false
      },
      {
        name: 'Milkshake',
        description: 'Chocolat, Vanille, Fraise, Oreo',
        price: 2500,
        popular: true
      },
      {
        name: 'Ice Tea',
        description: 'Pêche ou Citron',
        price: 1200,
        popular: false
      }
    ],
    desserts: [
      {
        name: 'Cookie Géant',
        description: 'Chocolat ou Noisette, tiède',
        price: 2000,
        popular: true
      },
      {
        name: 'Brownie',
        description: 'Chocolat fondant, glace vanille',
        price: 2500,
        popular: true
      },
      {
        name: 'Cheesecake',
        description: 'Fraise, Citron ou Spéculos',
        price: 3000,
        popular: false
      },
      {
        name: 'Tiramisu',
        description: 'Recette italienne traditionnelle',
        price: 3000,
        popular: false
      },
      {
        name: 'Coupe Glacée',
        description: '3 boules au choix, chantilly, sauce chocolat',
        price: 2500,
        popular: true
      },
      {
        name: 'Beignets',
        description: '3 beignets sucrés, sucre glace',
        price: 1500,
        popular: false
      }
    ]
  };

  const categories = [
    { id: 'plats', label: 'Plats Principaux' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'boissons', label: 'Boissons' },
    { id: 'desserts', label: 'Desserts' }
  ];

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
                <p className="text-white dark:text-black font-semibold">Spécialités</p>
                <p className="text-sm text-white dark:text-black">Burgers, Tacos, Ramen, Pizza</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`px-8 py-4 rounded-xl font-bold uppercase transition-all duration-300 restaurant-category-button ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 !text-white shadow-lg scale-105'
                    : 'bg-surface hover:bg-elevated'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems[activeCategory].map((item, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 group"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-orange-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-2xl font-bold text-orange-500 ml-4">
                    {item.price.toLocaleString()} FCFA
                  </p>
                </div>
                <p className="text-white/70 text-base mb-4">
                  {item.description}
                </p>
                <button className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 !text-white font-bold uppercase rounded-xl hover:opacity-90 transition-opacity">
                  Commander
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order CTA - Full Width */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-red-600/20 to-orange-500/20 border border-red-500/30 rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase">
                  Envie de commander ?
                </h2>
                <p className="text-white/80 text-lg">
                  Profitez de notre cuisine sur place ou à emporter. Les commandes sont disponibles directement à l'accueil du Geek Gaming Center.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 font-bold uppercase rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap restaurant-cta-button">
                  Commander sur place
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold uppercase rounded-xl hover:bg-white hover:text-black transition-all whitespace-nowrap">
                  Réserver une table
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
