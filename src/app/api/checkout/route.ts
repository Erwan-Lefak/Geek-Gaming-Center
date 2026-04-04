/**
 * Stripe Checkout API - Geek Gaming Center
 * POST /api/checkout - Create Stripe Checkout Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { CartItem } from '@/types/cart';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, cartId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.product || !item.quantity) {
        return NextResponse.json(
          { success: false, error: 'Invalid cart item' },
          { status: 400 }
        );
      }
    }

    // Get base URL from env or use request origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Session
    const session = await createCheckoutSession(
      items as CartItem[],
      `${baseUrl}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/store/checkout/cancel`,
      cartId
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
