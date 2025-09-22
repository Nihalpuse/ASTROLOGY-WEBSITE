import { useState, useEffect } from 'react'

interface PanchangData {
  sun_rise: string
  sun_set: string
  weekday: {
    weekday_number: number
    weekday_name: string
    vedic_weekday_number: number
    vedic_weekday_name: string
  }
  lunar_month: {
    lunar_month_number: number
    lunar_month_name: string
    lunar_month_full_name: string
    adhika: number
    nija: number
    kshaya: number
  }
  ritu: {
    number: number
    name: string
  }
  aayanam: string
  tithi: {
    number: number
    name: string
    paksha: string
    completes_at: string | null
    left_precentage: number | null
  }
  nakshatra: {
    number: number
    name: string
    starts_at: string | null
    ends_at: string | null
    left_percentage: number | null
  }
  yoga: Record<string, {
    number: number
    name: string
    completion: string | null
    yoga_left_percentage: number | null
  }>
  karana: Record<string, {
    number: number
    name: string
    completion: string | null
    karana_left_percentage: number | null
  }>
  year: {
    status: string
    timestamp: string
    saka_salivahana_number: number
    saka_salivahana_name_number: number
    saka_salivahana_year_name: string
    vikram_chaitradi_number: number
    vikram_chaitradi_name_number: number
    vikram_chaitradi_year_name: string
  }
}

interface PanchangCalculations {
  brahma_muhurta: {
    start: string
    end: string
    description: string
  }
  abhijit_muhurta: {
    start: string
    end: string
    description: string
  }
  rahu_kaal: {
    start: string
    end: string
    description: string
  }
  yamaganda: {
    start: string
    end: string
    description: string
  }
  gulika_kaal: {
    start: string
    end: string
    description: string
  }
  day_duration: {
    hours: number
    minutes: number
  }
  auspicious_times: Array<{
    name: string
    start: string
    end: string
    type: string
    description?: string
  }>
  inauspicious_times: Array<{
    name: string
    start: string
    end: string
    type: string
    description?: string
  }>
}

interface UsePanchangOptions {
  date?: Date
  latitude?: number
  longitude?: number
  timezone?: number
  includeCalculations?: boolean
}

interface UsePanchangReturn {
  data: PanchangData | null
  calculations: PanchangCalculations | null
  loading: boolean
  error: string | null
  dataSource: 'database' | 'api' | null
  refetch: () => Promise<void>
}

export function usePanchang(options: UsePanchangOptions = {}): UsePanchangReturn {
  const [data, setData] = useState<PanchangData | null>(null)
  const [calculations, setCalculations] = useState<PanchangCalculations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'database' | 'api' | null>(null)

  const {
    date = new Date(),
    latitude = 17.38333, // Default to Hyderabad
    longitude = 78.4666,
    timezone = 5.5,
    includeCalculations = true
  } = options

  const fetchPanchangData = async () => {
    try {
      setLoading(true)
      setError(null)

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()

      // First try to get from database
      const dbResponse = await fetch(
        `/api/panchang?date=${date.toISOString().split('T')[0]}&latitude=${latitude}&longitude=${longitude}`
      )

      if (dbResponse.ok) {
        const dbResult = await dbResponse.json()
        if (dbResult.success) {
          setData(dbResult.data)
          setDataSource('database')
          
          if (includeCalculations) {
            const calcResponse = await fetch(
              `/api/panchang/calculations?date=${date.toISOString().split('T')[0]}&latitude=${latitude}&longitude=${longitude}`
            )
            if (calcResponse.ok) {
              const calcResult = await calcResponse.json()
              if (calcResult.success) {
                setCalculations(calcResult.data.calculations)
              }
            }
          }
          return
        }
      }

      // If not in database, fetch from API
      const apiResponse = await fetch('/api/panchang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          year,
          month,
          date: day,
          latitude,
          longitude,
          timezone
        })
      })

      if (!apiResponse.ok) {
        const errorResult = await apiResponse.json()
        throw new Error(errorResult.error || `API request failed with status ${apiResponse.status}`)
      }

      const result = await apiResponse.json()

      if (result.success) {
        setData(result.data)
        setDataSource(result.source || 'api')
        
        if (includeCalculations) {
          const calcResponse = await fetch(
            `/api/panchang/calculations?date=${date.toISOString().split('T')[0]}&latitude=${latitude}&longitude=${longitude}`
          )
          if (calcResponse.ok) {
            const calcResult = await calcResponse.json()
            if (calcResult.success) {
              setCalculations(calcResult.data.calculations)
            }
          }
        }
      } else {
        throw new Error(result.error || 'Failed to fetch Panchang data')
      }
    } catch (err) {
      console.error('Error fetching Panchang data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPanchangData()
  }, [date, latitude, longitude, timezone, includeCalculations])

  return {
    data,
    calculations,
    loading,
    error,
    dataSource,
    refetch: fetchPanchangData
  }
}

// Helper function to get current location
export function useCurrentLocation() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (err) => {
          setError(err.message)
        }
      )
    } else {
      setError('Geolocation is not supported by this browser')
    }
  }, [])

  return { location, error }
}
