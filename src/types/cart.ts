/**
 * Cart Types for Geek Gaming Center
 * Hybrid cart management: localStorage (visitors) + database (logged-in users)
 */

import { Product } from './product';

/**
 * Single item in cart
 */
export interface CartItem {
  productId: string;
  product: Product; // Full product snapshot (preserves price/stock at time of adding)
  quantity: number;
  addedAt: string; // ISO timestamp
}

/**
 * Complete cart structure
 */
export interface Cart {
  id: string;
  userId?: string; // undefined for visitor carts
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cart context type for state management
 */
export interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Core operations
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Sync operations
  syncWithServer: () => Promise<void>;
  mergeCarts: (localCart: Cart, serverCart: Cart) => Cart;

  // Utility
  itemCount: number;
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

/**
 * Update cart item request
 */
export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

/**
 * Cart API response
 */
export interface CartApiResponse {
  success: boolean;
  data?: Cart;
  error?: string;
}

/**
 * Stripe Checkout types
 */
export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  data?: PaymentIntent;
  error?: string;
}

/**
 * Order types (for future implementation)
 */
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  createdAt: string;
  updatedAt: string;
}
