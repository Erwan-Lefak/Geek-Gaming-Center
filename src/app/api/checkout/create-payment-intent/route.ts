/**
 * Stripe Payment Intent API - Geek Gaming Center
 * POST /api/checkout/create-payment-intent - Create Payment Intent for Stripe Elements
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'XAF', metadata } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create Payment Intent
    const paymentIntent = await createPaymentIntent(amount, currency, metadata);

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error: any) {
    console.error('Payment Intent error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment intent',
      },
      { status: 500 }
    );
  }
}
