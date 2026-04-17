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
import { createInvoiceFromOrder } from '@/lib/invoices/service';

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
 * Generate order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create order in database from checkout session
 */
async function createOrder(session: any) {
  const customerEmail = session.customer_details?.email;

  // Find or create customer
  let customerId = null;
  if (customerEmail) {
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      // Create customer if doesn't exist
      const name = session.customer_details?.name || '';
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      // Find a system user to use as created_by
      const systemUser = await prisma.user.findFirst({
        where: {
          role: 'ADMIN'
        },
        select: {
          id: true
        }
      });

      customer = await prisma.customer.create({
        data: {
          firstName: firstName || 'Client',
          lastName: lastName || 'Inconnu',
          email: customerEmail,
          phone: session.customer_details?.phone || '',
          status: 'REGULAR',
          createdById: systemUser?.id || 'system',
        }
      });
    }

    customerId = customer.id;
  }

  // Parse items
  const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

  // Calculate amounts
  const totalAmount = session.amount_total / 100; // Convert from cents to XAF

  // Format shipping address from Stripe session
  const shippingAddress = session.shipping_details?.address
    ? [
        session.shipping_details.address.line1,
        session.shipping_details.address.line2,
        session.shipping_details.address.city,
        session.shipping_details.address.postal_code,
        session.shipping_details.address.state,
        session.shipping_details.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : null;

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create order in database
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customerId || '', // Will need to handle guest orders
      status: 'CONFIRMED',
      totalAmount,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      shippingAddress,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId || 'unknown',
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        }))
      }
    },
    include: {
      items: true
    }
  });

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

        console.log('✅ [WEBHOOK] Order created:', order.id);

        // Auto-generate invoice
        try {
          const invoice = await createInvoiceFromOrder(order);
          console.log('✅ [WEBHOOK] Invoice generated:', invoice.invoiceNumber);
        } catch (invoiceError) {
          console.error('❌ [WEBHOOK] Failed to generate invoice:', invoiceError);
          // Continue anyway - invoice failure shouldn't break the order
        }

        // Send order confirmation emails if customer email exists
        if (session.customer_details?.email && order) {
          const customerEmail = session.customer_details.email;
          const customerName = session.customer_details.name || 'Client';

          // Calculate totals
          const subtotal = parseFloat(order.totalAmount.toString());
          const shipping = 0;
          const total = subtotal;

          // Use the same shipping address that was saved in the order
          const shippingAddress = order.shippingAddress || 'Adresse non renseignée';

          // Send order confirmation to customer
          MailService.sendOrderConfirmation(customerEmail, customerName, {
            orderNumber: order.orderNumber,
            orderDate: new Date().toLocaleDateString('fr-FR'),
            items: order.items.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.unitPrice.toString()),
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
            orderNumber: order.orderNumber,
            orderDate: new Date().toLocaleDateString('fr-FR'),
            paymentMethod: 'Carte bancaire (Stripe)',
            items: order.items.map(item => ({
              name: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.unitPrice.toString()),
            })),
            subtotal,
            shipping,
            total,
            shippingAddress,
          }).catch(err => console.error('Failed to send admin order email:', err));
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
