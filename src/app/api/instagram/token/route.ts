import { NextRequest, NextResponse } from 'next/server'

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || ''
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET || ''
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || ''

export async function GET(request: NextRequest) {
  try {
    // Échanger le token court contre un Long-Lived Access Token
    const response = await fetch(
      `https://graph.instagram.com/access_token?` +
      `grant_type=ig_exchange_token&` +
      `client_secret=${INSTAGRAM_APP_SECRET}&` +
      `access_token=${INSTAGRAM_ACCESS_TOKEN}`
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: 'Failed to exchange token', details: error },
        { status: 400 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    })
  } catch (error) {
    console.error('Error exchanging token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
