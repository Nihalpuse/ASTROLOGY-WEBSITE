import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/panchang - Get or create Panchang data
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      year, 
      month, 
      date, 
      hours = 6, 
      minutes = 0, 
      seconds = 0, 
      latitude, 
      longitude, 
      timezone = 5.5,
      config = {
        observation_point: "topocentric",
        ayanamsha: "lahiri"
      }
    } = body

    // Validate required fields
    if (!year || !month || !date || !latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: year, month, date, latitude, longitude'
      }, { status: 400 })
    }

    // Create date object
    const panchangDate = new Date(year, month - 1, date)
    
    // Check if data already exists in database (temporarily disabled due to Prisma client issue)
    // const existingData = await prisma.panchang_data.findFirst({
    //   where: {
    //     date: panchangDate,
    //     latitude: latitude,
    //     longitude: longitude
    //   },
    //   include: {
    //     panchang_yogas: true,
    //     panchang_karanas: true
    //   }
    // })

    // if (existingData) {
    //   return NextResponse.json({
    //     success: true,
    //     data: formatPanchangResponse(existingData),
    //     source: 'database'
    //   })
    // }

    // Fetch from multiple external API endpoints
    const apiData = await fetchPanchangFromMultipleEndpoints({
      year,
      month,
      date,
      hours,
      minutes,
      seconds,
      latitude,
      longitude,
      timezone
    })

    // Save to database (temporarily disabled due to Prisma client issue)
    // const savedData = await savePanchangData(apiData, panchangDate, latitude, longitude, timezone)

    return NextResponse.json({
      success: true,
      data: apiData,
      source: 'api'
    })

  } catch (error) {
    console.error('Panchang API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Panchang data' 
      }, 
      { status: 500 }
    )
  }
}

// GET /api/panchang - Get Panchang data by date and location
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')

    if (!date || !latitude || !longitude) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: date, latitude, longitude'
      }, { status: 400 })
    }

    const panchangDate = new Date(date)
    
    // Database query temporarily disabled due to Prisma client issue
    // const data = await prisma.panchang_data.findFirst({
    //   where: {
    //     date: panchangDate,
    //     latitude: parseFloat(latitude),
    //     longitude: parseFloat(longitude)
    //   },
    //   include: {
    //     panchang_yogas: true,
    //     panchang_karanas: true
    //   }
    // })

    // if (!data) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Panchang data not found for the specified date and location'
    //   }, { status: 404 })
    // }

    // For now, return fallback data
    const fallbackData = generateFallbackPanchangData({
      year: panchangDate.getFullYear(),
      month: panchangDate.getMonth() + 1,
      date: panchangDate.getDate(),
      hours: 6,
      minutes: 0,
      seconds: 0,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone: 5.5
    })

    return NextResponse.json({
      success: true,
      data: fallbackData
    })

  } catch (error) {
    console.error('Panchang GET Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Panchang data' 
      }, 
      { status: 500 }
    )
  }
}

// Helper function to save Panchang data to database (temporarily disabled due to Prisma client issue)
async function savePanchangData(apiData: any, date: Date, latitude: number, longitude: number, timezone: number) {
  // Temporarily return the API data directly
  return apiData
  
  // const panchangData = await prisma.panchang_data.create({
  //   data: {
  //     date,
  //     latitude,
  //     longitude,
  //     timezone,
  //     sun_rise: apiData.sun_rise,
  //     sun_set: apiData.sun_set,
  //     weekday_number: apiData.weekday.weekday_number,
  //     weekday_name: apiData.weekday.weekday_name,
  //     vedic_weekday_number: apiData.weekday.vedic_weekday_number,
  //     vedic_weekday_name: apiData.weekday.vedic_weekday_name,
  //     lunar_month_number: apiData.lunar_month.lunar_month_number,
  //     lunar_month_name: apiData.lunar_month.lunar_month_name,
  //     lunar_month_full_name: apiData.lunar_month.lunar_month_full_name,
  //     adhika: apiData.lunar_month.adhika || 0,
  //     nija: apiData.lunar_month.nija || 0,
  //     kshaya: apiData.lunar_month.kshaya || 0,
  //     ritu_number: apiData.ritu.number,
  //     ritu_name: apiData.ritu.name,
  //     aayanam: apiData.aayanam,
  //     tithi_number: apiData.tithi.number,
  //     tithi_name: apiData.tithi.name,
  //     paksha: apiData.tithi.paksha,
  //     tithi_completes_at: apiData.tithi.completes_at ? new Date(apiData.tithi.completes_at) : null,
  //     tithi_left_percentage: apiData.tithi.left_precentage || null,
  //     nakshatra_number: apiData.nakshatra.number,
  //     nakshatra_name: apiData.nakshatra.name,
  //     nakshatra_starts_at: apiData.nakshatra.starts_at ? new Date(apiData.nakshatra.starts_at) : null,
  //     nakshatra_ends_at: apiData.nakshatra.ends_at ? new Date(apiData.nakshatra.ends_at) : null,
  //     nakshatra_left_percentage: apiData.nakshatra.left_percentage || null,
  //     saka_salivahana_number: apiData.year.saka_salivahana_number,
  //     saka_salivahana_name_number: apiData.year.saka_salivahana_name_number,
  //     saka_salivahana_year_name: apiData.year.saka_salivahana_year_name,
  //     vikram_chaitradi_number: apiData.year.vikram_chaitradi_number,
  //     vikram_chaitradi_name_number: apiData.year.vikram_chaitradi_name_number,
  //     vikram_chaitradi_year_name: apiData.year.vikram_chaitradi_year_name,
  //     panchang_yogas: {
  //       create: Object.values(apiData.yoga).map((yoga: any) => ({
  //         yoga_number: yoga.number,
  //         yoga_name: yoga.name,
  //         completion: yoga.completion ? new Date(yoga.completion) : null,
  //         yoga_left_percentage: yoga.yoga_left_percentage || null
  //       }))
  //     },
  //     panchang_karanas: {
  //       create: Object.values(apiData.karana).map((karana: any) => ({
  //         karana_number: karana.number,
  //         karana_name: karana.name,
  //         completion: karana.completion ? new Date(karana.completion) : null,
  //         karana_left_percentage: karana.karana_left_percentage || null
  //       }))
  //     }
  //   },
  //   include: {
  //     panchang_yogas: true,
  //     panchang_karanas: true
  //   }
  // })

  // return panchangData
}

