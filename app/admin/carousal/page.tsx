"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

const STORAGE_KEY = 'admin_carousals_v1'

  const defaultCarousals: Record<string, string[]> = {
  leftTall: [
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752494996/A_realistic_cosmic_calendar_illustration_showing_the_planets_of_the_solar_system_orbiting_around_the_sun_with_soft_lighting_galaxy_background_visible_constellations_moon_phases_and_astrological_zodiac_symbols_s_1_uxgzjk.jpg',
    'https://res.cloudinary.com/dxwspucxw/image/upload/c_crop,ar_9:16/v1753181211/bracelets_lqvtwk.png',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042874/course-5_uvm6d2.jpg',
  ],
  centerTop: [
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042873/cosmiccalendar_v8ndoq.png',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-2_ribcdu.jpg',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/astrology_app_eoszbs.jpg',
  ],
  bottomLeft: [
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042879/zodiac_decoder_aphuoz.avif',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/astrowellness_qltouz.jpg',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-1_lwqxsr.jpg',
  ],
  bottomRight: [
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042876/myth_h93fku.jpg',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-3_h9xwl3.jpg',
  ],
  rightTall: [
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752497900/A_highly_realistic_image_of_a_calm_person_meditating_in_lotus_pose_on_a_flat_rock_bathed_in_soft_golden_sunrise_light._The_background_features_misty_hills_and_subtle_spiritual_symbols_like_chakra_icons_or_Om_sign_faint_zetsen.jpg',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/gemstones_wztxzb.jpg',
    'https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/meditation_b2qe9b.jpg',
  ],
  // mobile previews will reuse desktop sections (centerTop, bottomLeft, bottomRight)
}

