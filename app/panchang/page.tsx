"use client";

import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Calendar, Clock, Star, Sun, Moon, Zap, Shield, BookOpen, Compass, Sunrise, Sunset, Clock3, CalendarDays, TrendingUp, Target, Lightbulb, Heart, Users, Globe, BookMarked, Award, MapPin, RefreshCw } from 'lucide-react';
import { DrNarendraProfile } from "../components/DrNarendraProfile";
import { ContactForm } from "../components/ContactForm";
import { usePanchang, useCurrentLocation } from "../../hooks/usePanchang";

const tabs = ['Overview', 'Benefits', 'FAQs'];

const benefits = [
  {
    icon: <Calendar className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Daily Auspicious Timings',
    desc: 'Get precise Muhurta (auspicious timings) for important activities like marriage, business deals, travel, and spiritual practices.'
  },
  {
    icon: <Clock className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Planetary Positions',
    desc: 'Understand current planetary placements and their influence on your daily life, helping you make informed decisions.'
  },
  {
    icon: <Star className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Nakshatra Guidance',
    desc: 'Learn which Nakshatra is active and how it affects your mood, energy, and spiritual practices for the day.'
  },
  {
    icon: <Sun className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Sun & Moon Transits',
    desc: 'Track the movement of Sun and Moon through zodiac signs to understand seasonal influences and lunar phases.'
  },
  {
    icon: <Moon className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Tithi & Karana',
    desc: 'Know the current lunar day (Tithi) and half-lunar day (Karana) for optimal timing of religious ceremonies.'
  },
  {
    icon: <Zap className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Yoga Combinations',
    desc: 'Understand the current Yoga (combination of Sun and Moon) and its impact on your spiritual practices.'
  },
  {
    icon: <Shield className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Avoid Inauspicious Times',
    desc: 'Identify Rahu Kaal, Yamaganda, and Gulika Kaal to avoid starting important activities during these periods.'
  },
  {
    icon: <BookOpen className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Vedic Wisdom',
    desc: 'Access ancient Vedic knowledge about cosmic rhythms and their practical application in modern life.'
  },
  {
    icon: <Compass className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Directional Guidance',
    desc: 'Learn auspicious directions for travel, work, and daily activities based on planetary positions.'
  },
  {
    icon: <Sunrise className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Brahma Muhurta',
    desc: 'Discover the most auspicious time before sunrise for meditation, yoga, and spiritual practices.'
  },
  {
    icon: <Sunset className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Sandhya Timing',
    desc: 'Know the perfect timing for evening prayers and spiritual practices during sunset hours.'
  },
  {
    icon: <Clock3 className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Abhijit Muhurta',
    desc: 'Identify the most favorable time during the day for starting new ventures and important activities.'
  },
  {
    icon: <CalendarDays className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Festival Dates',
    desc: 'Get accurate dates for Hindu festivals and religious celebrations based on lunar calendar.'
  },
  {
    icon: <TrendingUp className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Success Planning',
    desc: 'Plan your activities during the most favorable planetary combinations for maximum success.'
  },
  {
    icon: <Target className="text-indigo-400 w-8 h-8 mb-2" />,
    title: 'Goal Achievement',
    desc: 'Align your actions with cosmic energies to manifest your desires and achieve your life goals.'
  }
];

const faqs = [
  {
    q: 'What is Panchang and why is it important?',
    a: 'Panchang is a Vedic almanac that provides daily astrological information including Tithi, Nakshatra, Yoga, Karana, and Vaar. It helps you choose auspicious timings for important activities and understand daily cosmic influences.'
  },
  {
    q: 'How often should I check the Panchang?',
    a: 'It\'s ideal to check the Panchang daily, especially before starting important activities. For major events like marriage or business deals, check it weeks in advance to plan the most auspicious timing.'
  },
  {
    q: 'What are the most important timings to consider?',
    a: 'Brahma Muhurta (before sunrise), Abhijit Muhurta (midday), and avoiding Rahu Kaal, Yamaganda, and Gulika Kaal are the most important timings to consider for daily activities.'
  },
  {
    q: 'Can Panchang help with decision making?',
    a: 'Yes, Panchang provides cosmic guidance for decision making. By understanding planetary positions and auspicious timings, you can make choices that align with favorable cosmic energies.'
  },
  {
    q: 'How accurate is the Panchang information?',
    a: 'Panchang information is based on precise astronomical calculations and has been used for thousands of years. The accuracy depends on the source and calculations used, but traditional Panchangs are highly reliable.'
  }
];

