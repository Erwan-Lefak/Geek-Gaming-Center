import { NextRequest, NextResponse } from 'next/server'
import { loginCustomer } from '@/lib/customer/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const customer = await loginCustomer(email, password)

    // Create session token or cookie here
    // For now, return the customer data
    // TODO: Implement proper session management with JWT or cookies

    const response = NextResponse.json({
      success: true,
      customer,
      message: 'Connexion réussie !',
    })

    // Set cookie with customer ID (simplified)
    response.cookies.set('customer_id', customer.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Email ou mot de passe incorrect' },
      { status: 401 }
    )
  }
}
