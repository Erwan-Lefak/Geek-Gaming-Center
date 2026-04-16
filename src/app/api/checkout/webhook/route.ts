/**
 * Stripe Webhook Handler - Geek Gaming Center
 * POST /api/checkout/webhook - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructStripeEvent } from '@/lib/stripe';
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma/client';
import { MailService } from '@/lib/email/mail-service';

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

/**
 * Generate order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
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

        // Send order confirmation emails if customer email exists
        if (session.customer_details?.email && session.metadata?.items) {
          const customerEmail = session.customer_details.email;
          const customerName = session.customer_details.name || 'Client';
          const items = JSON.parse(session.metadata.items);

          // Calculate totals
          const subtotal = session.amount_total / 100; // Convert from cents
          const shipping = 0; // TODO: Get from metadata if needed
          const total = subtotal;

          // Format shipping address
          const shippingAddress = session.shipping_details
            ? `${session.shipping_details.address?.line1 || ''}\n` +
              `${session.shipping_details.address?.city || ''}\n` +
              `${session.shipping_details.address?.postal_code || ''}\n` +
              `${session.shipping_details.address?.country || ''}`
            : 'Adresse non renseignée';

          // Send order confirmation to customer
          MailService.sendOrderConfirmation(customerEmail, customerName, {
            orderNumber: order.id,
            orderDate: new Date().toLocaleDateString('fr-FR'),
            items: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal,
            shipping,
            total,
            shippingAddress,
          }).catch(err => console.error('Failed to send order confirmation email:', err));

          // Send admin notification
          MailService.sendAdminNewOrder({
            customerName,
            customerEmail,
            orderNumber: order.id,
            orderDate: new Date().toLocaleDateString('fr-FR'),
            paymentMethod: 'Carte bancaire (Stripe)',
            items: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal,
            shipping,
            total,
            shippingAddress,
          }).catch(err => console.error('Failed to send admin order email:', err));
        }

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
