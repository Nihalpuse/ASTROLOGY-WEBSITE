import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createHash } from 'crypto'

type BirthDetails = {
  year: number
  month: number
  date: number
  hours: number
  minutes: number
  seconds: number
  latitude: number
  longitude: number
  timezone: number
}

type RequestBody = {
  female: BirthDetails
  male: BirthDetails
  observation_point?: 'topocentric' | 'geocentric'
  language?: 'te' | 'hi' | 'en'
  ayanamsha?: 'sayana' | 'lahiri'
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

function stableCacheKey(body: RequestBody): string {
  // Hash the normalized payload to keep key length bounded (64 hex chars)
  const normalized = JSON.stringify({
    female: body.female,
    male: body.male,
    observation_point: body.observation_point ?? 'topocentric',
    language: body.language ?? 'en',
    ayanamsha: body.ayanamsha ?? 'lahiri',
  })
  const digest = createHash('sha256').update(normalized).digest('hex')
  return `ashtakoot:${digest}`
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASTROLOGY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfiguration: missing ASTROLOGY_API_KEY' }, { status: 500 })
    }

    const body = (await req.json()) as RequestBody

    // Basic validation (types only; ranges are handled downstream)
    if (!body?.female || !body?.male) {
      return NextResponse.json({ error: 'female and male objects are required' }, { status: 400 })
    }

    const language: 'te' | 'hi' | 'en' = body.language ?? 'en'

    const cacheKey = stableCacheKey(body)
    const now = new Date()

    // Try cache
    const cached = await prisma.ashtakoot_score_cache.findUnique({ where: { cache_key: cacheKey } })
    if (cached && cached.expires_at > now) {
      return NextResponse.json({ success: true, cached: true, data: cached.response })
    }

    // Proxy to FreeAstrology API
    const upstreamRes = await fetch('https://json.freeastrologyapi.com/match-making/ashtakoot-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        female: body.female,
        male: body.male,
        observation_point: body.observation_point ?? 'topocentric',
        language,
        ayanamsha: body.ayanamsha ?? 'lahiri',
      }),
      // 20s timeout via AbortController if needed (Node fetch supports AbortSignal)
    })

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text()
      return NextResponse.json({ error: 'Upstream error', details: text }, { status: upstreamRes.status })
    }

    const data = await upstreamRes.json()

    // Upsert cache
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS)
    await prisma.ashtakoot_score_cache.upsert({
      where: { cache_key: cacheKey },
      create: {
        cache_key: cacheKey,
        language,
        request: {
          female: body.female,
          male: body.male,
          observation_point: body.observation_point ?? 'topocentric',
          language,
          ayanamsha: body.ayanamsha ?? 'lahiri',
        },
        response: data,
        expires_at: expiresAt,
      },
      update: {
        response: data,
        expires_at: expiresAt,
      },
    })

    return NextResponse.json({ success: true, cached: false, data })
  } catch (err) {
    console.error('ashtakoot-score error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


