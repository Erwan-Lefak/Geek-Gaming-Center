/**
 * Product Page with ISR - Geek Gaming Center
 * Incremental Static Regeneration every 60 seconds
 */

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import productsData from '@/lib/data/products.json';
import { formatFCFA } from '@/lib/currency';
import AddToCartButton from '@/components/ui/AddToCartButton';
import ProductGallery from '@/components/ui/ProductGallery';
import SimilarProducts from '@/components/ui/SimilarProducts';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Product as ProductType } from '@/types/product';

// Types
type ProductJson = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProductsData = {
  products: ProductJson[];
};

// Convert JSON product to Product type
function convertToProduct(jsonProduct: ProductJson): ProductType {
  return {
    ...jsonProduct,
    category: jsonProduct.category as any, // Cast to ProductCategory
    createdAt: new Date(jsonProduct.createdAt),
    updatedAt: new Date(jsonProduct.updatedAt),
  };
}

// ISR: Revalidate page every 60 seconds
export const revalidate = 60;

/**
 * Generate static params for all products at build time
 */
export async function generateStaticParams() {
  const data = productsData as ProductsData;
  const paths = data.products.map((product) => ({
    slug: product.slug,
  }));

  return paths;
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = productsData as ProductsData;
  const product = data.products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Produit non trouvé - Geek Gaming Center',
    };
  }

  return {
    title: `${product.name} - Geek Gaming Center`,
    description: product.description || `Achetez ${product.name} au meilleur prix au Geek Gaming Center.`,
    keywords: [
      product.name,
      product.category,
      'gaming',
      'Geek Gaming Center',
      'achat',
      'vente',
    ],
    openGraph: {
      title: product.name,
      description: product.description || `Découvrez ${product.name} chez Geek Gaming Center`,
      images: product.image ? [product.image] : [],
      type: 'website',
    },
  };
}

/**
 * Product Page Component
 */
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = productsData as ProductsData;
  const jsonProduct = data.products.find((p) => p.slug === slug);

  if (!jsonProduct) {
    notFound();
  }

  const product = convertToProduct(jsonProduct);

  const relatedProducts = data.products
    .filter((p) => p.category === jsonProduct.category && p.id !== jsonProduct.id)
    .slice(0, 4)
    .map(convertToProduct);

  return (
    <div className="min-h-screen bg-background pt-[96px]">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Boutique', href: '/store' },
            { label: jsonProduct.category, href: `/store?category=${jsonProduct.category}` },
            { label: jsonProduct.name, href: `/store/products/${jsonProduct.slug}`, active: true },
          ]}
        />
      </div>

      {/* Product Main Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image Gallery */}
          <div className="space-y-6">
            <ProductGallery images={jsonProduct.image ? [jsonProduct.image] : []} productName={jsonProduct.name} />
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{jsonProduct.name}</h1>
              <p className="text-sm text-white/60">Référence: {jsonProduct.id.toUpperCase()}</p>
            </div>

            {/* Price */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Prix</p>
                  <p className="text-4xl font-bold text-primary-400">{formatFCFA(jsonProduct.price)}</p>
                </div>
                {jsonProduct.stock > 0 ? (
                  <div className="text-right">
                    <p className="text-sm text-white/60 mb-1">Disponibilité</p>
                    <p className="text-success font-semibold">
                      {jsonProduct.stock > 10 ? 'En stock' : `${jsonProduct.stock} en stock`}
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm text-white/60 mb-1">Disponibilité</p>
                    <p className="text-error font-semibold">Rupture de stock</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-white">Description</h2>
              <p className="text-white/80 leading-relaxed">
                {jsonProduct.description && jsonProduct.description !== 'N/A'
                  ? jsonProduct.description
                  : 'Produit de haute qualité pour les gamers exigeants.'}
              </p>
            </div>

            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium border border-primary-500/30">
                {jsonProduct.category}
              </span>
              {jsonProduct.featured && (
                <span className="px-4 py-2 rounded-full bg-warning-500/20 text-warning-400 text-sm font-medium border border-warning-500/30">
                  ⭐ Populaire
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <AddToCartButton product={product} />

            {/* Additional Info */}
            <div className="glass-card p-6 rounded-xl space-y-3">
              <h3 className="font-semibold text-white mb-4">Informations complémentaires</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Catégorie</p>
                  <p className="text-white capitalize">{jsonProduct.category.replace('-', ' ')}</p>
                </div>
                <div>
                  <p className="text-white/60">Date d&apos;ajout</p>
                  <p className="text-white">{new Date(jsonProduct.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <SimilarProducts products={relatedProducts} title="Produits similaires" />
          </div>
        )}
      </div>
    </div>
  );
}
