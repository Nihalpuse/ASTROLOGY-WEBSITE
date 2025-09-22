import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    if (!lat || !lon) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
    }

    const apiKey = process.env.GEOAPIFY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server API key missing' }, { status: 500 })
    }

    const url = `https://api.geoapify.com/v1/timezone?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&apiKey=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: 'Geoapify timezone failed' }, { status: res.status })
    }
    const data: { timezone?: { offset_STD_seconds?: number } } = await res.json()
    const seconds = data.timezone?.offset_STD_seconds
    return NextResponse.json({ offset_hours: typeof seconds === 'number' ? seconds / 3600 : null })
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}


