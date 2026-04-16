/**
 * Stripe Configuration for Geek Gaming Center
 * Handles both Stripe Checkout (hosted) and Stripe Elements (embedded)
 */

import Stripe from 'stripe';
import { CartItem } from '@/types/cart';

/**
 * Initialize Stripe instance with secret key
 * Uses latest API version
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
  typescript: true,
  timeout: 10000, // 10 second timeout
  maxNetworkRetries: 2,
});

/**
 * Create a Stripe Checkout Session (hosted payment page)
 * @param items - Cart items to purchase
 * @param successUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect if payment is cancelled
 * @param cartId - Optional cart ID for metadata
 * @returns Stripe Checkout Session
 */
export async function createCheckoutSession(
  items: CartItem[],
  successUrl: string,
  cancelUrl: string,
  cartId?: string
) {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'XAF', // FCFA (West African CFA Franc)
      product_data: {
        name: item.product.name,
        description: item.product.description?.substring(0, 500) || '', // Stripe max 500 chars
        // Skip images for now - local paths are not valid URLs for Stripe
        // TODO: Use hosted image URLs when available
        images: [],
      },
      unit_amount: Math.round(item.product.price), // Stripe uses cents/units
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...(cartId && { cartId }),
      items: JSON.stringify(items.map(item => ({
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }))),
    },
    customer_email: undefined, // Will be set when user auth is implemented
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['FR', 'CI', 'SN', 'CM'], // France + West African countries
    },
  });

  return session;
}

/**
 * Create a Payment Intent for Stripe Elements (embedded form)
 * @param amount - Payment amount in FCFA
 * @param currency - Currency code (default: 'XAF')
 * @param metadata - Optional metadata
 * @returns Stripe Payment Intent with client secret
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'XAF',
  metadata?: Record<string, string>
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount),
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });

  return paymentIntent;
}

/**
 * Retrieve a Payment Intent by ID
 * @param paymentIntentId - Payment Intent ID
 * @returns Payment Intent details
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Confirm a Payment Intent (for custom flows)
 * @param paymentIntentId - Payment Intent ID
 * @param paymentMethodId - Payment Method ID
 * @returns Confirmed Payment Intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
) {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}

/**
 * Create a Setup Intent for saving payment methods
 * @param customerId - Stripe Customer ID
 * @returns Setup Intent
 */
export async function createSetupIntent(customerId: string) {
  return await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  });
}

/**
 * Verify Stripe webhook signature
 * @param payload - Raw webhook payload
 * @param signature - Stripe-Signature header value
 * @returns Verified event or null
 */
export async function constructStripeEvent(
  payload: string,
  signature: string
) {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Calculate Stripe fee (approximate 2.9% + 0.25€ for cards)
 * @param amount - Amount in FCFA
 * @returns Stripe fee in FCFA
 */
export function calculateStripeFee(amount: number): number {
  const FIXED_FEE_EUR = 0.25;
  const PERCENTAGE_FEE = 0.029;
  const EUR_TO_XAF_RATE = 655.957; // Approximate exchange rate

  const fixedFeeInXaf = Math.round(FIXED_FEE_EUR * EUR_TO_XAF_RATE);
  const percentageFee = Math.round(amount * PERCENTAGE_FEE);

  return fixedFeeInXaf + percentageFee;
}

/**
 * Create a Stripe Checkout Session for arena/booking reservation
 * @param bookingDetails - Booking details
 * @param successUrl - URL to redirect after successful payment
 * @param cancelUrl - URL to redirect if payment is cancelled
 * @returns Stripe Checkout Session
 */
export async function createArenaBookingSession(
  bookingDetails: {
    equipment: string;
    date: string;
    time: string;
    duration: number;
    price: number;
    equipmentId: string;
  },
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'XAF',
          product_data: {
            name: `Réservation - ${bookingDetails.equipment}`,
            description: `Session de gaming de ${bookingDetails.duration} minutes\nDate: ${bookingDetails.date}\nHeure: ${bookingDetails.time}`,
          },
          unit_amount: Math.round(bookingDetails.price),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      type: 'arena_booking',
      equipment_id: bookingDetails.equipmentId,
      equipment_name: bookingDetails.equipment,
      date: bookingDetails.date,
      time: bookingDetails.time,
      duration: bookingDetails.duration.toString(),
      price: bookingDetails.price.toString(),
    },
    customer_email: undefined, // Will be set when user auth is implemented
    billing_address_collection: 'auto',
  });

  return session;
}

