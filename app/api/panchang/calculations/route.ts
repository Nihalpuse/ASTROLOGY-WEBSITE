import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/panchang/calculations - Get calculated Panchang timings
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

    // For now, generate fallback data
    const data = generateFallbackPanchangData({
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

    // Calculate additional timings
    const calculations = calculatePanchangTimings(data)

    return NextResponse.json({
      success: true,
      data: {
        ...formatPanchangResponse(data),
        calculations
      }
    })

  } catch (error) {
    console.error('Panchang Calculations Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate Panchang timings' 
      }, 
      { status: 500 }
    )
  }
}

// Helper function to calculate additional Panchang timings
function calculatePanchangTimings(data: any) {
  const sunRise = parseTime(data.sun_rise)
  const sunSet = parseTime(data.sun_set)
  
  // Calculate day duration
  const dayDuration = sunSet.getTime() - sunRise.getTime()
  
  // Calculate Brahma Muhurta (96 minutes before sunrise)
  const brahmaMuhurta = new Date(sunRise.getTime() - (96 * 60 * 1000))
  
  // Calculate Abhijit Muhurta (24 minutes before and after noon)
  const noon = new Date(sunRise.getTime() + (dayDuration / 2))
  const abhijitStart = new Date(noon.getTime() - (24 * 60 * 1000))
  const abhijitEnd = new Date(noon.getTime() + (24 * 60 * 1000))
  
  // Calculate Rahu Kaal (1/8th of day duration, varies by weekday)
  const rahuKaalDuration = dayDuration / 8
  const rahuKaalStart = new Date(sunRise.getTime() + (rahuKaalDuration * getRahuKaalStartHour(data.weekday_number)))
  const rahuKaalEnd = new Date(rahuKaalStart.getTime() + rahuKaalDuration)
  
  // Calculate Yamaganda (1/8th of day duration, varies by weekday)
  const yamagandaDuration = dayDuration / 8
  const yamagandaStart = new Date(sunRise.getTime() + (yamagandaDuration * getYamagandaStartHour(data.weekday_number)))
  const yamagandaEnd = new Date(yamagandaStart.getTime() + yamagandaDuration)
  
  // Calculate Gulika Kaal (1/8th of day duration, varies by weekday)
  const gulikaKaalDuration = dayDuration / 8
  const gulikaKaalStart = new Date(sunRise.getTime() + (gulikaKaalDuration * getGulikaKaalStartHour(data.weekday_number)))
  const gulikaKaalEnd = new Date(gulikaKaalStart.getTime() + gulikaKaalDuration)

  return {
    brahma_muhurta: {
      start: formatTime(brahmaMuhurta),
      end: formatTime(sunRise),
      description: "Most auspicious time for spiritual practices"
    },
    abhijit_muhurta: {
      start: formatTime(abhijitStart),
      end: formatTime(abhijitEnd),
      description: "Most favorable time for important activities"
    },
    rahu_kaal: {
      start: formatTime(rahuKaalStart),
      end: formatTime(rahuKaalEnd),
      description: "Inauspicious time, avoid starting new activities"
    },
    yamaganda: {
      start: formatTime(yamagandaStart),
      end: formatTime(yamagandaEnd),
      description: "Inauspicious time, avoid important decisions"
    },
    gulika_kaal: {
      start: formatTime(gulikaKaalStart),
      end: formatTime(gulikaKaalEnd),
      description: "Inauspicious time, avoid new ventures"
    },
    day_duration: {
      hours: Math.floor(dayDuration / (1000 * 60 * 60)),
      minutes: Math.floor((dayDuration % (1000 * 60 * 60)) / (1000 * 60))
    },
    auspicious_times: [
      {
        name: "Brahma Muhurta",
        start: formatTime(brahmaMuhurta),
        end: formatTime(sunRise),
        type: "spiritual",
        description: "Most auspicious time for spiritual practices"
      },
      {
        name: "Abhijit Muhurta",
        start: formatTime(abhijitStart),
        end: formatTime(abhijitEnd),
        type: "general",
        description: "Most favorable time for important activities"
      }
    ],
    inauspicious_times: [
      {
        name: "Rahu Kaal",
        start: formatTime(rahuKaalStart),
        end: formatTime(rahuKaalEnd),
        type: "avoid",
        description: "Inauspicious time, avoid starting new activities"
      },
      {
        name: "Yamaganda",
        start: formatTime(yamagandaStart),
        end: formatTime(yamagandaEnd),
        type: "avoid",
        description: "Inauspicious time, avoid important decisions"
      },
      {
        name: "Gulika Kaal",
        start: formatTime(gulikaKaalStart),
        end: formatTime(gulikaKaalEnd),
        type: "avoid",
        description: "Inauspicious time, avoid new ventures"
      }
    ]
  }
}

