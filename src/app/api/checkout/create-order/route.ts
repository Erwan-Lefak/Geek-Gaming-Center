/**
 * Create Order from Stripe Session
 * POST /api/checkout/create-order
 * Creates an order in the database from a completed Stripe checkout session
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma/client';
import { MailService } from '@/lib/email/mail-service';

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Retrieve Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!stripeSession) {
      return NextResponse.json(
        { error: 'Session Stripe introuvable' },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non réussi' },
        { status: 400 }
      );
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        orderNumber: sessionId,
      },
    });

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        order: existingOrder,
      });
    }

    // Get customer email
    const customerEmail = stripeSession.customer_details?.email;

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Email client manquant' },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      // Create customer if doesn't exist
      const name = stripeSession.customer_details?.name || '';
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
          phone: stripeSession.customer_details?.phone || '',
          status: 'REGULAR',
          createdById: systemUser?.id || 'system',
        }
      });
    }

    // Parse items from metadata
    const items = stripeSession.metadata?.items
      ? JSON.parse(stripeSession.metadata.items)
      : [];

    // Calculate amounts
    const totalAmount = stripeSession.amount_total / 100; // Convert from cents to XAF

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: 'CONFIRMED',
        totalAmount,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
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

    // Send confirmation emails (async, don't block response)
    const customerName = stripeSession.customer_details?.name || customer.firstName;
    const shippingAddress = stripeSession.shipping_details
      ? `${stripeSession.shipping_details.address?.line1 || ''}\n` +
        `${stripeSession.shipping_details.address?.city || ''}\n` +
        `${stripeSession.shipping_details.address?.postal_code || ''}\n` +
        `${stripeSession.shipping_details.address?.country || ''}`
      : 'Adresse non renseignée';

    const subtotal = totalAmount;
    const shipping = 0;

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
      total: subtotal,
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
      total: subtotal,
      shippingAddress,
    }).catch(err => console.error('Failed to send admin order email:', err));

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erreur lors de la création de la commande',
      },
      { status: 500 }
    );
  }
}
