'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AstrologerProfile } from '@/app/components/AstrologerProfile';
import { ChevronDown, ChevronUp, Heart, Star, Users, Check, X } from 'lucide-react';

type BirthDetailsForm = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string; 
  timeOfBirth: string; 
  placeOfBirth: string;
  latitude: string; 
  longitude: string; 
  timezone: string; 
};

type AshtakootApiResponse = {
  success: boolean;
  cached: boolean;
  data: unknown;
};

// Types for parsed Ashtakoot response (keep optional to be resilient)
type KootScore = { out_of?: number; score?: number };
type VarnaKootam = KootScore & {
  bride?: { moon_sign_number?: number; moon_sign?: string; varnam?: number; varnam_name?: string };
  groom?: { moon_sign_number?: number; moon_sign?: string; varnam?: number; varnam_name?: string };
};
type VasyaKootam = KootScore & {
  bride?: { bride_kootam?: number; bride_kootam_name?: string };
  groom?: { groom_kootam?: number; groom_kootam_name?: string };
};
type TaraKootam = KootScore & {
  bride?: { star_number?: number; star_name?: string };
  groom?: { star_number?: number; star_name?: string };
};
type YoniKootam = KootScore & {
  bride?: { star?: number; yoni_number?: number; yoni?: string };
  groom?: { star?: number; yoni_number?: number; yoni?: string };
};
type GrahaMaitriKootam = KootScore & {
  bride?: { moon_sign_number?: number; moon_sign?: string; moon_sign_lord?: number; moon_sign_lord_name?: string };
  groom?: { moon_sign_number?: number; moon_sign?: string; moon_sign_lord?: number; moon_sign_lord_name?: string };
};
type GanaKootam = KootScore & {
  bride?: { bride_nadi?: number; bride_nadi_name?: string };
  groom?: { groom_nadi?: number; groom_nadi_name?: string };
};
type RasiKootam = KootScore & {
  bride?: { moon_sign?: number; moon_sign_name?: string };
  groom?: { moon_sign?: number; moon_sign_name?: string };
};
type NadiKootam = KootScore & {
  bride?: { nadi?: number; nadi_name?: string };
  groom?: { nadi?: number; nadi_name?: string };
};

type AshtakootOutput = {
  out_of?: number;
  total_score?: number;
  varna_kootam?: VarnaKootam;
  vasya_kootam?: VasyaKootam;
  tara_kootam?: TaraKootam;
  yoni_kootam?: YoniKootam;
  graha_maitri_kootam?: GrahaMaitriKootam;
  gana_kootam?: GanaKootam;
  rasi_kootam?: RasiKootam;
  nadi_kootam?: NadiKootam;
};

type GeoapifySuggestion = { label: string; lat: number; lon: number };
type GeoapifyAutocompleteResponse = { results?: GeoapifySuggestion[] };

const KundliMatchingPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<AshtakootApiResponse | null>(null);
  const [formData, setFormData] = useState({
    boy: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      latitude: '',
      longitude: '',
      timezone: '5.5',
    } as BirthDetailsForm,
    girl: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: '',
      latitude: '',
      longitude: '',
      timezone: '5.5',
    } as BirthDetailsForm,
  });

  // Autocomplete state
  const [boyPlaceQuery, setBoyPlaceQuery] = useState('');
  const [girlPlaceQuery, setGirlPlaceQuery] = useState('');
  const [boySuggestions, setBoySuggestions] = useState<GeoapifySuggestion[]>([]);
  const [girlSuggestions, setGirlSuggestions] = useState<GeoapifySuggestion[]>([]);
  const [showBoySuggestions, setShowBoySuggestions] = useState(false);
  const [showGirlSuggestions, setShowGirlSuggestions] = useState(false);
  const boyPlaceRef = useRef<HTMLDivElement | null>(null);
  const girlPlaceRef = useRef<HTMLDivElement | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isBoyField = name.startsWith('boy');
    const target = isBoyField ? 'boy' : 'girl';
    const key = name
      .replace(/^boy|^girl/, '')
      .replace(/^./, (c) => c.toLowerCase());

    setFormData((prev) => ({
      ...prev,
      [target]: {
        ...prev[target as 'boy' | 'girl'],
        [key]: value,
      },
    }));

    if (key === 'placeOfBirth') {
      if (isBoyField) {
        setBoyPlaceQuery(value);
        setShowBoySuggestions(true);
      } else {
        setGirlPlaceQuery(value);
        setShowGirlSuggestions(true);
      }
    }
  };

  // Debounce helper
  function useDebouncedValue<T>(val: T, delayMs: number): T {
    const [debounced, setDebounced] = useState<T>(val);
    useEffect(() => {
      const t = setTimeout(() => setDebounced(val), delayMs);
      return () => clearTimeout(t);
    }, [val, delayMs]);
    return debounced;
  }

  const boyQueryDebounced = useDebouncedValue(boyPlaceQuery, 300);
  const girlQueryDebounced = useDebouncedValue(girlPlaceQuery, 300);

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchBoy = async () => {
      if (!boyQueryDebounced || boyQueryDebounced.length < 2) {
        setBoySuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/geoapify/autocomplete?text=${encodeURIComponent(boyQueryDebounced)}&limit=5`);
        const data: GeoapifyAutocompleteResponse = await res.json();
        setBoySuggestions(Array.isArray(data.results) ? data.results : []);
      } catch {
        setBoySuggestions([]);
      }
    };
    fetchBoy();
  }, [boyQueryDebounced]);

  useEffect(() => {
    const fetchGirl = async () => {
      if (!girlQueryDebounced || girlQueryDebounced.length < 2) {
        setGirlSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/geoapify/autocomplete?text=${encodeURIComponent(girlQueryDebounced)}&limit=5`);
        const data: GeoapifyAutocompleteResponse = await res.json();
        setGirlSuggestions(Array.isArray(data.results) ? data.results : []);
      } catch {
        setGirlSuggestions([]);
      }
    };
    fetchGirl();
  }, [girlQueryDebounced]);

  // Close suggestion lists on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (boyPlaceRef.current && !boyPlaceRef.current.contains(target)) {
        setShowBoySuggestions(false);
      }
      if (girlPlaceRef.current && !girlPlaceRef.current.contains(target)) {
        setShowGirlSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selectPlace = async (
    who: 'boy' | 'girl',
    suggestion: GeoapifySuggestion,
  ) => {
    const label = suggestion.label;
    const lat = suggestion.lat;
    const lon = suggestion.lon;

    setFormData((prev) => ({
      ...prev,
      [who]: {
        ...prev[who],
        placeOfBirth: label,
        latitude: String(lat),
        longitude: String(lon),
      },
    }));

    if (who === 'boy') {
      setBoyPlaceQuery(label);
      setShowBoySuggestions(false);
    } else {
      setGirlPlaceQuery(label);
      setShowGirlSuggestions(false);
    }

    // Fetch timezone by lat/lon
    try {
      const tzRes = await fetch(`/api/geoapify/timezone?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`);
      const tzData = await tzRes.json() as { offset_hours?: number | null };
      let tz = '5.5';
      if (typeof tzData.offset_hours === 'number') {
        tz = String(Number(tzData.offset_hours.toFixed(2)));
      }
      setFormData((prev) => ({
        ...prev,
        [who]: {
          ...prev[who],
          timezone: tz,
        },
      }));
    } catch {
      // ignore timezone failure
    }
  };

  const parseBirth = (dateStr: string, timeStr: string, latStr: string, lonStr: string, tzStr: string) => {
    const date = new Date(dateStr);
    const [hoursStr, minutesStr] = timeStr.split(':');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const hours = Number(hoursStr || '0');
    const minutes = Number(minutesStr || '0');
    const seconds = 0;
    const latitude = Number(latStr || '0');
    const longitude = Number(lonStr || '0');
    const timezone = Number(tzStr || '5.5');
    return { year, month, date: day, hours, minutes, seconds, latitude, longitude, timezone };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiResult(null);
    setIsSubmitting(true);

    try {
      const female = parseBirth(
        formData.girl.dateOfBirth,
        formData.girl.timeOfBirth,
        formData.girl.latitude,
        formData.girl.longitude,
        formData.girl.timezone
      );

      const male = parseBirth(
        formData.boy.dateOfBirth,
        formData.boy.timeOfBirth,
        formData.boy.latitude,
        formData.boy.longitude,
        formData.boy.timezone
      );

      const res = await fetch('/api/match-making/ashtakoot-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          female,
          male,
          observation_point: 'topocentric',
          language: 'en',
          ayanamsha: 'lahiri',
        }),
      });

      const data: AshtakootApiResponse = await res.json();
      if (!res.ok || !data.success) {
        setApiError(typeof data === 'object' && data !== null ? JSON.stringify(data) : 'Failed to fetch score');
      } else {
        setApiResult(data);
      }
    } catch (err) {
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers to render human-friendly summary
  const parseAshtakoot = (data: unknown): AshtakootOutput | null => {
    if (!data || typeof data !== 'object') return null;
    const root = data as { statusCode?: number; output?: AshtakootOutput };
    return root.output ?? null;
  };

  const compatibilityBand = (score: number): { label: string; color: string; message: string } => {
    if (score >= 30) return { label: 'Excellent Match', color: 'text-green-700', message: 'Very strong compatibility across most aspects.' };
    if (score >= 24) return { label: 'Good Match', color: 'text-green-600', message: 'Overall compatibility is good with a few areas to work on.' };
    if (score >= 18) return { label: 'Average Match', color: 'text-amber-600', message: 'Acceptable match; improvements and mutual effort advised.' };
    return { label: 'Low Match', color: 'text-red-600', message: 'Compatibility is limited; consider guidance and remedies.' };
  };

  type KootKey = keyof Pick<AshtakootOutput, 'varna_kootam'|'vasya_kootam'|'tara_kootam'|'yoni_kootam'|'graha_maitri_kootam'|'gana_kootam'|'rasi_kootam'|'nadi_kootam'>;
  const kootTitles: Record<KootKey, string> = {
    varna_kootam: 'Varna (Spiritual/Values)',
    vasya_kootam: 'Vashya (Attraction/Influence)',
    tara_kootam: 'Tara (Health/Longevity)',
    yoni_kootam: 'Yoni (Intimacy/Nature)',
    graha_maitri_kootam: 'Graha Maitri (Mental Harmony)',
    gana_kootam: 'Gana (Temperament)',
    rasi_kootam: 'Rashi (Moon Sign Placement)',
    nadi_kootam: 'Nadi (Health/Progeny)',
  };

  const kootHelp: Record<KootKey, string> = {
    varna_kootam: 'How similar your core values and life approach are.',
    vasya_kootam: 'Balance of attraction and mutual influence.',
    tara_kootam: 'Support for wellbeing and long-term stability.',
    yoni_kootam: 'Intimate compatibility and basic nature alignment.',
    graha_maitri_kootam: 'Friendliness between Moon sign lords (mental rapport).',
    gana_kootam: 'Match of temperaments and day-to-day behavior.',
    rasi_kootam: 'Moon sign distance factors that affect harmony.',
    nadi_kootam: 'Physiological harmony and potential for progeny.',
  };

  const faqData = [
    {
      question: "What is Kundli Matching?",
      answer: "Kundli Matching, also known as Gun Milan or Horoscope Matching, is an ancient Vedic practice to assess marriage compatibility between two individuals based on their birth charts and astrological factors.",
      borderColor: "border-orange-400"
    },
    {
      question: "How does Gun Milan work?",
      answer: "Gun Milan analyzes 36 Gunas (qualities) from both partners' birth charts. The compatibility is measured on a scale of 36 points, where higher scores indicate better compatibility for marriage.",
      borderColor: "border-purple-400"
    },
    {
      question: "What is the minimum score for marriage?",
      answer: "Generally, a score of 18 or above out of 36 is considered acceptable for marriage. However, scores above 24 are considered very good, and above 32 are excellent for matrimonial harmony.",
      borderColor: "border-blue-400"
    },
    {
      question: "Can Kundli Matching predict divorce?",
      answer: "While Kundli Matching can indicate potential areas of conflict and compatibility issues, it cannot definitively predict divorce. It's a tool for guidance and understanding, not absolute prediction.",
      borderColor: "border-green-400"
    },
    {
      question: "What if there are Doshas in the Kundli?",
      answer: "Doshas like Mangal Dosha can be addressed through specific remedies, rituals, or by matching with someone who has similar Doshas. Consultation with an experienced astrologer is recommended.",
      borderColor: "border-red-400"
    },
    {
      question: "Is Kundli Matching scientifically accurate?",
      answer: "Kundli Matching is based on ancient Vedic wisdom and astronomical calculations. While not scientifically proven, millions of people find value in this traditional practice for marital compatibility assessment.",
      borderColor: "border-indigo-400"
    }
  ];

  const matchingFeatures = [
    {
      icon: <Heart className="w-8 h-8 text-emerald-600" />,
      title: "Emotional Compatibility",
      description: "Analyze emotional bonding and understanding between partners."
    },
    {
      icon: <Star className="w-8 h-8 text-emerald-600" />,
      title: "Astrological Harmony",
      description: "Check planetary positions and their influence on married life."
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Family Compatibility",
      description: "Assess how well both families will get along and support the union."
    },
    {
      icon: <Check className="w-8 h-8 text-emerald-600" />,
      title: "Life Goals Alignment",
      description: "Determine if both partners share similar life objectives and values."
    }
  ];

  const gunaDetails = [
    { name: "Varna", points: 1, description: "Spiritual compatibility and ego" },
    { name: "Vashya", points: 2, description: "Mutual attraction and control" },
    { name: "Tara", points: 3, description: "Health and well-being" },
    { name: "Yoni", points: 4, description: "Sexual compatibility and intimacy" },
    { name: "Graha Maitri", points: 5, description: "Mental compatibility and friendship" },
    { name: "Gana", points: 6, description: "Temperament and behavior" },
    { name: "Bhakoot", points: 7, description: "Love and emotional compatibility" },
    { name: "Nadi", points: 8, description: "Health and progeny" }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20 font-sans">
      <div className="max-w-6xl mx-auto pt-6 px-4 sm:px-6 md:px-8 lg:px-12 pb-12 relative z-10">
        
        {/* Banner Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full rounded-3xl py-8 sm:py-12 px-4 sm:px-8 md:px-16 mb-8 sm:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]"
          style={{ backgroundColor: "#FEFBF2" }}
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-3 sm:mb-4 text-center drop-shadow-lg font-serif"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Kundli Matching
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl text-center max-w-3xl font-sans"
            style={{
              fontFamily: "Open Sans, Arial, sans-serif",
              color: "#166534",
            }}
          >
            Find your perfect life partner through ancient Vedic wisdom and comprehensive compatibility analysis
          </p>
        </motion.div>

        {/* Introduction Section */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Is Kundli Matching?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Kundli Matching, also known as Gun Milan or Horoscope Matching, is an ancient Vedic practice used to assess marriage compatibility between two individuals. This time-tested method analyzes the birth charts of prospective partners to determine their compatibility across various life aspects.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The process evaluates 36 Gunas (qualities) and provides a compatibility score that helps families make informed decisions about marriage alliances. It considers factors like emotional compatibility, physical attraction, mental harmony, and spiritual alignment.
              </p>
              <div className="text-center">
                <button className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Start Your Kundli Matching →
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Kundli Matching Form */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Match Your Kundlis</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Boy's Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-200">
              <h3 className="text-2xl font-bold text-[#23244a] mb-6 text-center">Boy&apos;s Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Full Name *</label>
                      <input
                        type="text"
                    name="boyName"
                    value={formData.boy.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Enter boy's full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Email</label>
                      <input
                        type="email"
                    name="boyEmail"
                    value={formData.boy.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="boy@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Phone</label>
                      <input
                        type="tel"
                    name="boyPhone"
                    value={formData.boy.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Date of Birth *</label>
                      <input
                        type="date"
                    name="boyDateOfBirth"
                    value={formData.boy.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Time of Birth</label>
                      <input
                        type="time"
                    name="boyTimeOfBirth"
                    value={formData.boy.timeOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Place of Birth *</label>
                    <div className="relative" ref={boyPlaceRef}>
                      <input
                        type="text"
                        name="boyPlaceOfBirth"
                        value={formData.boy.placeOfBirth}
                        onChange={handleInputChange}
                        onFocus={() => setShowBoySuggestions(true)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="City, State, Country"
                        required
                      />
                      {showBoySuggestions && boySuggestions.length > 0 && (
                        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-auto">
                          {boySuggestions.map((f, idx) => (
                            <li
                              key={idx}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                              onClick={() => selectPlace('boy', f)}
                            >
                              {f.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="boyLatitude"
                      value={formData.boy.latitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="e.g. 28.6139"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="boyLongitude"
                      value={formData.boy.longitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="e.g. 77.2090"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Timezone</label>
                    <input
                      type="number"
                      step="any"
                      name="boyTimezone"
                      value={formData.boy.timezone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="e.g. 5.5"
                    />
                  </div>
                </div>
                  </div>
                </div>

                {/* Girl's Details */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-6 rounded-lg border border-pink-200">
                  <h3 className="text-2xl font-bold text-[#23244a] mb-6 text-center">Girl&apos;s Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="girlName"
                        value={formData.girl.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Enter girl's full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Email</label>
                      <input
                        type="email"
                        name="girlEmail"
                        value={formData.girl.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="girl@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Phone</label>
                      <input
                        type="tel"
                        name="girlPhone"
                        value={formData.girl.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="girlDateOfBirth"
                        value={formData.girl.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Time of Birth</label>
                      <input
                        type="time"
                        name="girlTimeOfBirth"
                        value={formData.girl.timeOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Place of Birth *</label>
                        <div className="relative" ref={girlPlaceRef}>
                          <input
                            type="text"
                            name="girlPlaceOfBirth"
                            value={formData.girl.placeOfBirth}
                            onChange={handleInputChange}
                            onFocus={() => setShowGirlSuggestions(true)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            placeholder="City, State, Country"
                            required
                          />
                          {showGirlSuggestions && girlSuggestions.length > 0 && (
                            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-auto">
                              {girlSuggestions.map((f, idx) => (
                                <li
                                  key={idx}
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                                  onClick={() => selectPlace('girl', f)}
                                >
                                  {f.label}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#23244a] mb-2">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          name="girlLatitude"
                          value={formData.girl.latitude}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="e.g. 19.0760"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#23244a] mb-2">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          name="girlLongitude"
                          value={formData.girl.longitude}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="e.g. 72.8777"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#23244a] mb-2">Timezone</label>
                        <input
                          type="number"
                          step="any"
                          name="girlTimezone"
                          value={formData.girl.timezone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="e.g. 5.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white py-3 px-6 sm:py-4 sm:px-12 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg disabled:opacity-60"
                >
                  {isSubmitting ? 'Calculating…' : 'Match Kundlis Now →'}
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* Results Section */}
        {(apiError || apiResult) && (
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-green-200">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-[#23244a]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Ashtakoot Score</h2>
              </div>
              {apiError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-6">{apiError}</div>
              )}
              {apiResult && (() => {
                const parsed = parseAshtakoot(apiResult.data);
                if (!parsed) {
                  return (
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto text-sm text-gray-800">{JSON.stringify(apiResult.data, null, 2)}</pre>
                  );
                }
                const total = Number(parsed.total_score || 0);
                const outOf = Number(parsed.out_of || 36);
                const band = compatibilityBand(total);
                const kootKeys: KootKey[] = ['varna_kootam','vasya_kootam','tara_kootam','yoni_kootam','graha_maitri_kootam','gana_kootam','rasi_kootam','nadi_kootam'];

                return (
                  <div>
                    <div className="mb-3 text-sm text-gray-600">Cached: {apiResult.cached ? 'Yes' : 'No'}</div>
                    <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 mb-6">
                      <div className="text-2xl font-bold text-[#23244a]">Total: {total} / {outOf}</div>
                      <div className={`text-sm mt-1 ${band.color}`}>{band.label}</div>
                      <div className="text-gray-700 text-sm mt-2">{band.message}</div>
                      <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-green-600 h-2" style={{ width: `${Math.max(0, Math.min(100, (total / outOf) * 100))}%` }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {kootKeys.map((key) => {
                        const koot = parsed[key] as KootScore | undefined;
                        const score = Number(koot?.score || 0);
                        const max = Number(koot?.out_of || 0);
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-baseline justify-between mb-1">
                              <div className="font-semibold text-[#23244a]">{kootTitles[key]}</div>
                              <div className="text-sm text-gray-700 font-medium">{score} / {max}</div>
                            </div>
                            <div className="text-xs text-gray-600 mb-3">{kootHelp[key]}</div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-emerald-500 h-1.5" style={{ width: max > 0 ? `${(score / max) * 100}%` : '0%' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.section>
        )}

        {/* 36 Gunas Explanation */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="rounded-lg p-6 sm:p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Understanding the 36 Gunas</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                The 36 Gunas system evaluates compatibility across 8 different aspects of life. Each aspect carries different points, totaling 36 points for perfect compatibility.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gunaDetails.map((guna, index) => (
                  <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-[#23244a]">{guna.name}</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {guna.points} {guna.points === 1 ? 'Point' : 'Points'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{guna.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg border border-amber-200">
                <h3 className="text-xl font-semibold text-[#23244a] mb-4">Compatibility Score Guide</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600 mb-2">0-17</div>
                    <div className="text-sm text-gray-700">Not Recommended</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">18-24</div>
                    <div className="text-sm text-gray-700">Average Match</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-2">25-36</div>
                    <div className="text-sm text-gray-700">Excellent Match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Why Choose Kundli Matching?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#23244a] mb-2">{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-[#23244a] mb-4 text-center">What You&apos;ll Receive</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Detailed compatibility report</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">36 Gunas analysis breakdown</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Dosha identification and remedies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Marriage timing recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Frequently Asked Questions</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className={`border-l-4 ${faq.borderColor} bg-white rounded-r-lg shadow-sm transition-all duration-300 hover:shadow-md`}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center focus:outline-none rounded-r-lg"
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

export default KundliMatchingPage;