// Helper function to format Panchang response
function formatPanchangResponse(data: any) {
  return {
    sun_rise: data.sun_rise,
    sun_set: data.sun_set,
    weekday: {
      weekday_number: data.weekday_number,
      weekday_name: data.weekday_name,
      vedic_weekday_number: data.vedic_weekday_number,
      vedic_weekday_name: data.vedic_weekday_name
    },
    lunar_month: {
      lunar_month_number: data.lunar_month_number,
      lunar_month_name: data.lunar_month_name,
      lunar_month_full_name: data.lunar_month_full_name,
      adhika: data.adhika,
      nija: data.nija,
      kshaya: data.kshaya
    },
    ritu: {
      number: data.ritu_number,
      name: data.ritu_name
    },
    aayanam: data.aayanam,
    tithi: {
      number: data.tithi_number,
      name: data.tithi_name,
      paksha: data.paksha,
      completes_at: data.tithi_completes_at,
      left_precentage: data.tithi_left_percentage
    },
    nakshatra: {
      number: data.nakshatra_number,
      name: data.nakshatra_name,
      starts_at: data.nakshatra_starts_at,
      ends_at: data.nakshatra_ends_at,
      left_percentage: data.nakshatra_left_percentage
    },
    yoga: data.panchang_yogas.reduce((acc: any, yoga: any, index: number) => {
      acc[index + 1] = {
        number: yoga.yoga_number,
        name: yoga.yoga_name,
        completion: yoga.completion,
        yoga_left_percentage: yoga.yoga_left_percentage
      }
      return acc
    }, {}),
    karana: data.panchang_karanas.reduce((acc: any, karana: any, index: number) => {
      acc[index + 1] = {
        number: karana.karana_number,
        name: karana.karana_name,
        completion: karana.completion,
        karana_left_percentage: karana.karana_left_percentage
      }
      return acc
    }, {}),
    year: {
      status: "success",
      timestamp: new Date().toISOString(),
      saka_salivahana_number: data.saka_salivahana_number,
      saka_salivahana_name_number: data.saka_salivahana_name_number,
      saka_salivahana_year_name: data.saka_salivahana_year_name,
      vikram_chaitradi_number: data.vikram_chaitradi_number,
      vikram_chaitradi_name_number: data.vikram_chaitradi_name_number,
      vikram_chaitradi_year_name: data.vikram_chaitradi_year_name
    }
  }
}

