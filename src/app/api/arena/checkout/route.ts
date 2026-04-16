/**
 * Stripe Checkout API for Arena/Booking Reservations
 * POST /api/arena/checkout - Create Stripe Checkout Session for arena booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createArenaBookingSession } from '@/lib/stripe';
import { z } from 'zod';

const arenaBookingSchema = z.object({
  equipment: z.string().min(1, 'Equipment name is required'),
  equipmentId: z.string().min(1, 'Equipment ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  duration: z.number().positive('Duration must be positive'),
  price: z.number().positive('Price must be positive'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = arenaBookingSchema.parse(body);

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await createArenaBookingSession(
      {
        equipment: validatedData.equipment,
        equipmentId: validatedData.equipmentId,
        date: validatedData.date,
        time: validatedData.time,
        duration: validatedData.duration,
        price: validatedData.price,
      },
      `${baseUrl}/arena/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/arena/booking/confirm`
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Arena checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
