'use client';

/**
 * Cart Context - Hybrid Cart Management
 * localStorage for visitors + API sync for logged-in users
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Cart, CartItem, CartContextType } from '@/types/cart';
import { calculateSubtotal, calculateTotal } from '@/lib/currency';
import { Product } from '@/types/product';

const CART_LOCAL_STORAGE_KEY = 'ggc_cart';
const CART_SYNC_DEBOUNCE_MS = 500;

interface CartContextProviderProps {
  children: React.ReactNode;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Generate a unique cart ID
 */
function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fetch product from API by ID
 */
async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

/**
 * Cart Provider Component
 */
export function CartProvider({ children }: CartContextProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Initialize cart from localStorage or API on mount
   */
  useEffect(() => {
    initializeCart();
  }, []);

  /**
   * Save cart to localStorage whenever it changes
   */
  useEffect(() => {
    if (cart) {
      localStorage.setItem(CART_LOCAL_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  /**
   * Initialize cart from localStorage (visitor mode)
   */
  async function initializeCart() {
    try {
      const storedCart = localStorage.getItem(CART_LOCAL_STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        // Validate and refresh cart items with current product data
        const refreshedItems = await Promise.all(
          parsedCart.items.map(async (item: CartItem) => {
            const product = await fetchProduct(item.productId);
            return {
              ...item,
              product: product || item.product, // Use fetched product or fallback
              quantity: product && product.stock < item.quantity ? product.stock : item.quantity,
            };
          })
        );

        const updatedCart: Cart = {
          ...parsedCart,
          items: refreshedItems,
          subtotal: calculateSubtotal(refreshedItems),
          total: calculateTotal(refreshedItems),
          updatedAt: new Date().toISOString(),
        };

        setCart(updatedCart);
      } else {
        // Create new empty cart
        const newCart: Cart = {
          id: generateCartId(),
          items: [],
          subtotal: 0,
          total: 0,
          currency: 'XAF',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCart(newCart);
      }
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      // Create empty cart on error
      const newCart: Cart = {
        id: generateCartId(),
        items: [],
        subtotal: 0,
        total: 0,
        currency: 'XAF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCart(newCart);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Add item to cart (optimistic update)
   */
  const addItem = useCallback(async (productId: string, quantity: number) => {
    if (!cart || quantity <= 0) return;

    // Check if item already exists in cart
    const existingItem = cart.items.find((item) => item.productId === productId);

    let updatedItems: CartItem[];

    if (existingItem) {
      // Update quantity of existing item
      updatedItems = cart.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Add new item
      const product = await fetchProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const newItem: CartItem = {
        productId,
        product,
        quantity,
        addedAt: new Date().toISOString(),
      };

      updatedItems = [...cart.items, newItem];
    }

    const updatedCart: Cart = {
      ...cart,
      items: updatedItems,
      subtotal: calculateSubtotal(updatedItems),
      total: calculateTotal(updatedItems),
      updatedAt: new Date().toISOString(),
    };

    setCart(updatedCart);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await syncToServer(updatedCart);
      } catch (error) {
        console.error('Failed to sync cart to server:', error);
        // Rollback optimistic update on sync failure
        setCart(cart);
        throw error;
      }
    }
  }, [cart, isAuthenticated]);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (productId: string) => {
    if (!cart) return;

    const previousCart = cart;
    const updatedItems = cart.items.filter((item) => item.productId !== productId);

    const updatedCart: Cart = {
      ...cart,
      items: updatedItems,
      subtotal: calculateSubtotal(updatedItems),
      total: calculateTotal(updatedItems),
      updatedAt: new Date().toISOString(),
    };

    setCart(updatedCart);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await syncToServer(updatedCart);
      } catch (error) {
        console.error('Failed to sync cart to server:', error);
        setCart(previousCart);
        throw error;
      }
    }
  }, [cart, isAuthenticated]);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!cart || quantity < 0) return;

      const previousCart = cart;

      // Remove item if quantity is 0
      if (quantity === 0) {
        await removeItem(productId);
        return;
      }

      const updatedItems = cart.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );

      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems),
        total: calculateTotal(updatedItems),
        updatedAt: new Date().toISOString(),
      };

      setCart(updatedCart);

      // Sync with server if authenticated
      if (isAuthenticated) {
        try {
          await syncToServer(updatedCart);
        } catch (error) {
          console.error('Failed to sync cart to server:', error);
          setCart(previousCart);
          throw error;
        }
      }
    },
    [cart, isAuthenticated, removeItem]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    if (!cart) return;

    const previousCart = cart;
    const clearedCart: Cart = {
      ...cart,
      items: [],
      subtotal: 0,
      total: 0,
      updatedAt: new Date().toISOString(),
    };

    setCart(clearedCart);
    localStorage.removeItem(CART_LOCAL_STORAGE_KEY);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await syncToServer(clearedCart);
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
        setCart(previousCart);
        throw error;
      }
    }
  }, [cart, isAuthenticated]);

  /**
   * Sync cart to server (for authenticated users)
   */
  const syncToServer = useCallback(async (cartToSync: Cart) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cart-id': cartToSync.id,
        },
        body: JSON.stringify({
          cartId: cartToSync.id,
          items: cartToSync.items,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync cart');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to sync cart');
      }

      return data.data;
    } catch (error) {
      console.error('Cart sync error:', error);
      throw error;
    }
  }, []);

  /**
   * Sync cart with server (called on login, page load, etc.)
   */
  const syncWithServer = useCallback(async () => {
    // Will be implemented when authentication is added
    // For now, this is a placeholder for when we add user auth
    console.log('Sync with server - to be implemented with auth');
  }, []);

  /**
   * Merge local cart with server cart (conflict resolution)
   * Server cart takes precedence for items added at different times
   */
  const mergeCarts = useCallback((localCart: Cart, serverCart: Cart): Cart => {
    const mergedItems = [...localCart.items];
    const serverProductIds = new Set(serverCart.items.map((item) => item.productId));

    // Add items from server that aren't in local cart
    for (const serverItem of serverCart.items) {
      if (!serverProductIds.has(serverItem.productId)) {
        mergedItems.push(serverItem);
      }
    }

    return {
      ...localCart,
      items: mergedItems,
      subtotal: calculateSubtotal(mergedItems),
      total: calculateTotal(mergedItems),
      updatedAt: new Date().toISOString(),
    };
  }, []);

  /**
   * Calculate total number of items in cart
   */
  const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

  const value: CartContextType = {
    cart,
    isLoading,
    isAuthenticated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncWithServer,
    mergeCarts,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to use cart context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