export default function PanchangPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customLocation, setCustomLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  
  const { location: currentLocation, error: locationError } = useCurrentLocation();
  const { data: panchangData, calculations, loading, error, refetch } = usePanchang({
    date: selectedDate,
    latitude: customLocation?.latitude || (isLocationEnabled ? currentLocation?.latitude : 17.38333) || 17.38333,
    longitude: customLocation?.longitude || (isLocationEnabled ? currentLocation?.longitude : 78.4666) || 78.4666,
    includeCalculations: true
  });

  const [dataSource, setDataSource] = useState<'database' | 'api' | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLocationToggle = () => {
    setIsLocationEnabled(!isLocationEnabled);
    if (!isLocationEnabled && currentLocation) {
      setCustomLocation(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-indigo-50 to-white font-sans">
      <div className="container mx-auto pt-8 px-4 pb-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="w-full rounded-3xl py-12 px-4 md:px-16 mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
          <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-4 text-center drop-shadow-lg font-serif" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Panchang - Daily Vedic Almanac
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-2xl font-sans mb-8" style={{ fontFamily: 'Open Sans, Arial, sans-serif', color: '#166534' }}>
            Discover the cosmic wisdom of daily timings, planetary positions, and auspicious moments to align your life with divine rhythms.
          </p>
          
          {/* Date and Location Selector */}
          <div className="w-full max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center mb-6">
              {/* Date Selector */}
              <div className="flex items-center gap-2 bg-white/80 rounded-lg p-3 shadow-sm">
                <Calendar className="text-indigo-600 w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
                />
              </div>

              {/* Location Selector */}
              <div className="flex items-center gap-2 bg-white/80 rounded-lg p-3 shadow-sm">
                <MapPin className="text-indigo-600 w-5 h-5" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLocationToggle}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLocationEnabled 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {isLocationEnabled ? '📍 Auto Location' : '📍 Manual Location'}
                  </button>
                  
                  {!isLocationEnabled && (
                    <>
                      <input
                        type="number"
                        placeholder="Latitude"
                        value={customLocation?.latitude || ''}
                        onChange={(e) => setCustomLocation(prev => ({ 
                          latitude: parseFloat(e.target.value) || 17.38333, 
                          longitude: prev?.longitude || 78.4666 
                        }))}
                        className="px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24"
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
                        className="px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24"
                        step="0.000001"
                      />
                    </>
                  )}
                  
                  {isLocationEnabled && currentLocation && (
                    <span className="text-sm text-green-600 font-medium">
                      {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </span>
                  )}
                  
                  {isLocationEnabled && locationError && (
                    <span className="text-sm text-red-600">
                      Location unavailable
                    </span>
                  )}
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={refetch}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {/* Current Location Info */}
            {isLocationEnabled && currentLocation && (
              <div className="text-center text-sm text-gray-600 mb-4">
                Using your current location: {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              </div>
            )}
          </div>
        </motion.div>

        {/* Real-time Panchang Display */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg p-8 mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-indigo-600 font-medium">Loading Panchang data...</p>
          </motion.div>
        )}

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

        {panchangData && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="w-full rounded-2xl bg-white/70 backdrop-blur-md shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-indigo-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <p className="text-lg text-gray-600">
                {panchangData.weekday.weekday_name} • {panchangData.lunar_month.lunar_month_full_name}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Sun Times */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <Sun className="text-yellow-600 w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-800">Sun Times</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunrise:</span>
                    <span className="font-medium">{panchangData.sun_rise}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunset:</span>
                    <span className="font-medium">{panchangData.sun_set}</span>
                  </div>
                </div>
              </div>

              {/* Tithi */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Moon className="text-blue-600 w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-800">Tithi</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-800">{panchangData.tithi.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{panchangData.tithi.paksha} Paksha</div>
                  </div>
                  {panchangData.tithi.left_precentage && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${panchangData.tithi.left_precentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nakshatra */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <Star className="text-purple-600 w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold text-purple-800">Nakshatra</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-800">{panchangData.nakshatra.name}</div>
                  </div>
                  {panchangData.nakshatra.left_percentage && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${panchangData.nakshatra.left_percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lunar Month */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <Calendar className="text-green-600 w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">Lunar Month</h3>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-800">{panchangData.lunar_month.lunar_month_full_name}</div>
                  <div className="text-sm text-gray-600">Ritu: {panchangData.ritu.name}</div>
                </div>
              </div>

              {/* Aayanam */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                <div className="flex items-center mb-4">
                  <Compass className="text-teal-600 w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold text-teal-800">Aayanam</h3>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-teal-800">{panchangData.aayanam}</div>
                </div>
              </div>

              {/* Year Info */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center mb-4">
                  <Award className="text-amber-600 w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800">Year</h3>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-amber-800">{panchangData.year.vikram_chaitradi_year_name}</div>
                  <div className="text-xs text-gray-600">Vikram Samvat</div>
                </div>
              </div>
            </div>

            {/* Yoga and Karana Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Current Yoga */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-200">
                <h3 className="text-lg font-semibold text-violet-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Current Yoga
                </h3>
                <div className="space-y-3">
                  {Object.values(panchangData.yoga).slice(0, 2).map((yoga: any, index: number) => (
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
                  <Clock className="w-5 h-5 mr-2" />
                  Current Karana
                </h3>
                <div className="space-y-3">
                  {Object.values(panchangData.karana).slice(0, 2).map((karana: any, index: number) => (
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

            {/* Auspicious and Inauspicious Times */}
            {calculations && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Auspicious Times */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Auspicious Times
                  </h3>
                  <div className="space-y-3">
                    {calculations.auspicious_times.map((time, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                        <div>
                          <div className="font-medium text-green-800">{time.name}</div>
                          <div className="text-sm text-gray-600">{time.description || ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{time.start} - {time.end}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inauspicious Times */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Avoid These Times
                  </h3>
                  <div className="space-y-3">
                    {calculations.inauspicious_times.map((time, index) => (
                      <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                        <div>
                          <div className="font-medium text-red-800">{time.name}</div>
                          <div className="text-sm text-gray-600">{time.description || ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{time.start} - {time.end}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors font-sans ${activeTab === tab ? 'border-indigo-500 text-indigo-600 font-bold' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              style={{ fontFamily: 'Open Sans, Arial, sans-serif' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-12 text-lg leading-relaxed text-gray-700 space-y-6 font-sans" style={{ fontFamily: 'Open Sans, Arial, sans-serif', textAlign: 'justify' }}>
            <p>Panchang, the ancient Vedic almanac, is a comprehensive guide to daily cosmic rhythms and auspicious timings. Derived from the Sanskrit words &quot;Pancha&quot; (five) and &quot;Anga&quot; (limb), it represents the five essential elements that govern our daily lives: <span className="font-bold text-green-800">Tithi</span> (lunar day), <span className="font-bold text-green-800">Nakshatra</span> (lunar mansion), <span className="font-bold text-green-800">Yoga</span> (solar-lunar combination), <span className="font-bold text-green-800">Karana</span> (half-lunar day), and <span className="font-bold text-green-800">Vaar</span> (weekday). This sacred knowledge has been preserved and passed down through generations of Vedic scholars.</p>
            <p>At the heart of Panchang lies the understanding that cosmic energies influence every aspect of human existence. The <span className="font-bold text-green-800">Moon&apos;s position</span> relative to the Sun creates different Tithis, each carrying unique spiritual and practical significance. For instance, the full moon (Purnima) is ideal for spiritual practices and meditation, while the new moon (Amavasya) is perfect for introspection and letting go of negative patterns. Understanding these lunar phases helps us align our activities with natural cosmic rhythms.</p>
            <p>The <span className="font-bold text-green-800">Nakshatra system</span> divides the zodiac into 27 lunar mansions, each ruled by specific deities and possessing distinct qualities. When you know which Nakshatra is active, you can choose activities that resonate with its energy. For example, Rohini Nakshatra is excellent for creative pursuits and romance, while Mrigashira Nakshatra favors exploration and learning. This knowledge empowers you to make the most of each day&apos;s unique cosmic signature.</p>
            <p>Timing is everything in Vedic wisdom, and Panchang provides precise <span className="font-bold text-green-800">Muhurta</span> (auspicious timings) for important activities. The most sacred time is <span className="font-bold text-green-800">Brahma Muhurta</span>, the 96-minute period before sunrise, when cosmic energies are most pure and conducive to spiritual practices. Similarly, <span className="font-bold text-green-800">Abhijit Muhurta</span>, occurring around midday, is considered the most favorable time for starting new ventures and important decisions.</p>
            <p>Equally important is knowing when to avoid certain activities. <span className="font-bold text-green-800">Rahu Kaal</span>, <span className="font-bold text-green-800">Yamaganda</span>, and <span className="font-bold text-green-800">Gulika Kaal</span> are inauspicious periods when cosmic energies are challenging. During these times, it&apos;s best to avoid starting new projects, making important decisions, or undertaking journeys. Panchang helps you identify these periods so you can plan your day accordingly.</p>
            <p>The <span className="font-bold text-green-800">planetary positions</span> and their transits through different zodiac signs create unique daily energies. When you understand these movements, you can align your activities with favorable planetary influences. For instance, when Jupiter is strong, it&apos;s an excellent time for learning and spiritual growth. When Venus is prominent, relationships and creative pursuits flourish. Panchang gives you this daily cosmic roadmap.</p>
            <p>Beyond daily guidance, Panchang serves as a bridge between ancient Vedic wisdom and modern life. It teaches us that we are not separate from the cosmos but integral parts of its grand design. By following Panchang, we learn to live in harmony with natural rhythms, respect cosmic timing, and make choices that align with divine wisdom. This alignment brings peace, prosperity, and spiritual growth into our lives.</p>
          </motion.div>
        )}
        
        {activeTab === 'Benefits' && (
            <section className="mb-12">
            <h2 className="text-3xl font-bold text-indigo-900 mb-8 border-b pb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Benefits of Daily Panchang</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 + idx * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-white/70 backdrop-blur-md shadow-lg p-8 flex flex-col items-center border border-indigo-100 hover:scale-105 transition-transform duration-200"
                  style={{ fontFamily: 'Open Sans, Arial, sans-serif' }}
                >
                  {benefit.icon}
                  <h3 className="font-bold text-lg mb-2 text-indigo-900 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>{benefit.title}</h3>
                  <p className="text-gray-700 text-center text-base">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'FAQs' && (
           <section className="mb-12">
            <h2 className="text-3xl font-bold text-indigo-900 mb-8 border-b pb-2 text-left" style={{ fontFamily: 'Playfair Display, serif' }}>Frequently Asked Questions</h2>
            <div className="space-y-8">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <div className="flex items-center mb-2">
                    <span className="text-indigo-600 mr-2 text-xl">&#x3f;</span>
                    <span className="font-bold text-lg text-indigo-900" style={{ fontFamily: 'Playfair Display, serif' }}>{faq.q}</span>
                  </div>
                  <p className="text-black text-justify pl-8" style={{ fontFamily: 'Open Sans, Arial, sans-serif' }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        
        <div className="mt-20 space-y-20">
          <DrNarendraProfile />
        </div>

        <div className="mt-20">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
