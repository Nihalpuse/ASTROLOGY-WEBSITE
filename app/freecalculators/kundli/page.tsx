'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type AmPm = 'AM' | 'PM';

type KundliForm = {
  name: string;
  gender: 'male' | 'female' | 'other';
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 1-12 when using am/pm
  minute: number; // 0-59
  ampm: AmPm;
  timezone: number; // e.g., 5.5 for IST
  latitude: number; // -90..90
  longitude: number; // -180..180
};

type KundliApiResponse = {
  success?: boolean;
  error?: string;
  dateTimeUtc?: string;
  sun?: { eclipticLongitude: number; sign: string };
  moon?: { eclipticLongitude: number; sign: string };
  nakshatra?: { name: string; number: number; pada: number };
  tithi?: { name: string; number: number; paksha: 'Shukla' | 'Krishna' };
};

const defaultForm: KundliForm = {
  name: '',
  gender: 'male',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  day: new Date().getDate(),
  hour: 12,
  minute: 0,
  ampm: 'PM',
  timezone: 5.5,
  latitude: 17.38333,
  longitude: 78.4666,
};

const KundliCalculatorPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<KundliForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<KundliApiResponse | null>(null);

  const updateField = <K extends keyof KundliForm>(key: K, value: KundliForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/kundli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: form.year,
          month: form.month,
          day: form.day,
          hour: form.hour,
          minute: form.minute,
          ampm: form.ampm,
          timezone: form.timezone,
          latitude: form.latitude,
          longitude: form.longitude,
        }),
      });
      const data: KundliApiResponse = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to calculate');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20 font-sans">
      <div className="max-w-4xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full rounded-2xl sm:rounded-3xl py-8 sm:py-10 px-4 sm:px-8 mb-8 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]"
          style={{ backgroundColor: '#FEFBF2' }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3 text-center drop-shadow-lg font-serif leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Personalized Kundli
          </h1>
          <p className="text-base sm:text-lg text-center max-w-2xl" style={{ color: '#166534' }}>
            Enter your birth details to get your basic kundli insights.
          </p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg border border-[#e6c77e] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => updateField('gender', e.target.value as KundliForm['gender'])}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="DD"
                  value={form.day}
                  onChange={e => updateField('day', Math.max(1, Math.min(31, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={1}
                  max={31}
                  required
                />
                <input
                  type="number"
                  placeholder="MM"
                  value={form.month}
                  onChange={e => updateField('month', Math.max(1, Math.min(12, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={1}
                  max={12}
                  required
                />
                <input
                  type="number"
                  placeholder="YYYY"
                  value={form.year}
                  onChange={e => updateField('year', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={1800}
                  max={3000}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Time</label>
              <div className="grid grid-cols-4 gap-3 items-center">
                <input
                  type="number"
                  placeholder="HH"
                  value={form.hour}
                  onChange={e => updateField('hour', Math.max(1, Math.min(12, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={1}
                  max={12}
                  required
                />
                <input
                  type="number"
                  placeholder="MM"
                  value={form.minute}
                  onChange={e => updateField('minute', Math.max(0, Math.min(59, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={0}
                  max={59}
                  required
                />
                <select
                  value={form.ampm}
                  onChange={e => updateField('ampm', e.target.value as AmPm)}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
                <input
                  type="number"
                  step="0.25"
                  placeholder="Timezone (e.g., 5.5)"
                  value={form.timezone}
                  onChange={e => updateField('timezone', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Timezone example: India = 5.5, New York (DST) ≈ -4</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Location</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={e => updateField('latitude', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={e => updateField('longitude', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-emerald-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Calculating…' : 'Get Basic Kundli'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 px-4 py-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
          )}

          {result && result.success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200 p-6">
              <h2 className="text-xl font-semibold text-emerald-800 mb-4">Your Basic Kundli</h2>
              <div className="text-gray-800">
                <div className="mb-1"><span className="font-medium">Name:</span> {form.name}</div>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-white rounded border border-emerald-200 p-3">
                    <div className="font-medium text-emerald-800">Moon</div>
                    <div>Sign: {result.moon?.sign}</div>
                    <div>Longitude: {result.moon?.eclipticLongitude.toFixed(2)}°</div>
                  </div>
                  <div className="bg-white rounded border border-emerald-200 p-3">
                    <div className="font-medium text-emerald-800">Sun</div>
                    <div>Sign: {result.sun?.sign}</div>
                    <div>Longitude: {result.sun?.eclipticLongitude.toFixed(2)}°</div>
                  </div>
                  <div className="bg-white rounded border border-emerald-200 p-3">
                    <div className="font-medium text-emerald-800">Nakshatra</div>
                    <div>{result.nakshatra?.name} (#{result.nakshatra?.number}), Pada {result.nakshatra?.pada}</div>
                  </div>
                  <div className="bg-white rounded border border-emerald-200 p-3">
                    <div className="font-medium text-emerald-800">Tithi</div>
                    <div>{result.tithi?.name} (#{result.tithi?.number}) • {result.tithi?.paksha} Paksha</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">These are basic kundli parameters computed from solar and lunar ecliptic longitudes.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KundliCalculatorPage;


