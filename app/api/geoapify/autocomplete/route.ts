import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const text = searchParams.get('text')?.trim()
    const limit = searchParams.get('limit') || '5'

    if (!text || text.length < 3) {
      return NextResponse.json({ results: [] })
    }

    const apiKey = process.env.GEOAPIFY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ results: [], error: 'Server API key missing' }, { status: 500 })
    }

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=${encodeURIComponent(limit)}&format=json&apiKey=${apiKey}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ results: [], error: 'Geoapify autocomplete failed' }, { status: res.status })
    }
    const data: { results?: Array<{ formatted: string; lat: number; lon: number }> } = await res.json()
    const results = (data.results || []).map(item => ({ label: item.formatted, lat: item.lat, lon: item.lon }))
    return NextResponse.json({ results })
  } catch (e) {
    return NextResponse.json({ results: [], error: 'Unexpected server error' }, { status: 500 })
  }
}


