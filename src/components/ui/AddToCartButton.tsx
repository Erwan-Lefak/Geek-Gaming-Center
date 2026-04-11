'use client';

/**
 * Add to Cart Button - Geek Gaming Center
 * Quantity selector with animated add to cart action
 */

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { formatFCFA } from '@/lib/currency';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addItem, itemCount } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= Math.min(product.stock, 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) return;

    setIsAdding(true);
    setShowSuccess(false);

    try {
      await addItem(product.id, quantity);

      // Success animation
      setIsAdding(false);
      setShowSuccess(true);

      // Reset success message after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

      // Reset quantity to 1
      setQuantity(1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setIsAdding(false);
      alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    }
  };

  const maxQuantity = Math.min(product.stock, 10);

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="glass-card p-4 rounded-xl">
        <label className="block text-sm text-white/60 mb-2">Quantité</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || product.stock === 0}
            className="w-12 h-12 rounded-lg bg-surface border border-border hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-xl font-semibold text-white"
          >
            −
          </button>

          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            disabled={product.stock === 0}
            className="w-20 h-12 text-center bg-background border border-border rounded-lg text-white font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50 [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity || product.stock === 0}
            className="w-12 h-12 rounded-lg bg-surface border border-border hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-xl font-semibold text-white"
          >
            +
          </button>

          {product.stock > 0 && product.stock <= 10 && (
            <span className="text-sm text-warning-400 ml-2">
              ({product.stock} disponibles)
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      {product.stock > 0 ? (
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`jelly-button w-full py-4 rounded-xl font-bold text-lg transition-all ${
            showSuccess
              ? 'bg-success hover:bg-success text-white'
              : 'bg-primary-500 hover:bg-primary-600'
          } disabled:opacity-50 disabled:cursor-not-nowrap relative overflow-hidden`}
          style={{ color: '#ffffff' }}
        >
          {isAdding ? (
            <span className="flex items-center justify-center" style={{ color: '#ffffff !important', cssText: 'color: #ffffff !important' }}>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ fill: 'none' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ fill: 'none' }}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ fill: 'none' }}></path>
              </svg>
              Ajout en cours...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center" style={{ color: '#ffffff !important', cssText: 'color: #ffffff !important' }}>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ fill: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" style={{ fill: 'none' }} />
              </svg>
              Ajouté au panier !
            </span>
          ) : (
            <span className="flex items-center justify-center" style={{ color: '#ffffff !important', cssText: 'color: #ffffff !important' }}>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ fill: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" style={{ fill: 'none' }} />
              </svg>
              Ajouter au panier - {formatFCFA(product.price * quantity)}
            </span>
          )}
        </button>
      ) : (
        <button
          disabled
          className="w-full py-4 rounded-xl font-bold text-lg bg-error/20 text-error border border-error/30 cursor-not-allowed"
        >
          Rupture de stock
        </button>
      )}

      {/* Cart Summary */}
      {itemCount > 0 && (
        <div className="text-center text-sm text-white/60">
          <Link href="/store/cart" className="text-primary-400 hover:text-primary-300 transition-colors">
            Voir mon panier ({itemCount} article{itemCount > 1 ? 's' : ''})
          </Link>
        </div>
      )}
    </div>
  );
}
