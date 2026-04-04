/**
 * Booking API Route - Geek Gaming Center
 * Proxy vers le backend Express pour les réservations
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/booking/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create booking');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 400 }
    );
  }
}
