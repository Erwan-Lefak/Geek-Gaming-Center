/**
 * Availability API Route - Geek Gaming Center
 * Proxy vers le backend Express pour les disponibilités
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const response = await fetch(`${BACKEND_URL}/api/availability?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
