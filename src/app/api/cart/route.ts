/**
 * Cart API Routes - Geek Gaming Center
 * GET /api/cart - Retrieve user cart
 * POST /api/cart - Create/update cart
 * DELETE /api/cart - Clear cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Cart, CartApiResponse } from '@/types/cart';

const CARTS_DIR = path.join(process.cwd(), 'backend/data/carts');

/**
 * Ensure carts directory exists
 */
async function ensureCartsDir() {
  try {
    await fs.mkdir(CARTS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists or error
  }
}

/**
 * GET /api/cart - Retrieve cart by session ID or user ID
 */
export async function GET(request: NextRequest) {
  try {
    await ensureCartsDir();

    // Get cart ID from header or query param
    const cartId = request.headers.get('x-cart-id') || request.nextUrl.searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const cartPath = path.join(CARTS_DIR, `${cartId}.json`);

    try {
      const cartData = await fs.readFile(cartPath, 'utf-8');
      const cart: Cart = JSON.parse(cartData);

      return NextResponse.json({
        success: true,
        data: cart,
      } as CartApiResponse);
    } catch (error) {
      // Cart file doesn't exist
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Create or update cart
 */
export async function POST(request: NextRequest) {
  try {
    await ensureCartsDir();

    const body = await request.json();
    const { cartId, items, userId } = body;

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((total: number, item: any) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const total = subtotal; // No tax/shipping for now

    const cart: Cart = {
      id: cartId,
      userId,
      items,
      subtotal,
      total,
      currency: 'XAF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cartPath = path.join(CARTS_DIR, `${cartId}.json`);
    await fs.writeFile(cartPath, JSON.stringify(cart, null, 2));

    return NextResponse.json({
      success: true,
      data: cart,
    } as CartApiResponse);
  } catch (error) {
    console.error('Error saving cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart - Clear cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const cartId = request.headers.get('x-cart-id') || request.nextUrl.searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const cartPath = path.join(CARTS_DIR, `${cartId}.json`);

    try {
      await fs.unlink(cartPath);

      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
