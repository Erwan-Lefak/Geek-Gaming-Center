import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie',
  })

  // Clear customer cookie
  response.cookies.delete('customer_id')

  return response
}
