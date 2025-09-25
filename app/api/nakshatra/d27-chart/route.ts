import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type D27Request = {
  year: number
  month: number
  date: number
  hours: number
  minutes: number
  seconds: number
  latitude: number
  longitude: number
  timezone: number
  observation_point?: 'topocentric' | 'geocentric'
  ayanamsha?: 'lahiri' | 'raman' | 'fagan-bradley' | string
}

const EXTERNAL_ENDPOINT = 'https://json.freeastrologyapi.com/d27-chart-svg-code'

// Minimal model typings to avoid `any` while keeping flexibility
interface D27CacheRecord {
  cache_key: string
  year: number
  month: number
  date: number
  hours: number
  minutes: number
  seconds: number
  latitude: number
  longitude: number
  timezone: number
  observation_point: 'topocentric' | 'geocentric'
  language: string
  svg_code: string
}

interface D27CacheModel {
  findUnique: (args: { where: { cache_key: string } }) => Promise<D27CacheRecord | null>
  create: (args: { data: D27CacheRecord }) => Promise<D27CacheRecord>
}

interface PrismaWithD27Cache {
  d27_chart_cache?: D27CacheModel
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<D27Request>
    const required: (keyof D27Request)[] = [
      'year','month','date','hours','minutes','seconds','latitude','longitude','timezone'
    ]

    for (const key of required) {
      const value = body[key]
      if (value === undefined || value === null) {
        return NextResponse.json({ success: false, error: `Missing parameter: ${key}` }, { status: 400 })
      }
      if (typeof value === 'string' && value.trim() === '') {
        return NextResponse.json({ success: false, error: `Missing parameter: ${key}` }, { status: 400 })
      }
    }

    const params: D27Request = {
      year: Number(body.year),
      month: Number(body.month),
      date: Number(body.date),
      hours: Number(body.hours),
      minutes: Number(body.minutes),
      seconds: Number(body.seconds),
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      timezone: Number(body.timezone),
      observation_point: (body.observation_point as D27Request['observation_point']) ?? 'topocentric',
      ayanamsha: (body.ayanamsha as D27Request['ayanamsha']) ?? 'lahiri'
    }

    const cacheKey = [
      params.year, params.month, params.date,
      params.hours, params.minutes, params.seconds,
      params.latitude, params.longitude, params.timezone,
      params.observation_point, params.ayanamsha
    ].join('|')

    // Try cache
    try {
      const cacheModel = (prisma as unknown as PrismaWithD27Cache)?.d27_chart_cache
      if (cacheModel) {
        const cached = await cacheModel.findUnique({ where: { cache_key: cacheKey } })
        if (cached) {
          return NextResponse.json({ success: true, source: 'cache', svg: cached.svg_code })
        }
      }
    } catch (e) {
      // If Prisma is not generated or table missing, continue with external fetch
      console.warn('D27 cache lookup skipped:', e)
    }

    const apiKey = process.env.ASTROLOGY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing ASTROLOGY_API_KEY' }, { status: 500 })
    }

    const externalResp = await fetch(EXTERNAL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'NakstraGyaan/1.0 (+server)'
      },
      body: JSON.stringify({
        year: params.year,
        month: params.month,
        date: params.date,
        hours: params.hours,
        minutes: params.minutes,
        seconds: params.seconds,
        latitude: params.latitude,
        longitude: params.longitude,
        timezone: params.timezone,
        // The external API expects these inside a config object
        config: {
          observation_point: params.observation_point,
          ayanamsha: params.ayanamsha,
        },
      })
    })

    if (!externalResp.ok) {
      const message = await externalResp.text()
      return NextResponse.json({ success: false, error: message || 'External API error' }, { status: externalResp.status })
    }

    let svg = ''
    const text = await externalResp.text()
    // Debug: surface upstream payload when no svg found
    try {
      const parsed: unknown = JSON.parse(text)
      if (typeof parsed === 'string') {
        if (parsed.includes('<svg')) svg = parsed
      } else if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>
        const dataObj = (obj['data'] as Record<string, unknown> | undefined) ?? undefined
        const candidates: unknown[] = [
          obj['svg_code'],
          obj['svg'],
          obj['code'],
          obj['output'],
          dataObj?.['svg_code'],
          dataObj?.['svg']
        ]
        for (const c of candidates) {
          if (typeof c === 'string' && c.includes('<svg')) {
            svg = c
            break
          }
        }
        if (!svg && typeof obj['output'] === 'string' && (obj['output'] as string).includes('<svg')) {
          svg = obj['output'] as string
        }
      }
    } catch {
      if (text.includes('<svg')) svg = text
    }

    if (!svg) {
      // Include a snippet of upstream response for debugging
      const snippet = text.length > 500 ? text.slice(0, 500) + '…' : text
      return NextResponse.json({ success: false, error: 'No SVG returned from external API', upstream: snippet }, { status: 502 })
    }

    // Save to cache (best-effort)
    try {
      const cacheModel = (prisma as unknown as PrismaWithD27Cache)?.d27_chart_cache
      if (cacheModel) {
        await cacheModel.create({
          data: {
            cache_key: cacheKey,
            year: params.year,
            month: params.month,
            date: params.date,
            hours: params.hours,
            minutes: params.minutes,
            seconds: params.seconds,
            latitude: params.latitude,
            longitude: params.longitude,
            timezone: params.timezone,
            observation_point: params.observation_point ?? 'topocentric',
            language: 'en',
            svg_code: svg,
          }
        })
      }
    } catch (e) {
      console.warn('D27 cache save skipped:', e)
    }

    return NextResponse.json({ success: true, source: 'api', svg })
  } catch (error) {
    console.error('D27 Chart Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch D27 chart' }, { status: 500 })
  }
}


