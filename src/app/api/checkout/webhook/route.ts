/**
 * Stripe Webhook Handler - Geek Gaming Center
 * POST /api/checkout/webhook - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructStripeEvent } from '@/lib/stripe';
import { promises as fs } from 'fs';
import path from 'path';

const ORDERS_DIR = path.join(process.cwd(), 'backend/data/orders');

/**
 * Ensure orders directory exists
 */
async function ensureOrdersDir() {
  try {
    await fs.mkdir(ORDERS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

/**
 * Create order from checkout session
 */
async function createOrder(session: any) {
  await ensureOrdersDir();

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const order = {
    id: orderId,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
    customerEmail: session.customer_details?.email,
    amountTotal: session.amount_total,
    currency: session.currency,
    status: 'completed',
    items: session.metadata?.items ? JSON.parse(session.metadata.items) : [],
    shippingDetails: session.shipping_details,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orderPath = path.join(ORDERS_DIR, `${orderId}.json`);
  await fs.writeFile(orderPath, JSON.stringify(order, null, 2));

  return order;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = await constructStripeEvent(body, signature);

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Create order
        const order = await createOrder(session);

        console.log('Order created:', order.id);

        // Clear cart if cart ID is provided
        if (session.metadata?.cartId) {
          const cartPath = path.join(process.cwd(), 'backend/data/carts', `${session.metadata.cartId}.json`);
          try {
            await fs.unlink(cartPath);
            console.log('Cart cleared:', session.metadata.cartId);
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        }

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Additional processing if needed
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        // Handle failed payment
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
