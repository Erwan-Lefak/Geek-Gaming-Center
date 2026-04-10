import { NextResponse } from 'next/server'

const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || ''
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || ''

export async function GET() {
  try {
    if (!INSTAGRAM_USER_ID || !INSTAGRAM_ACCESS_TOKEN) {
      console.error('Instagram credentials not configured')
      return NextResponse.json(
        { error: 'Instagram not configured', media: [] },
        { status: 200 }
      )
    }

    const response = await fetch(
      `https://graph.instagram.com/${INSTAGRAM_USER_ID}/media?` +
      `fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&` +
      `access_token=${INSTAGRAM_ACCESS_TOKEN}&` +
      `limit=6`
    )

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Transformer les données pour un usage facile
    const media = (data.data || []).map((item: any) => ({
      id: item.id,
      type: item.media_type,
      url: item.media_url,
      thumbnail: item.thumbnail_url || item.media_url,
      caption: item.caption,
      permalink: item.permalink,
      timestamp: item.timestamp,
    }))

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching Instagram media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram media', media: [] },
      { status: 200 }
    )
  }
}
