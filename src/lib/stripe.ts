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
        images: item.product.image ? [item.product.image] : [],
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
    metadata: cartId ? { cartId } : undefined,
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