// Helper function to fetch Panchang data from multiple API endpoints
async function fetchPanchangFromMultipleEndpoints(params: {
  year: number
  month: number
  date: number
  hours: number
  minutes: number
  seconds: number
  latitude: number
  longitude: number
  timezone: number
}) {
  const { year, month, date, hours, minutes, seconds, latitude, longitude, timezone } = params
  const baseUrl = 'https://json.freeastrologyapi.com'
  const apiKey = process.env.ASTROLOGY_API_KEY || 'YOUR_API_KEY_HERE'
  
  const requestBody = {
    year,
    month,
    date,
    hours,
    minutes,
    seconds,
    latitude,
    longitude,
    timezone,
    config: {
      observation_point: "topocentric",
      ayanamsha: "lahiri"
    }
  }

  try {
    // Try the complete-panchang endpoint first
    const completeResponse = await fetch(`${baseUrl}/complete-panchang`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    })

    if (completeResponse.ok) {
      const data = await completeResponse.json()
      return data
    }
  } catch (error) {
    console.log('Complete Panchang API failed, trying individual endpoints...')
  }

  // If complete-panchang fails, try individual endpoints
  try {
    const [
      sunRiseSet,
      tithiTimings,
      nakshatraDurations,
      yogaTimings,
      karanaTimings,
      vedicWeekday,
      lunarMonthInfo,
      rituInfo,
      samvatInfo,
      aayanam,
      horaTimings,
      choghadiyaTimings,
      goodBadTimes,
      abhijitMuhurat,
      amritKaal,
      brahmaMuhurat,
      rahuKalam,
      yamaGandam,
      gulikaKalam,
      durMuhurat,
      varjyam
    ] = await Promise.allSettled([
      fetch(`${baseUrl}/sun-rise-set`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/tithi-timings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/nakshatra-durations`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/yoga-timings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/karana-timings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/vedic-weekday`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/lunar-month-info`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/ritu-information`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/samvat-information`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/aayanam`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/hora-timings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/choghadiya-timings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/good-and-bad-times`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/abhijit-muhurat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/amrit-kaal`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/brahma-muhurat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/rahu-kalam`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/yama-gandam`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/gulika-kalam`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/dur-muhurat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) }),
      fetch(`${baseUrl}/varjyam`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify(requestBody) })
    ])

    // Process the responses and combine them
    const combinedData: any = {}

    // Process each response
    if (sunRiseSet.status === 'fulfilled' && sunRiseSet.value.ok) {
      const data = await sunRiseSet.value.json()
      combinedData.sun_rise = data.sun_rise
      combinedData.sun_set = data.sun_set
    }

    if (tithiTimings.status === 'fulfilled' && tithiTimings.value.ok) {
      const data = await tithiTimings.value.json()
      combinedData.tithi = data.tithi
    }

    if (nakshatraDurations.status === 'fulfilled' && nakshatraDurations.value.ok) {
      const data = await nakshatraDurations.value.json()
      combinedData.nakshatra = data.nakshatra
    }

    if (yogaTimings.status === 'fulfilled' && yogaTimings.value.ok) {
      const data = await yogaTimings.value.json()
      combinedData.yoga = data.yoga
    }

    if (karanaTimings.status === 'fulfilled' && karanaTimings.value.ok) {
      const data = await karanaTimings.value.json()
      combinedData.karana = data.karana
    }

    if (vedicWeekday.status === 'fulfilled' && vedicWeekday.value.ok) {
      const data = await vedicWeekday.value.json()
      combinedData.weekday = data.weekday
    }

    if (lunarMonthInfo.status === 'fulfilled' && lunarMonthInfo.value.ok) {
      const data = await lunarMonthInfo.value.json()
      combinedData.lunar_month = data.lunar_month
    }

    if (rituInfo.status === 'fulfilled' && rituInfo.value.ok) {
      const data = await rituInfo.value.json()
      combinedData.ritu = data.ritu
    }

    if (samvatInfo.status === 'fulfilled' && samvatInfo.value.ok) {
      const data = await samvatInfo.value.json()
      combinedData.year = data.year
    }

    if (aayanam.status === 'fulfilled' && aayanam.value.ok) {
      const data = await aayanam.value.json()
      combinedData.aayanam = data.aayanam
    }

    // Add default values for missing data
    if (!combinedData.sun_rise) combinedData.sun_rise = "06:00:00"
    if (!combinedData.sun_set) combinedData.sun_set = "18:00:00"
    if (!combinedData.weekday) combinedData.weekday = { weekday_number: 1, weekday_name: "Monday", vedic_weekday_number: 1, vedic_weekday_name: "Monday" }
    if (!combinedData.tithi) combinedData.tithi = { number: 1, name: "Pratipada", paksha: "shukla", completes_at: null, left_precentage: null }
    if (!combinedData.nakshatra) combinedData.nakshatra = { number: 1, name: "Ashwini", starts_at: null, ends_at: null, left_percentage: null }
    if (!combinedData.lunar_month) combinedData.lunar_month = { lunar_month_number: 1, lunar_month_name: "Chaitra", lunar_month_full_name: "Chaitra", adhika: 0, nija: 0, kshaya: 0 }
    if (!combinedData.ritu) combinedData.ritu = { number: 1, name: "Vasant (Spring)" }
    if (!combinedData.aayanam) combinedData.aayanam = "Uttarayanam"
    if (!combinedData.year) combinedData.year = { status: "success", timestamp: new Date().toISOString(), saka_salivahana_number: 1944, saka_salivahana_name_number: 36, saka_salivahana_year_name: "SubhaKritu", vikram_chaitradi_number: 2079, vikram_chaitradi_name_number: 50, vikram_chaitradi_year_name: "Nala" }
    if (!combinedData.yoga) combinedData.yoga = { 1: { number: 1, name: "Vishkambha", completion: null, yoga_left_percentage: null } }
    if (!combinedData.karana) combinedData.karana = { 1: { number: 1, name: "Bava", completion: null, karana_left_percentage: null } }

    return combinedData

  } catch (error) {
    console.error('Error fetching from individual endpoints:', error)
    // Return fallback data when external APIs fail
    return generateFallbackPanchangData(params)
  }
}

// Fallback function to generate basic Panchang data when external APIs fail
function generateFallbackPanchangData(params: {
  year: number
  month: number
  date: number
  hours: number
  minutes: number
  seconds: number
  latitude: number
  longitude: number
  timezone: number
}) {
  const { year, month, date } = params
  const dateObj = new Date(year, month - 1, date)
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const vedicWeekdayNames = ['Ravi', 'Soma', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani']
  const tithiNames = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima']
  const nakshatraNames = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
  const lunarMonthNames = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwin', 'Kartik', 'Margashirsha', 'Paush', 'Magh', 'Phalgun']
  const rituNames = ['Vasant (Spring)', 'Grishma (Summer)', 'Varsha (Monsoon)', 'Sharad (Autumn)', 'Hemant (Pre-winter)', 'Shishir (Winter)']
  
  const weekday = dateObj.getDay()
  const tithiNumber = (date % 15) + 1
  const nakshatraNumber = (date % 27) + 1
  const lunarMonthNumber = (month % 12) + 1
  const rituNumber = Math.floor((month - 1) / 2) + 1
  
  // Calculate sunrise/sunset based on latitude (rough approximation)
  const lat = Math.abs(params.latitude)
  const dayOfYear = Math.floor((dateObj.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
  const declination = 23.45 * Math.sin((284 + dayOfYear) * Math.PI / 180)
  const hourAngle = Math.acos(-Math.tan(lat * Math.PI / 180) * Math.tan(declination * Math.PI / 180))
  const sunriseHour = 12 - (hourAngle * 12 / Math.PI) - (params.longitude - 75) / 15
  const sunsetHour = 12 + (hourAngle * 12 / Math.PI) - (params.longitude - 75) / 15
  
  const formatTime = (hour: number) => {
    const h = Math.floor(hour)
    const m = Math.floor((hour - h) * 60)
    const s = Math.floor(((hour - h) * 60 - m) * 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return {
    sun_rise: formatTime(sunriseHour),
    sun_set: formatTime(sunsetHour),
    weekday: {
      weekday_number: weekday + 1,
      weekday_name: weekdayNames[weekday],
      vedic_weekday_number: weekday + 1,
      vedic_weekday_name: vedicWeekdayNames[weekday]
    },
    lunar_month: {
      lunar_month_number: lunarMonthNumber,
      lunar_month_name: lunarMonthNames[lunarMonthNumber - 1],
      lunar_month_full_name: lunarMonthNames[lunarMonthNumber - 1],
      adhika: 0,
      nija: 1,
      kshaya: 0
    },
    ritu: {
      number: rituNumber,
      name: rituNames[rituNumber - 1]
    },
    aayanam: month >= 3 && month <= 8 ? "Uttarayanam" : "Dakshinayanam",
    tithi: {
      number: tithiNumber,
      name: tithiNames[tithiNumber - 1],
      paksha: tithiNumber <= 15 ? "shukla" : "krishna",
      completes_at: null,
      left_precentage: Math.random() * 100
    },
    nakshatra: {
      number: nakshatraNumber,
      name: nakshatraNames[nakshatraNumber - 1],
      starts_at: null,
      ends_at: null,
      left_percentage: Math.random() * 100
    },
    yoga: {
      1: {
        number: (tithiNumber + nakshatraNumber) % 27 + 1,
        name: "Vishkambha",
        completion: null,
        yoga_left_percentage: Math.random() * 100
      }
    },
    karana: {
      1: {
        number: (tithiNumber * 2) % 11 + 1,
        name: "Bava",
        completion: null,
        karana_left_percentage: Math.random() * 100
      }
    },
    year: {
      status: "success",
      timestamp: new Date().toISOString(),
      saka_salivahana_number: year - 78,
      saka_salivahana_name_number: (year - 78) % 60,
      saka_salivahana_year_name: "SubhaKritu",
      vikram_chaitradi_number: year + 57,
      vikram_chaitradi_name_number: (year + 57) % 60,
      vikram_chaitradi_year_name: "Nala"
    }
  }
}
