/**
 * Stripe Booking Success Handler
 * GET /api/arena/booking/success?session_id=xxx
 * Confirms booking after successful Stripe payment
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma/client';
import { generateSessionNumber } from '@/lib/reservations';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session Stripe introuvable' },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non réussi' },
        { status: 400 }
      );
    }

    // Get booking details from metadata
    const metadata = session.metadata;
    if (!metadata || metadata.type !== 'arena_booking') {
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 400 }
      );
    }

    // Check if booking already exists (prevent duplicates)
    const existingBooking = await prisma.gamingSession.findFirst({
      where: {
        stripeSessionId: sessionId,
      },
    });

    if (existingBooking) {
      // Return existing booking
      return NextResponse.json({
        success: true,
        booking: {
          equipment: metadata.equipment_name,
          date: metadata.date,
          startTime: metadata.time,
          duration: parseInt(metadata.duration),
        },
      });
    }

    // Create the reservation
    const [hours, minutes] = metadata.time.split(':').map(Number);

    const startTime = new Date(metadata.date);
    startTime.setHours(hours, minutes, 0, 0);

    const scheduledEndAt = new Date(startTime.getTime() + parseInt(metadata.duration) * 60 * 1000);

    // Get pricing
    const pricing = await prisma.pricing.findFirst({
      where: {
        equipmentId: metadata.equipment_id,
        duration: parseInt(metadata.duration),
        isWeekend: startTime.getDay() === 0 || startTime.getDay() === 6,
      },
    });

    if (!pricing) {
      return NextResponse.json(
        { error: 'Tarif introuvable pour cette réservation' },
        { status: 400 }
      );
    }

    // Get customer (for now use session customer or create default)
    let customerId = session.customer_details?.email
      ? (await prisma.customer.findFirst({
          where: { email: session.customer_details.email },
        }))?.id
      : null;

    // Generate session number
    const sessionNumber = await generateSessionNumber();

    // Create gaming session
    const gamingSession = await prisma.gamingSession.create({
      data: {
        sessionNumber,
        equipmentId: metadata.equipment_id,
        customerId: customerId || null,
        scheduledStartAt: startTime,
        scheduledEndAt,
        duration: parseInt(metadata.duration),
        pricingId: pricing.id,
        price: pricing.price,
        status: 'PENDING',
        stripeSessionId: sessionId,
        stripePaymentIntentId: session.payment_intent as string,
        totalAmount: parseInt(metadata.price),
      },
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: gamingSession.id,
        equipment: metadata.equipment_name,
        date: metadata.date,
        startTime: metadata.time,
        duration: parseInt(metadata.duration),
      },
    });
  } catch (error: any) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la confirmation de la réservation' },
      { status: 500 }
    );
  }
}
