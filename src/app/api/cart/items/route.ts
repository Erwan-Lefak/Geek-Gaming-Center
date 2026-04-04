/**
 * Cart Items API Routes - Geek Gaming Center
 * POST /api/cart/items - Add item to cart
 * PUT /api/cart/items - Update item quantity
 * DELETE /api/cart/items - Remove item from cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Cart, CartApiResponse } from '@/types/cart';
import { calculateSubtotal, calculateTotal } from '@/lib/currency';

const CARTS_DIR = path.join(process.cwd(), 'backend/data/carts');
const PRODUCTS_PATH = path.join(process.cwd(), 'backend/data/products.json');

/**
 * Ensure carts directory exists
 */
async function ensureCartsDir() {
  try {
    await fs.mkdir(CARTS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

/**
 * Get product by ID
 */
async function getProduct(productId: string): Promise<any> {
  const data = await fs.readFile(PRODUCTS_PATH, 'utf-8');
  const db = JSON.parse(data);
  return db.products.find((p: any) => p.id === productId);
}

/**
 * Get cart by ID
 */
async function getCart(cartId: string): Promise<Cart | null> {
  const cartPath = path.join(CARTS_DIR, `${cartId}.json`);

  try {
    const cartData = await fs.readFile(cartPath, 'utf-8');
    return JSON.parse(cartData);
  } catch (error) {
    return null;
  }
}

/**
 * Save cart
 */
async function saveCart(cart: Cart): Promise<void> {
  const cartPath = path.join(CARTS_DIR, `${cart.id}.json`);
  await fs.writeFile(cartPath, JSON.stringify(cart, null, 2));
}

/**
 * POST /api/cart/items - Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    await ensureCartsDir();

    const body = await request.json();
    const { cartId, productId, quantity } = body;

    if (!cartId || !productId || !quantity) {
      return NextResponse.json(
        { success: false, error: 'cartId, productId, and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await getProduct(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check stock
    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: 'Not enough stock' },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await getCart(cartId);

    if (!cart) {
      // Create new cart
      const newItem = {
        productId,
        product,
        quantity,
        addedAt: new Date().toISOString(),
      };

      cart = {
        id: cartId,
        items: [newItem],
        subtotal: product.price * quantity,
        total: product.price * quantity,
        currency: 'XAF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          product,
          quantity,
          addedAt: new Date().toISOString(),
        });
      }

      // Recalculate totals
      cart.subtotal = calculateSubtotal(cart.items);
      cart.total = calculateTotal(cart.items);
      cart.updatedAt = new Date().toISOString();
    }

    await saveCart(cart);

    return NextResponse.json({
      success: true,
      data: cart,
    } as CartApiResponse);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart/items - Update item quantity
 */
export async function PUT(request: NextRequest) {
  try {
    await ensureCartsDir();

    const body = await request.json();
    const { cartId, productId, quantity } = body;

    if (!cartId || !productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'cartId, productId, and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 0 || quantity > 10) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 0 and 10' },
        { status: 400 }
      );
    }

    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    cart.subtotal = calculateSubtotal(cart.items);
    cart.total = calculateTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await saveCart(cart);

    return NextResponse.json({
      success: true,
      data: cart,
    } as CartApiResponse);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items - Remove item from cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const cartId = request.headers.get('x-cart-id') || request.nextUrl.searchParams.get('cartId');
    const productId = request.headers.get('x-product-id') || request.nextUrl.searchParams.get('productId');

    if (!cartId || !productId) {
      return NextResponse.json(
        { success: false, error: 'cartId and productId are required' },
        { status: 400 }
      );
    }

    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      );
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    cart.subtotal = calculateSubtotal(cart.items);
    cart.total = calculateTotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await saveCart(cart);

    return NextResponse.json({
      success: true,
      data: cart,
    } as CartApiResponse);
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove cart item' },
      { status: 500 }
    );
  }
}
