'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AstrologerProfile } from '@/app/components/AstrologerProfile';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, RefreshCw, MapPin, Calendar } from 'lucide-react';
import { usePanchang, useCurrentLocation } from '../../../hooks/usePanchang';

const TodayPanchangPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customLocation, setCustomLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  const { location: currentLocation, error: locationError } = useCurrentLocation();
  const { data: panchangData, calculations, loading, error, dataSource, refetch } = usePanchang({
    date: selectedDate,
    latitude: customLocation?.latitude || (isLocationEnabled ? currentLocation?.latitude : 17.38333) || 17.38333,
    longitude: customLocation?.longitude || (isLocationEnabled ? currentLocation?.longitude : 78.4666) || 78.4666,
    includeCalculations: true
  });

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleLocationToggle = () => {
    setIsLocationEnabled(!isLocationEnabled);
    if (!isLocationEnabled && currentLocation) {
      setCustomLocation(null);
    }
  };

  const faqData = [
    {
      question: "What exactly is Panchang?",
      answer: "Panchang is a comprehensive Hindu astrological calendar that contains five essential elements: Tithi (lunar day), Vara (weekday), Nakshatra (star constellation), Yoga (auspicious combination), and Karana (half lunar day). It serves as a guide for determining auspicious and inauspicious times for various activities.",
      borderColor: "border-orange-400"
    },
    {
      question: "How can Panchang help in daily life planning?",
      answer: "Panchang helps you align your activities with cosmic energies by identifying favorable times for important work, avoiding inauspicious periods like Rahu Kaal, and choosing optimal timing for ceremonies, business ventures, and personal milestones.",
      borderColor: "border-purple-400"
    },
    {
      question: "What information does a daily Panchang contain?",
      answer: "A daily Panchang includes the current Tithi, Nakshatra, Yoga, Karana, sunrise/sunset times, moonrise/moonset times, auspicious muhurtas, inauspicious periods like Rahu Kaal, and specific guidance for the day's activities.",
      borderColor: "border-blue-400"
    },
    {
      question: "How does Tithi influence daily activities?",
      answer: "Tithi represents the lunar day and significantly influences the energy of the day. Different Tithis are favorable for different activities - some are excellent for new beginnings, others for completion of projects, and some are best avoided for important work.",
      borderColor: "border-green-400"
    },
    {
      question: "Can Panchang be used for selecting wedding dates?",
      answer: "Yes, Panchang is essential for selecting auspicious wedding dates. It helps identify favorable Tithis, Nakshatras, and muhurtas while avoiding inauspicious combinations. However, for weddings, detailed kundali matching and consultation with an astrologer is also recommended.",
      borderColor: "border-red-400"
    },
    {
      question: "Do different regions have different Panchang calculations?",
      answer: "Yes, Panchang calculations can vary slightly based on geographical location and the specific school of astrology followed. Regional variations account for local sunrise/sunset times and may use different computational methods, but the core principles remain consistent.",
      borderColor: "border-indigo-400"
    }
  ];
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20 font-sans">
      <div className="max-w-7xl mx-auto pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 relative z-10">
        
        {/* Banner Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full rounded-2xl sm:rounded-3xl py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-16 mb-8 sm:mb-10 lg:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]"
          style={{ backgroundColor: "#FEFBF2" }}
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-3 sm:mb-4 text-center drop-shadow-lg font-serif leading-tight"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Today&apos;s Panchang
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-center max-w-4xl font-sans mb-6 sm:mb-8 leading-relaxed"
            style={{
              fontFamily: "Open Sans, Arial, sans-serif",
              color: "#166534",
            }}
          >
            Discover the most auspicious and inauspicious times for your daily activities using traditional Vedic astrology
          </p>

          {/* Today's Date Display and Location Settings */}
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Today's Date Display */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
                <div className="flex items-center gap-3">
                  <Calendar className="text-green-600 w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs text-green-600 font-medium mb-1 block">Today&apos;s Date</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedDate.toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Selector */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-600 w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs text-green-600 font-medium mb-2 block">Location Settings</label>
                    <div className="space-y-2">
                      <button
                        onClick={handleLocationToggle}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isLocationEnabled 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {isLocationEnabled ? '📍 Auto Location' : '📍 Manual Location'}
                      </button>
                      
                      {!isLocationEnabled && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Latitude"
                            value={customLocation?.latitude || ''}
                            onChange={(e) => setCustomLocation(prev => ({ 
                              latitude: parseFloat(e.target.value) || 17.38333, 
                              longitude: prev?.longitude || 78.4666 
                            }))}
                            className="px-2 py-1 border border-emerald-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900 font-medium hover:border-emerald-400 transition-all duration-200"
                            step="0.000001"
                          />
                          <input
                            type="number"
                            placeholder="Longitude"
                            value={customLocation?.longitude || ''}
                            onChange={(e) => setCustomLocation(prev => ({ 
                              latitude: prev?.latitude || 17.38333, 
                              longitude: parseFloat(e.target.value) || 78.4666 
                            }))}
                            className="px-2 py-1 border border-emerald-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-gray-900 font-medium hover:border-emerald-400 transition-all duration-200"
                            step="0.000001"
                          />
                        </div>
                      )}
                      
                      {isLocationEnabled && currentLocation && (
                        <div className="px-2 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs">
                          <span className="text-emerald-700 font-medium">
                            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      
                      {isLocationEnabled && locationError && (
                        <div className="px-2 py-1 bg-red-50 border border-red-200 rounded text-xs">
                          <span className="text-red-600 font-medium">
                            Location unavailable
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
                <div className="flex items-center gap-3">
                  <RefreshCw className="text-green-600 w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs text-green-600 font-medium mb-1 block">Actions</label>
                    <button
                      onClick={refetch}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed text-sm"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-white' : 'text-white'}`} />
                      {loading ? 'Loading...' : 'Refresh Data'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Location Info */}
            {isLocationEnabled && currentLocation && (
              <div className="text-center text-sm text-gray-600 mb-4">
                Using your current location: {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              </div>
            )}

            {/* Data Source Indicator */}
            {dataSource && (
              <div className="text-center text-xs text-gray-500 mb-4">
                Data source: {dataSource === 'database' ? '📊 Cached from database' : '🌐 Fetched from API'}
              </div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">Loading Panchang data...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-2xl bg-red-50 border border-red-200 p-8 mb-8 text-center">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Introduction Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Is Panchang?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Panchang is the Hindu calendar that comprises 5 essential elements, serving as an astrological calendar aligned with ancient Vedic traditions. It is one of the most prominent tools in astrology that indicates auspicious and inauspicious times based on celestial movements.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                This comprehensive system helps determine the most favorable times for important activities like business ventures, festivals, ceremonies, and personal milestones. Panchang includes detailed astrological calculations covering festival dates, fasting periods, Nakshatra positions, and optimal timing for various endeavors.
              </p>
              <div className="text-center">
                <button className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get Your Personalized Kundli →
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Panchang For Today Table */}
        {panchangData && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#e6c77e]">
              <div className="p-6 text-center" style={{ backgroundColor: '#FEFBF2' }}>
                <h2 className="text-3xl font-bold flex items-center justify-center text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  <span className="mr-3">🕉️</span>
                  Today&apos;s Panchang Details
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-4"></div>
                <p className="text-gray-800 text-lg font-medium">
                  {selectedDate.toLocaleDateString('en-GB')} • {panchangData.weekday.weekday_name}
                </p>
              </div>
              
                  <div className="p-4 sm:p-6">
                    {/* Mobile: two-column details (1 = label, 2 = value) - shows on xs only */}
                    <div className="sm:hidden bg-white rounded-lg p-2 mb-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-semibold text-[#23244a]">Sunrise</div>
                        <div className="text-gray-700">{panchangData.sun_rise}</div>

                        <div className="font-semibold text-[#23244a]">Sunset</div>
                        <div className="text-gray-700">{panchangData.sun_set}</div>

                        <div className="font-semibold text-[#23244a]">Paksha</div>
                        <div className="text-gray-700 capitalize">{panchangData.tithi.paksha} Paksha</div>

                        <div className="font-semibold text-[#23244a]">Tithi</div>
                        <div className="text-gray-700">{panchangData.tithi.name} ({panchangData.tithi.number})</div>

                        <div className="font-semibold text-[#23244a]">Nakshatra</div>
                        <div className="text-gray-700">{panchangData.nakshatra.name}</div>

                        <div className="font-semibold text-[#23244a]">Lunar Month</div>
                        <div className="text-gray-700">{panchangData.lunar_month.lunar_month_full_name}</div>

                        <div className="font-semibold text-[#23244a]">Ritu (Season)</div>
                        <div className="text-gray-700">{panchangData.ritu.name}</div>

                        <div className="font-semibold text-[#23244a]">Aayanam</div>
                        <div className="text-gray-700">{panchangData.aayanam}</div>

                        <div className="font-semibold text-[#23244a]">Vikram Samvat</div>
                        <div className="text-gray-700">{panchangData.year.vikram_chaitradi_year_name}</div>

                        <div className="font-semibold text-[#23244a]">Saka Era</div>
                        <div className="text-gray-700">{panchangData.year.saka_salivahana_year_name}</div>

                        {calculations && (
                          <>
                            <div className="font-semibold text-[#23244a]">Brahma Muhurta</div>
                            <div className="text-green-600 font-medium">{calculations.brahma_muhurta.start} - {calculations.brahma_muhurta.end}</div>

                            <div className="font-semibold text-[#23244a]">Abhijit Muhurta</div>
                            <div className="text-green-600 font-medium">{calculations.abhijit_muhurta.start} - {calculations.abhijit_muhurta.end}</div>

                            <div className="font-semibold text-[#23244a]">Rahu Kaal</div>
                            <div className="text-red-600 font-medium">{calculations.rahu_kaal.start} - {calculations.rahu_kaal.end}</div>

                            <div className="font-semibold text-[#23244a]">Yamaganda</div>
                            <div className="text-red-600 font-medium">{calculations.yamaganda.start} - {calculations.yamaganda.end}</div>

                            <div className="font-semibold text-[#23244a]">Gulika Kaal</div>
                            <div className="text-red-600 font-medium">{calculations.gulika_kaal.start} - {calculations.gulika_kaal.end}</div>

                            <div className="font-semibold text-[#23244a]">Day Duration</div>
                            <div className="text-gray-700">{calculations.day_duration.hours}h {calculations.day_duration.minutes}m</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Desktop/tablet: original table (hidden on xs) */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full min-w-full sm:min-w-[600px]">
                        <tbody className="text-xs sm:text-sm">
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a] w-1/4" style={{ backgroundColor: '#FEFBF2' }}>Sunrise</td>
                            <td className="p-2 sm:p-4 text-gray-700 w-1/4">{panchangData.sun_rise}</td>
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a] w-1/4" style={{ backgroundColor: '#FEFBF2' }}>Sunset</td>
                            <td className="p-2 sm:p-4 text-gray-700 w-1/4">{panchangData.sun_set}</td>
                          </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Paksha</td>
                        <td className="p-2 sm:p-4 text-gray-700 capitalize">{panchangData.tithi.paksha} Paksha</td>
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Tithi</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.tithi.name} ({panchangData.tithi.number})</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Nakshatra</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.nakshatra.name}</td>
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Lunar Month</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.lunar_month.lunar_month_full_name}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Ritu (Season)</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.ritu.name}</td>
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Aayanam</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.aayanam}</td>
                      </tr>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Vikram Samvat</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.year.vikram_chaitradi_year_name}</td>
                        <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Saka Era</td>
                        <td className="p-2 sm:p-4 text-gray-700">{panchangData.year.saka_salivahana_year_name}</td>
                      </tr>
                      {calculations && (
                        <>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Brahma Muhurta</td>
                            <td className="p-2 sm:p-4 text-green-600 font-medium">{calculations.brahma_muhurta.start} - {calculations.brahma_muhurta.end}</td>
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Abhijit Muhurta</td>
                            <td className="p-2 sm:p-4 text-green-600 font-medium">{calculations.abhijit_muhurta.start} - {calculations.abhijit_muhurta.end}</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Rahu Kaal</td>
                            <td className="p-2 sm:p-4 text-red-600 font-medium">{calculations.rahu_kaal.start} - {calculations.rahu_kaal.end}</td>
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Yamaganda</td>
                            <td className="p-2 sm:p-4 text-red-600 font-medium">{calculations.yamaganda.start} - {calculations.yamaganda.end}</td>
                          </tr>
                          <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Gulika Kaal</td>
                            <td className="p-2 sm:p-4 text-red-600 font-medium">{calculations.gulika_kaal.start} - {calculations.gulika_kaal.end}</td>
                            <td className="p-2 sm:p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Day Duration</td>
                            <td className="p-2 sm:p-4 text-gray-700">{calculations.day_duration.hours}h {calculations.day_duration.minutes}m</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Yoga and Karana Information */}
        {panchangData && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Yoga */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
                <h3 className="text-lg font-semibold text-violet-800 mb-4 flex items-center">
                  <span className="mr-2">⚡</span>
                  Current Yoga
                </h3>
                <div className="space-y-3">
                  {Object.values(panchangData.yoga).slice(0, 2).map((yoga: { number: number; name: string; completion: string | null; yoga_left_percentage?: number | null }, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-violet-800">{yoga.name}</div>
                      {yoga.completion && (
                        <div className="text-sm text-gray-600">
                          Completes: {new Date(yoga.completion).toLocaleTimeString()}
                        </div>
                      )}
                      {yoga.yoga_left_percentage && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-violet-600 h-2 rounded-full" 
                            style={{ width: `${yoga.yoga_left_percentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Karana */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center">
                  <span className="mr-2">🕐</span>
                  Current Karana
                </h3>
                <div className="space-y-3">
                  {Object.values(panchangData.karana).slice(0, 2).map((karana: { number: number; name: string; completion: string | null; karana_left_percentage?: number | null }, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-3">
                      <div className="font-medium text-cyan-800">{karana.name}</div>
                      {karana.completion && (
                        <div className="text-sm text-gray-600">
                          Completes: {new Date(karana.completion).toLocaleTimeString()}
                        </div>
                      )}
                      {karana.karana_left_percentage && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-cyan-600 h-2 rounded-full" 
                            style={{ width: `${karana.karana_left_percentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* How Does Panchang Help Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>How Does Panchang Help In Planning Your Day?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                Panchang serves as your daily spiritual guide, helping you align your activities with cosmic energies for maximum success and harmony. By understanding the celestial influences of each day, you can make informed decisions about when to start important ventures, conduct ceremonies, or avoid certain activities.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">✨ Auspicious Activities</h3>
                  <p className="text-gray-700">Choose favorable times for new beginnings, business launches, weddings, and important decisions.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">⚠️ Times to Avoid</h3>
                  <p className="text-gray-700">Identify inauspicious periods like Rahu Kaal to avoid starting important work.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">🏠 Daily Routines</h3>
                  <p className="text-gray-700">Plan your daily activities including prayers, meditation, and personal tasks.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">💰 Financial Decisions</h3>
                  <p className="text-gray-700">Make investments and financial commitments during favorable planetary positions.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How To Understand Panchang Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Understanding Panchang Elements</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                Panchang consists of five essential elements that form the foundation of Vedic timekeeping. Understanding these elements helps you make informed decisions about timing your activities.
              </p>
              
              {/* The Five Elements */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">1. Tithi (Lunar Day)</h3>
                  <p className="text-gray-700 text-sm">The lunar day based on the moon&apos;s position relative to the sun, crucial for determining auspicious timing.</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">2. Vara (Weekday)</h3>
                  <p className="text-gray-700 text-sm">The day of the week, each ruled by a specific planet influencing the day&apos;s energy and activities.</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">3. Nakshatra (Star)</h3>
                  <p className="text-gray-700 text-sm">The lunar mansion where the moon is positioned, affecting personality traits and favorable activities.</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">4. Yoga (Union)</h3>
                  <p className="text-gray-700 text-sm">The angular relationship between the sun and moon, indicating the quality of time for different activities.</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">5. Karana (Half-Day)</h3>
                  <p className="text-gray-700 text-sm">Half of a Tithi, providing more precise timing for activities and spiritual practices.</p>
                </div>
              </div>

              {/* Key Nakshatras Overview */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 text-gray-900">
                <h3 className="text-2xl font-semibold text-[#23244a] mb-4 text-center">Key Nakshatras & Their Influences</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2 text-gray-900">
                    <div><strong>Ashwini (Aries):</strong> New beginnings, healing, swift action</div>
                    <div><strong>Rohini (Taurus):</strong> Growth, beauty, material prosperity</div>
                    <div><strong>Punarvasu (Gemini/Cancer):</strong> Renewal, return, spiritual growth</div>
                    <div><strong>Pushya (Cancer):</strong> Nourishment, protection, spiritual practices</div>
                    <div><strong>Magha (Leo):</strong> Authority, tradition, ancestral honors</div>
                    <div><strong>Hasta (Virgo):</strong> Skillful work, craftsmanship, healing</div>
                    <div><strong>Swati (Libra):</strong> Independence, trade, movement</div>
                    <div><strong>Anuradha (Scorpio):</strong> Friendship, cooperation, success</div>
                  </div>
                  <div className="space-y-2 text-gray-900">
                    <div><strong>Jyestha (Scorpio):</strong> Protection, seniority, responsibility</div>
                    <div><strong>Mula (Sagittarius):</strong> Research, investigation, roots</div>
                    <div><strong>Uttara Ashadha (Sagittarius/Capricorn):</strong> Victory, leadership</div>
                    <div><strong>Shravana (Capricorn):</strong> Learning, listening, fame</div>
                    <div><strong>Dhanishta (Capricorn/Aquarius):</strong> Wealth, music, prosperity</div>
                    <div><strong>Shatbhisha (Aquarius):</strong> Healing, mystical knowledge</div>
                    <div><strong>Uttara Bhadrapada (Pisces):</strong> Wisdom, spiritual insight</div>
                    <div><strong>Revati (Pisces):</strong> Completion, wealth, safe travel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Frequently Asked Questions</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className={`border-l-4 ${faq.borderColor} bg-white rounded-r-lg shadow-sm transition-all duration-300 hover:shadow-md`}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none rounded-r-lg"
                  >
                    <h3 className="text-lg font-semibold text-[#23244a] pr-4">
                      Q: {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFAQ === index ? "auto" : 0,
                      opacity: openFAQ === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Astrologer profile - appended to end of calculator content */}
        <div className="mt-12">
          <AstrologerProfile />
        </div>
      </div>
    </div>
  );
};

export default TodayPanchangPage;
