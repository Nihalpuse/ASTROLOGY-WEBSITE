// Shared Panchang TypeScript types

export interface PanchangWeekday {
  weekday_number: number
  weekday_name: string
  vedic_weekday_number: number
  vedic_weekday_name: string
}

export interface PanchangLunarMonth {
  lunar_month_number: number
  lunar_month_name: string
  lunar_month_full_name: string
  adhika: number
  nija: number
  kshaya: number
}

export interface PanchangRitu {
  number: number
  name: string
}

export interface PanchangTithi {
  number: number
  name: string
  paksha: string
  completes_at: string | null
  left_precentage: number | null
}

export interface PanchangNakshatra {
  number: number
  name: string
  starts_at: string | null
  ends_at: string | null
  left_percentage: number | null
}

export interface PanchangYogaEntry {
  number: number
  name: string
  completion: string | null
  yoga_left_percentage: number | null
}

export type PanchangYogaMap = Record<number, PanchangYogaEntry>

export interface PanchangKaranaEntry {
  number: number
  name: string
  completion: string | null
  karana_left_percentage: number | null
}

export type PanchangKaranaMap = Record<number, PanchangKaranaEntry>

export interface PanchangYearInfo {
  status: string
  timestamp: string
  saka_salivahana_number: number
  saka_salivahana_name_number: number
  saka_salivahana_year_name: string
  vikram_chaitradi_number: number
  vikram_chaitradi_name_number: number
  vikram_chaitradi_year_name: string
}

export interface PanchangData {
  sun_rise: string
  sun_set: string
  weekday: PanchangWeekday
  lunar_month: PanchangLunarMonth
  ritu: PanchangRitu
  aayanam: string
  tithi: PanchangTithi
  nakshatra: PanchangNakshatra
  yoga: PanchangYogaMap
  karana: PanchangKaranaMap
  year: PanchangYearInfo
}

export interface DatabasePanchangYoga {
  yoga_number: number
  yoga_name: string
  completion: string | null
  yoga_left_percentage: number | null
}

export interface DatabasePanchangKarana {
  karana_number: number
  karana_name: string
  completion: string | null
  karana_left_percentage: number | null
}

export interface DatabasePanchangData {
  sun_rise: string
  sun_set: string
  weekday_number: number
  weekday_name: string
  vedic_weekday_number: number
  vedic_weekday_name: string
  lunar_month_number: number
  lunar_month_name: string
  lunar_month_full_name: string
  adhika: number
  nija: number
  kshaya: number
  ritu_number: number
  ritu_name: string
  aayanam: string
  tithi_number: number
  tithi_name: string
  paksha: string
  tithi_completes_at: string | null
  tithi_left_percentage: number | null
  nakshatra_number: number
  nakshatra_name: string
  nakshatra_starts_at: string | null
  nakshatra_ends_at: string | null
  nakshatra_left_percentage: number | null
  panchang_yogas: DatabasePanchangYoga[]
  panchang_karanas: DatabasePanchangKarana[]
  saka_salivahana_number: number
  saka_salivahana_name_number: number
  saka_salivahana_year_name: string
  vikram_chaitradi_number: number
  vikram_chaitradi_name_number: number
  vikram_chaitradi_year_name: string
}


