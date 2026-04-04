/**
 * Similar Products Component - Geek Gaming Center
 * Related products grid for product pages
 */

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatFCFA } from '@/lib/currency';
import { ProductIcon } from './ProductIcon';

interface SimilarProductsProps {
  products: Product[];
  title?: string;
}

export default function SimilarProducts({ products, title = 'Produits similaires' }: SimilarProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/store/products/${product.slug}`}
            className="group glass-card rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-surface overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ProductIcon className="w-24 h-24 text-gray-600" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <span className="px-2 py-1 bg-warning-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    ⭐ Populaire
                  </span>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="px-2 py-1 bg-warning-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    Plus que {product.stock} !
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="px-2 py-1 bg-error/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                    Rupture
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Product Name */}
              <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                {product.name}
              </h3>

              {/* Price */}
              <p className="text-xl font-bold text-primary-400">
                {formatFCFA(product.price)}
              </p>

              {/* View Button */}
              <button className="mt-3 w-full py-2 px-4 rounded-lg bg-surface border border-border hover:border-primary-500 text-white text-sm font-medium transition-all group-hover:bg-primary-500/10">
                Voir le produit
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