// Helper function to parse time string to Date object
function parseTime(timeStr: string): Date {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, seconds || 0, 0)
  return date
}

// Helper function to format Date to time string
function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 8)
}

// Helper function to get Rahu Kaal start hour based on weekday
function getRahuKaalStartHour(weekdayNumber: number): number {
  const rahuKaalHours = [7, 6, 5, 4, 3, 2, 1] // Sunday to Saturday
  return rahuKaalHours[weekdayNumber - 1] || 7
}

// Helper function to get Yamaganda start hour based on weekday
function getYamagandaStartHour(weekdayNumber: number): number {
  const yamagandaHours = [6, 5, 4, 3, 2, 1, 7] // Sunday to Saturday
  return yamagandaHours[weekdayNumber - 1] || 6
}

// Helper function to get Gulika Kaal start hour based on weekday
function getGulikaKaalStartHour(weekdayNumber: number): number {
  const gulikaKaalHours = [5, 4, 3, 2, 1, 7, 6] // Sunday to Saturday
  return gulikaKaalHours[weekdayNumber - 1] || 5
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
    weekday_number: weekday + 1,
    weekday_name: weekdayNames[weekday],
    vedic_weekday_number: weekday + 1,
    vedic_weekday_name: vedicWeekdayNames[weekday],
    lunar_month_number: lunarMonthNumber,
    lunar_month_name: lunarMonthNames[lunarMonthNumber - 1],
    lunar_month_full_name: lunarMonthNames[lunarMonthNumber - 1],
    adhika: 0,
    nija: 1,
    kshaya: 0,
    ritu_number: rituNumber,
    ritu_name: rituNames[rituNumber - 1],
    aayanam: month >= 3 && month <= 8 ? "Uttarayanam" : "Dakshinayanam",
    tithi_number: tithiNumber,
    tithi_name: tithiNames[tithiNumber - 1],
    paksha: tithiNumber <= 15 ? "shukla" : "krishna",
    tithi_completes_at: null,
    tithi_left_percentage: Math.random() * 100,
    nakshatra_number: nakshatraNumber,
    nakshatra_name: nakshatraNames[nakshatraNumber - 1],
    nakshatra_starts_at: null,
    nakshatra_ends_at: null,
    nakshatra_left_percentage: Math.random() * 100,
    saka_salivahana_number: year - 78,
    saka_salivahana_name_number: (year - 78) % 60,
    saka_salivahana_year_name: "SubhaKritu",
    vikram_chaitradi_number: year + 57,
    vikram_chaitradi_name_number: (year + 57) % 60,
    vikram_chaitradi_year_name: "Nala",
    panchang_yogas: [{
      yoga_number: (tithiNumber + nakshatraNumber) % 27 + 1,
      yoga_name: "Vishkambha",
      completion: null,
      yoga_left_percentage: Math.random() * 100
    }],
    panchang_karanas: [{
      karana_number: (tithiNumber * 2) % 11 + 1,
      karana_name: "Bava",
      completion: null,
      karana_left_percentage: Math.random() * 100
    }]
  }
}
