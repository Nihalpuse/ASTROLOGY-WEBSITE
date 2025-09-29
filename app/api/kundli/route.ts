import { NextRequest, NextResponse } from 'next/server'
import { AstroTime, GeoVector, Ecliptic, Body } from 'astronomy-engine'

type RequestBody = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  ampm?: 'AM' | 'PM'
  timezone: number
  latitude?: number
  longitude?: number
}

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
]

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra','Punarvasu','Pushya','Ashlesha',
  'Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'
]

const TITHIS = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya'
]

function normalizeDegrees(value: number): number {
  const mod = ((value % 360) + 360) % 360
  return mod
}

function toUtcIso({ year, month, day, hour, minute, ampm, timezone }: RequestBody): string {
  let h = hour
  if (ampm === 'PM' && hour < 12) h += 12
  if (ampm === 'AM' && hour === 12) h = 0
  const local = new Date(Date.UTC(year, month - 1, day, h, minute, 0))
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

    // Geocentric ecliptic longitudes for Sun and Moon
    const sunLon = Ecliptic(GeoVector(Body.Sun, time, false)).elon
    const moonLon = Ecliptic(GeoVector(Body.Moon, time, false)).elon

    const sunLonN = normalizeDegrees(sunLon)
    const moonLonN = normalizeDegrees(moonLon)

    // Signs (12 x 30°)
    const sunSignIndex = Math.floor(sunLonN / 30)
    const moonSignIndex = Math.floor(moonLonN / 30)

    // Nakshatra (27 parts)
    const nakLen = 360 / 27 // 13°20'
    const nakIndex = Math.floor(moonLonN / nakLen)
    const nakOffset = moonLonN - nakIndex * nakLen
    const pada = Math.floor(nakOffset / (nakLen / 4)) + 1 // 1..4

    // Tithi (Moon-Sun elongation / 12°)
    const elong = normalizeDegrees(moonLonN - sunLonN)
    const tithiNumber = Math.floor(elong / 12) + 1 // 1..30
    const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna'

    return NextResponse.json({
      success: true,
      dateTimeUtc: iso,
      sun: {
        eclipticLongitude: sunLonN,
        sign: ZODIAC_SIGNS[sunSignIndex]
      },
      moon: {
        eclipticLongitude: moonLonN,
        sign: ZODIAC_SIGNS[moonSignIndex]
      },
      nakshatra: {
        name: NAKSHATRAS[nakIndex],
        number: nakIndex + 1,
        pada
      },
      tithi: {
        name: TITHIS[tithiNumber - 1],
        number: tithiNumber,
        paksha
      }
    })
  } catch (err) {
    console.error('kundli api error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


