/**
 * Product Types for Geek Gaming Center
 */

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  image?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory =
  | 'consoles'
  | 'accessoires'
  | 'pc-gaming'
  | 'goodies';

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  image?: string;
  featured?: boolean;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  stock?: number;
  image?: string;
  featured?: boolean;
}
