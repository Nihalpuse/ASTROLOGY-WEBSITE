'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AstrologerProfile } from '@/app/components/AstrologerProfile';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Moon, Star, Heart, Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

const MoonSignCalculatorPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'timeOfBirth') {
      const [hStr = '0'] = (e.target.value || '').split(':');
      const h24 = Number(hStr);
      if (!Number.isNaN(h24)) {
        setAmpm(h24 >= 12 ? 'PM' : 'AM');
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ moonSign: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ampm, setAmpm] = useState<'AM'|'PM'>('AM');
  const [timezone, setTimezone] = useState<string>('5.5');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');

  // Geoapify autocomplete
  type Suggestion = { label: string; lat: number; lon: number };
  const [placeQuery, setPlaceQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement | null>(null);

  const moonDescriptions: Record<string, string> = {
    Aries: 'Bold and impulsive, you act quickly on feelings and thrive on excitement.',
    Taurus: 'Steady and comfort-seeking, you value stability and sensual pleasures.',
    Gemini: 'Curious and communicative, your emotions flow through ideas and connection.',
    Cancer: 'Nurturing and caring, you find safety in home, family, and deep bonds.',
    Leo: 'Warm and expressive, you seek recognition and give love generously.',
    Virgo: 'Thoughtful and practical, you process emotions through service and details.',
    Libra: 'Diplomatic and harmony-seeking, you crave balance and partnership.',
    Scorpio: 'Intense and transformative, you feel deeply and value trust and truth.',
    Sagittarius: 'Optimistic and freedom-loving, you need space to explore and grow.',
    Capricorn: 'Responsible and composed, you prefer structure and emotional self-reliance.',
    Aquarius: 'Independent and idealistic, you emote through vision, ideas, and causes.',
    Pisces: 'Empathic and imaginative, you feel the world deeply and need spiritual flow.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      // Expect inputs similar to user’s request
      // For simplicity, parse from free-form fields; you can replace with selects if needed
      const date = new Date(formData.dateOfBirth);
      const [hh = '0', mm = '0'] = (formData.timeOfBirth || '0:0').split(':');
      const tzNum = Number(timezone || '5.5');
      const payload = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: Number(hh),
        minute: Number(mm),
        ampm,
        timezone: tzNum,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
      };
      const res = await fetch('/api/moonsign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to compute moon sign');
      }
      const moonSign: string = data.moonSign;
      setResult({ moonSign, description: moonDescriptions[moonSign] || 'Your Moon sign influences your inner world of emotions and instincts.' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
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

  const debouncedPlace = useDebouncedValue(placeQuery, 300);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedPlace || debouncedPlace.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`/api/geoapify/autocomplete?text=${encodeURIComponent(debouncedPlace)}&limit=5`);
        const data: { results?: Suggestion[] } = await res.json();
        if (!abort) setSuggestions(data.results || []);
      } catch {
        if (!abort) setSuggestions([]);
      }
    })();
    return () => { abort = true; };
  }, [debouncedPlace]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (suggestRef.current && !suggestRef.current.contains(t)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selectPlace = async (s: Suggestion) => {
    setFormData(prev => ({ ...prev, placeOfBirth: s.label }));
    setLatitude(String(s.lat));
    setLongitude(String(s.lon));
    setPlaceQuery(s.label);
    setShowSuggestions(false);
    // fetch timezone
    try {
      const tzRes = await fetch(`/api/geoapify/timezone?lat=${encodeURIComponent(String(s.lat))}&lon=${encodeURIComponent(String(s.lon))}`);
      const tzData = await tzRes.json() as { offset_hours?: number | null };
      if (typeof tzData.offset_hours === 'number') setTimezone(String(Number(tzData.offset_hours.toFixed(2))));
    } catch {}
  };

  // Time helpers
  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const getTimeParts = () => {
    const [hStr = '0', mStr = '0'] = (formData.timeOfBirth || '').split(':');
    const h24 = Math.max(0, Math.min(23, Number(hStr) || 0));
    const m = Math.max(0, Math.min(59, Number(mStr) || 0));
    return { h24, m };
  };
  const to12Hour = (h24: number) => {
    const h = h24 % 12;
    return h === 0 ? 12 : h;
  };
  const to24Hour = (h12: number, meridian: 'AM'|'PM') => {
    const h = Math.max(1, Math.min(12, Math.trunc(h12)));
    if (meridian === 'AM') return h === 12 ? 0 : h;
    return h === 12 ? 12 : h + 12;
  };

  const moonSignTraits = [
    {
      sign: "Moon in Aries",
      traits: "You are quick to act on your emotions and are driven by passion, courage, and competitiveness. You thrive on challenges but may struggle with impulsiveness."
    },
    {
      sign: "Moon in Taurus", 
      traits: "You seek stability and comfort in your emotional world, revolving around security, routine, and consistency. You value loyalty but may resist change."
    },
    {
      sign: "Moon in Gemini",
      traits: "You are intellectually curious and emotionally stimulated by communication, ideas, and variety. You crave mental engagement but may feel scattered at times."
    },
    {
      sign: "Moon in Cancer",
      traits: "You are deeply nurturing, intuitive, and sensitive. Home and family are central to your well-being, and you often retreat into your inner world for comfort."
    },
    {
      sign: "Moon in Leo",
      traits: "You have a dramatic flair and need recognition, expressing emotions with warmth, generosity, and creativity. You thrive when appreciated but may be prideful."
    },
    {
      sign: "Moon in Virgo", 
      traits: "You approach emotions with practicality and analysis, often seeking to improve yourself and others. You are caring but may be overly critical or perfectionist."
    },
    {
      sign: "Moon in Libra", 
      traits: "You seek harmony and balance in relationships, finding emotional security through partnerships. You value fairness and beauty but may struggle with indecision."
    },
    {
      sign: "Moon in Scorpio", 
      traits: "You feel emotions intensely and have a powerful intuition. Loyalty and depth define your bonds, but you may wrestle with jealousy or emotional extremes."
    },
    {
      sign: "Moon in Sagittarius", 
      traits: "You crave freedom, adventure, and new experiences to feel emotionally fulfilled. Optimistic and open-minded, but may struggle with restlessness or inconsistency."
    },
    {
      sign: "Moon in Capricorn", 
      traits: "You seek structure, discipline, and achievement for emotional security. Practical and responsible, though sometimes reserved or overly focused on control."
    },
    {
      sign: "Moon in Aquarius", 
      traits: "You are emotionally drawn to originality, independence, and humanitarian ideals. Detached at times, you value friendship and freedom over heavy emotional intensity."
    },
    {
      sign: "Moon in Pisces", 
      traits: "You are compassionate, dreamy, and deeply empathetic. Your emotions are intuitive and spiritual, though you may sometimes escape reality or feel overwhelmed."
    }
  ];

  const faqData = [
    {
      question: "What Is A Moon Sign Calculator?",
      answer: "The Moon Sign Calculator helps you discover your moon sign by analyzing the position of the moon at the exact time of your birth. Unlike your sun sign, which represents your outward personality, your moon sign reveals your inner emotional world, desires, and instincts. By understanding your moon sign, you can gain deeper insights into your emotional nature, reactions, and relationships.",
      borderColor: "border-orange-400"
    },
    {
      question: "Why Is Your Moon Sign Important?",
      answer: "Your moon sign is a vital component of your astrological profile, offering a window into your subconscious mind, feelings, and inner emotions. While your sun sign governs how you express yourself to the world, your moon sign governs how you feel inside and react emotionally. Understanding your moon sign can help you make sense of your moods, emotional triggers, and how you nurture yourself and others.",
      borderColor: "border-purple-400"
    },
    {
      question: "How Does The Moon Sign Calculator Work?",
      answer: "The Moon Sign Calculator uses your date, time, and place of birth to determine the exact position of the moon at the moment you were born. This position corresponds to one of the 12 zodiac signs, each of which reflects a different emotional energy. Simply enter your birth details, and the calculator will reveal your moon sign along with a detailed explanation of its significance.",
      borderColor: "border-blue-400"
    },
    {
      question: "What Is My Moon Sign?",
      answer: "Your moon sign is the zodiac sign the moon was in at the time of your birth. It represents your emotional side, instincts, and how you react to feelings and situations. To find your moon sign, you'll need to know your exact birth date, time, and location. Once you have that, you can calculate it using an astrology tool or by consulting an astrologer.",
      borderColor: "border-green-400"
    },
    {
      question: "How Is The Moon Sign Different From The Sun Sign?",
      answer: "The sun sign represents your core identity, ego, and how you present yourself to the world. The moon sign, on the other hand, governs your emotions, intuition, and inner feelings. While your sun sign shows how you pursue goals and express yourself, your moon sign reveals how you process emotions and seek comfort. This section helps users understand the key differences and why knowing both signs is essential for a full understanding of their astrological profile.",
      borderColor: "border-red-400"
    },
    {
      question: "What Does Your Moon Sign Say About You?",
      answer: "Your moon sign reveals your emotional patterns, subconscious desires, and instinctual reactions. It shows how you nurture yourself and others, what makes you feel secure, and how you process feelings. Understanding your moon sign helps you recognize your emotional needs and develop better self-awareness.",
      borderColor: "border-indigo-400"
    }
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
          className="w-full rounded-3xl py-8 sm:py-12 px-4 sm:px-6 md:px-16 mb-8 sm:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]"
          style={{ backgroundColor: "#FEFBF2" }}
        >
          <h1
            className="text-5xl md:text-6xl font-extrabold text-black mb-4 text-center drop-shadow-lg font-serif"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Moon Sign Calculator
          </h1>
          <p
            className="text-xl md:text-2xl text-center max-w-3xl font-sans"
            style={{
              fontFamily: "Open Sans, Arial, sans-serif",
              color: "#166534",
            }}
          >
            Discover your emotional nature and inner self through the wisdom of lunar astrology
          </p>
        </motion.div>

        {/* What Is A Moon Sign Calculator Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Is A Moon Sign Calculator?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The Moon Sign Calculator helps you discover your moon sign by analyzing the position of the moon at the exact time of your birth. Unlike your sun sign, which represents your outward personality, your moon sign reveals your inner emotional world, desires, and instincts.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                By understanding your moon sign, you can gain deeper insights into your emotional nature, reactions, and relationships. This powerful tool connects you with the lunar energies that influence your subconscious mind and emotional patterns.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Why Is Your Moon Sign Important Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="rounded-lg p-6 sm:p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Why Is Your Moon Sign Important?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Your moon sign is a vital component of your astrological profile, offering a window into your subconscious mind, feelings, and inner emotions. While your sun sign governs how you express yourself to the world, your moon sign governs how you feel inside and react emotionally.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Understanding your moon sign can help you make sense of your moods, emotional triggers, and how you nurture yourself and others.
              </p>
              <div className="text-center mt-8">
                <p className="text-lg font-semibold text-[#166534] italic">
                  Get your Moon sign first — then see what the universe has planned for you this month. Know your monthly horoscope!
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Moon Sign Calculator Form */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Moon Sign Calculator</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 text-neutral-900 placeholder:text-neutral-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 text-neutral-900 placeholder:text-neutral-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Phone:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 text-neutral-900 placeholder:text-neutral-500"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Birth (DD/MM/YYYY):
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 text-neutral-900 placeholder:text-neutral-500"
                    placeholder="DD/MM/YYYY"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time of Birth:
                  </label>
                  <input
                    type="time"
                    name="timeOfBirth"
                    value={formData.timeOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 text-neutral-900 placeholder:text-neutral-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Place of Birth:
                  </label>
                  <div className="relative" ref={suggestRef}>
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={(e) => { handleInputChange(e); setPlaceQuery(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 text-neutral-900 placeholder:text-neutral-500"
                      placeholder="ENTER PLACE OF BIRTH"
                      required
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow max-h-56 overflow-auto">
                        {suggestions.map((s, i) => (
                          <li key={`${s.label}-${i}`} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700" onClick={() => selectPlace(s)}>
                            {s.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Hour</label>
                    <input type="number" min={1} max={12} value={to12Hour(getTimeParts().h24)}
                      onChange={(e) => {
                        const newH12 = Number(e.target.value);
                        const { m } = getTimeParts();
                        const h24 = to24Hour(newH12, ampm);
                        handleInputChange({ target: { name: 'timeOfBirth', value: `${pad2(h24)}:${pad2(m)}` } } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-neutral-900 placeholder:text-neutral-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Minute</label>
                    <input type="number" min={0} max={59} value={getTimeParts().m}
                      onChange={(e) => {
                        const newM = Math.max(0, Math.min(59, Number(e.target.value) || 0));
                        const { h24 } = getTimeParts();
                        handleInputChange({ target: { name: 'timeOfBirth', value: `${pad2(h24)}:${pad2(newM)}` } } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-neutral-900 placeholder:text-neutral-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">AM / PM</label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="radio" name="ampm" checked={ampm==='AM'} onChange={()=>{
                        const { h24, m } = getTimeParts();
                        const newH24 = to24Hour(to12Hour(h24), 'AM');
                        handleInputChange({ target: { name: 'timeOfBirth', value: `${pad2(newH24)}:${pad2(m)}` } } as React.ChangeEvent<HTMLInputElement>);
                        setAmpm('AM');
                      }} /> AM</label>
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="radio" name="ampm" checked={ampm==='PM'} onChange={()=>{
                        const { h24, m } = getTimeParts();
                        const newH24 = to24Hour(to12Hour(h24), 'PM');
                        handleInputChange({ target: { name: 'timeOfBirth', value: `${pad2(newH24)}:${pad2(m)}` } } as React.ChangeEvent<HTMLInputElement>);
                        setAmpm('PM');
                      }} /> PM</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Timezone</label>
                    <input type="number" step="any" value={timezone} onChange={(e)=>setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-neutral-900 placeholder:text-neutral-500" placeholder="e.g. 5.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Latitude</label>
                    <input type="number" step="any" value={latitude} onChange={(e)=>setLatitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-neutral-900 placeholder:text-neutral-500" placeholder="optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#23244a] mb-2">Longitude</label>
                    <input type="number" step="any" value={longitude} onChange={(e)=>setLongitude(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 text-neutral-900 placeholder:text-neutral-500" placeholder="optional" />
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg disabled:opacity-60"
                  >
                    {loading ? 'CALCULATING…' : 'CALCULATE'}
                  </button>
                </div>
              </form>
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>
              )}
              {result && (
                <div className="mt-6 bg-white rounded-lg border border-green-200 p-5">
                  <h4 className="text-2xl font-bold text-[#23244a] mb-2">Your moon sign is <span className="text-green-700">{result.moonSign}</span>.</h4>
                  <p className="text-gray-700 leading-relaxed">{result.description}</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* You've Seen a Glimpse CTA */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 rounded-lg shadow-lg p-6 sm:p-8 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                You&apos;ve Seen a Glimpse...
              </h2>
              <p className="text-xl mb-6">
                Now Explore the Full Download on Your Life
              </p>
              <button className="bg-white text-green-700 px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                Get Your Personalized Kundli
              </button>
            </div>
          </div>
        </motion.section>

        {/* How Does The Moon Sign Calculator Work */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>How Does The Moon Sign Calculator Work?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                The Moon Sign Calculator uses your date, time, and place of birth to determine the exact position of the moon at the moment you were born. This position corresponds to one of the 12 zodiac signs, each of which reflects a different emotional energy. Simply enter your birth details, and the calculator will reveal your moon sign along with a detailed explanation of its significance.
              </p>
            </div>
          </div>
        </motion.section>

        {/* What Is My Moon Sign */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="rounded-lg p-6 sm:p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Is My Moon Sign?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Your moon sign is the zodiac sign the moon was in at the time of your birth. It represents your emotional side, instincts, and how you react to feelings and situations. To find your moon sign, you&apos;ll need to know your exact birth date, time, and location. Once you have that, you can calculate it using an astrology tool or by <a href="#" className="text-green-600 underline">consulting an astrologer</a>.
              </p>
            </div>
          </div>
        </motion.section>

        {/* How Is The Moon Sign Different From The Sun Sign */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>How Is The Moon Sign Different From The Sun Sign?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The sun sign represents your core identity, ego, and how you present yourself to the world. The moon sign, on the other hand, governs your emotions, intuition, and inner feelings. While your sun sign shows how you pursue goals and express yourself, your moon sign reveals how you process emotions and seek comfort.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                This section helps users understand the key differences and why knowing both signs is essential for a full understanding of their astrological profile.
              </p>
            </div>
          </div>
        </motion.section>

        {/* What Does Your Moon Sign Say About You */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Does Your Moon Sign Say About You?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Discover the emotional and psychological traits associated with your moon sign. For example:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {moonSignTraits.map((trait, index) => (
                  <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-green-200">
                    <h3 className="text-lg font-semibold text-[#23244a] mb-3 flex items-center">
                      <Moon className="w-5 h-5 mr-2 text-green-600" />
                      {trait.sign}
                    </h3>
                    <p className="text-gray-700 text-sm">{trait.traits}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Moon Sign And Family Dynamics */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Moon Sign And Family Dynamics</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                Explore how your moon sign affects your role in family dynamics. For example, a Moon in Cancer might naturally take on a nurturing role, while a Moon in Capricorn could approach family matters more practically. Understanding your moon sign can help you communicate better with family members and build stronger emotional bonds.
              </p>
            </div>
          </div>
        </motion.section>

        {/* How To Find Moon Sign */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>How To Find Moon Sign?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                To find your moon sign, follow these steps:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#23244a] mb-2">Gather Your Birth Details:</h3>
                    <p className="text-gray-700">You need your exact birth date, time, and location.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <Sparkles className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#23244a] mb-2">Use an Online Astrology Calculator:</h3>
                    <p className="text-gray-700">Input your birth details into a free online tool to calculate your moon sign.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#23244a] mb-2">Consult an Astrologer:</h3>
                    <p className="text-gray-700">For a more personalized reading, you can ask an astrologer to generate your natal chart.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#23244a] mb-2">Check Your Birth Chart:</h3>
                    <p className="text-gray-700">If you&apos;re familiar with astrology, look at your chart to find the moon&apos;s position.</p>
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
          transition={{ duration: 0.6, delay: 1.0 }}
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
                      {faq.question}
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

export default MoonSignCalculatorPage;