export default function AdminCarousalPage() {
  const [carousals, setCarousals] = useState<Record<string, string[]>>(defaultCarousals)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          // Merge with defaults so missing desktop keys fallback to defaults
          setCarousals({ ...defaultCarousals, ...parsed })
        } catch (e) {
          // malformed JSON - ignore
        }
      }
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [message])

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carousals))
    setMessage('Saved to localStorage (frontend only)')
  }

  const addImage = (section: string) => {
    const url = (inputs[section] || '').trim()
    if (!url) return setMessage('Enter an image URL first')
    setCarousals(prev => ({ ...prev, [section]: [...(prev[section] || []), url] }))
    setInputs(prev => ({ ...prev, [section]: '' }))
  }

  const handleFileUpload = (section: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      if (dataUrl) {
        setCarousals(prev => ({ ...prev, [section]: [...(prev[section] || []), dataUrl] }))
        setMessage(`Image uploaded to ${section}`)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (section: string, idx: number) => {
    setCarousals(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }))
  }

  const renderEditor = (key: string, title: string) => (
    <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 text-base sm:text-lg">{title}</h3>
      <div className="space-y-2 sm:space-y-3">
        {(carousals[key] || []).map((url, i) => (
          <div key={i} className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0 relative">
              <Image 
                src={url} 
                alt={`img-${i}`} 
                fill 
                className="object-cover" 
                sizes="80px"
                unoptimized={url.startsWith('data:')}
              />
            </div>
            <div className="flex-1 text-xs sm:text-sm truncate text-gray-700 dark:text-gray-300 min-w-0">
              {url.startsWith('data:') ? `Uploaded image ${i + 1}` : url}
            </div>
            <button 
              onClick={() => removeImage(key, i)} 
              className="text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            value={inputs[key] || ''} 
            onChange={(e) => setInputs(prev => ({ ...prev, [key]: e.target.value }))} 
            placeholder="Enter image URL" 
            className="flex-1 px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
          />
          <button 
            onClick={() => addImage(key)} 
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
          >
            Add URL
          </button>
        </div>
        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(key, file)
                e.target.value = '' // Reset file input
              }
            }}
            className="w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white file:hover:bg-purple-700 file:cursor-pointer focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )

  const sections: { key: string; title: string }[] = [
    { key: 'leftTall', title: 'Left Tall' },
    { key: 'centerTop', title: 'Center Top' },
    { key: 'bottomLeft', title: 'Bottom Left' },
    { key: 'bottomRight', title: 'Bottom Right' },
    { key: 'rightTall', title: 'Right Tall' },
  ]

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Hero Carousel</h1>
          <div className="flex items-center space-x-3">
            {/* <button
              onClick={() => { setCarousals(defaultCarousals); setMessage('Restored defaults (not saved)') }}
              className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white border border-transparent transition-colors text-sm md:text-base"
            >
              Restore Defaults
            </button> */}
            <button onClick={save} className="w-full sm:w-auto px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white transition-colors text-sm md:text-base">Save Changes</button>
           </div>
        </div>

        {message && <div className="mb-4 text-sm text-green-700 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">{message}</div>}

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1 space-y-3 md:space-y-4">
            {sections.map(s => renderEditor(s.key, s.title))}
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 text-lg">Preview</h2>
            <div className="space-y-4 md:space-y-6">
              {/* Desktop and tablet grid preview */}
              <div className="hidden sm:grid grid-cols-4 gap-2 md:gap-4 h-[280px] sm:h-[320px] md:h-[420px]">
                <div className="col-span-1 bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                  <Carousel plugins={[Autoplay({ delay: 3500, stopOnInteraction: false })]} className="h-full">
                    <CarouselContent className="h-full">
                      {(carousals.leftTall || []).map((url, i) => (
                        <CarouselItem key={i} className="h-full">
                          <div className="relative w-full h-full rounded overflow-hidden">
                            <Image 
                              src={url} 
                              alt={`lt-${i}`} 
                              fill 
                              className="object-cover" 
                              sizes="(max-width: 768px) 50vw, 20vw"
                              unoptimized={url.startsWith('data:')}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="h-[160px] sm:h-[200px] md:h-[260px] bg-white dark:bg-gray-800 rounded p-1 sm:p-2 border border-gray-200 dark:border-gray-700">
                    <Carousel plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]} className="h-full">
                      <CarouselContent className="h-full">
                        {(carousals.centerTop || []).map((url, i) => (
                          <CarouselItem key={i} className="h-full">
                            <div className="relative w-full h-full rounded overflow-hidden">
                              <Image 
                                src={url} 
                                alt={`ct-${i}`} 
                                fill 
                                className="object-cover" 
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 40vw"
                                unoptimized={url.startsWith('data:')}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>

                  <div className="grid grid-cols-2 gap-2 h-[100px] sm:h-[110px] md:h-[140px]">
                    <div className="bg-white dark:bg-gray-800 rounded p-1 sm:p-2 border border-gray-200 dark:border-gray-700">
                      <Carousel plugins={[Autoplay({ delay: 3800, stopOnInteraction: false })]} className="h-full">
                        <CarouselContent className="h-full">
                          {(carousals.bottomLeft || []).map((url, i) => (
                            <CarouselItem key={i} className="h-full">
                              <div className="relative w-full h-full rounded overflow-hidden">
                                <Image 
                                  src={url} 
                                  alt={`bl-${i}`} 
                                  fill 
                                  className="object-cover" 
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 40vw, 20vw"
                                  unoptimized={url.startsWith('data:')}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded p-1 sm:p-2 border border-gray-200 dark:border-gray-700">
                      <Carousel plugins={[Autoplay({ delay: 4200, stopOnInteraction: false })]} className="h-full">
                        <CarouselContent className="h-full">
                          {(carousals.bottomRight || []).map((url, i) => (
                            <CarouselItem key={i} className="h-full">
                              <div className="relative w-full h-full rounded overflow-hidden">
                                <Image 
                                  src={url} 
                                  alt={`br-${i}`} 
                                  fill 
                                  className="object-cover" 
                                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 40vw, 20vw"
                                  unoptimized={url.startsWith('data:')}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                  <Carousel plugins={[Autoplay({ delay: 3200, stopOnInteraction: false })]} className="h-full">
                    <CarouselContent className="h-full">
                      {(carousals.rightTall || []).map((url, i) => (
                        <CarouselItem key={i} className="h-full">
                          <div className="relative w-full h-full rounded overflow-hidden">
                            <Image 
                              src={url} 
                              alt={`rt-${i}`} 
                              fill 
                              className="object-cover" 
                              sizes="(max-width: 768px) 50vw, 20vw"
                              unoptimized={url.startsWith('data:')}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              </div>

              {/* Mobile preview */}
              <div className="sm:hidden space-y-3">
                <div className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                  <Carousel plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]} className="h-[180px]">
                    <CarouselContent className="h-[180px]">
                      {(carousals.centerTop || []).map((url, i) => (
                        <CarouselItem key={i} className="h-[180px]">
                          <div className="relative w-full h-full rounded overflow-hidden">
                            <Image 
                              src={url} 
                              alt={`mm-${i}`} 
                              fill 
                              className="object-cover" 
                              sizes="100vw"
                              unoptimized={url.startsWith('data:')}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                    <Carousel plugins={[Autoplay({ delay: 3800, stopOnInteraction: false })]} className="h-[120px]">
                      <CarouselContent className="h-[120px]">
                        {(carousals.bottomLeft || []).map((url, i) => (
                          <CarouselItem key={i} className="h-[120px]">
                            <div className="relative w-full h-full rounded overflow-hidden">
                              <Image 
                                src={url} 
                                alt={`mp-${i}`} 
                                fill 
                                className="object-cover" 
                                sizes="50vw"
                                unoptimized={url.startsWith('data:')}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-2 border border-gray-200 dark:border-gray-700">
                    <Carousel plugins={[Autoplay({ delay: 4200, stopOnInteraction: false })]} className="h-[120px]">
                      <CarouselContent className="h-[120px]">
                        {(carousals.bottomRight || []).map((url, i) => (
                          <CarouselItem key={i} className="h-[120px]">
                            <div className="relative w-full h-full rounded overflow-hidden">
                              <Image 
                                src={url} 
                                alt={`ms-${i}`} 
                                fill 
                                className="object-cover" 
                                sizes="50vw"
                                unoptimized={url.startsWith('data:')}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
