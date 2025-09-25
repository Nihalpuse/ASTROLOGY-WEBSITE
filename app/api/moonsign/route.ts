import { NextRequest, NextResponse } from 'next/server'
import { AstroTime, GeoVector, Ecliptic, Body } from 'astronomy-engine'

type RequestBody = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  ampm?: 'AM' | 'PM'
  timezone: number // e.g., 5.5
  latitude?: number
  longitude?: number
}

const MOON_SIGN_NAMES = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
]

function toUtcIso({ year, month, day, hour, minute, ampm, timezone }: RequestBody): string {
  let h = hour
  if (ampm === 'PM' && hour < 12) h += 12
  if (ampm === 'AM' && hour === 12) h = 0
  const local = new Date(Date.UTC(year, month - 1, day, h, minute, 0))
  // Subtract timezone offset (e.g., +5.5 means UTC = local - 5.5h)
  const utcMs = local.getTime() - Math.round(timezone * 3600 * 1000)
  return new Date(utcMs).toISOString()
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody
    const { year, month, day, hour, minute, timezone } = body
    if (!year || !month || !day || hour === undefined || minute === undefined || timezone === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const iso = toUtcIso(body)
    const time = new AstroTime(new Date(iso))
    // Compute geocentric ecliptic longitude of the Moon
    const vec = GeoVector(Body.Moon, time, false)
    const ecl = Ecliptic(vec)
    const eclipticLon = ecl.elon

    // Map longitude (0..360) to 12 signs, each 30 degrees
    const index = Math.floor((((eclipticLon % 360) + 360) % 360) / 30)
    const moonSign = MOON_SIGN_NAMES[index]

    return NextResponse.json({ success: true, moonSign, eclipticLongitude: eclipticLon })
  } catch (err) {
    console.error('moonsign error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


