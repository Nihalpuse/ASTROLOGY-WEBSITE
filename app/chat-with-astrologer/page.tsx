"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { Search, Filter, Star, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/playfair-display/600.css";

const API_URL = "/api/user/chatwithastrologer";

function useDynamicCardAnimation() {
  const [style, setStyle] = useState({});
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * -8;
    setStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
      filter: `drop-shadow(0 8px 16px rgba(255, 200, 80, 0.3)) drop-shadow(0 0 20px rgba(255, 193, 7, 0.4))`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });
  }, []);
  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)',
      filter: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    });
  }, []);
  return { style, handleMouseMove, handleMouseLeave };
}

// Define the sort options
const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity" },
  { label: "Experience: High to Low", value: "exp_high" },
  { label: "Experience: Low to High", value: "exp_low" },
  { label: "Total Orders: High to Low", value: "orders_high" },
  { label: "Total Orders: Low to High", value: "orders_low" },
  { label: "Price: High to Low", value: "price_high" },
  { label: "Price: Low to High", value: "price_low" },
  { label: "Rating: High to Low", value: "rating_high" },
];

// Astrologer type for fetched data
interface Astrologer {
  id: number;
  name: string;
  skills: string[];
  languages: string[];
  experience: number;
  price: number;
  rating: number;
  orders: number;
  isNew: boolean;
  img: string;
}

function AstrologerCard({ astrologer }: { astrologer: Astrologer }) {
  const { style, handleMouseMove, handleMouseLeave } = useDynamicCardAnimation();
  const { t } = useTranslation();
  const a = astrologer;
  return (
    <motion.div
      key={a.id}
      initial={{ opacity: 0, y: 60, scale: 0.92, rotateX: 12, rotateY: -12 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, rotateY: 0 }}
      exit={{ opacity: 0, y: 60, scale: 0.92, rotateX: 12, rotateY: -12 }}
      transition={{ duration: 0.38, delay: 0, type: 'spring', stiffness: 700, damping: 32, mass: 0.7 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="block"
    >
      <Link href={`/astrologer/${a.id}`} className="block h-full">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-3 cursor-pointer h-full border border-transparent transition-all duration-300 hover:shadow-lg hover:border-yellow-300 hover:shadow-yellow-200/50 w-full mx-auto" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}>
          <div className="flex items-start gap-3 sm:gap-4 md:gap-6 lg:gap-8 flex-1">
            <img src={a.img} alt={a.name} className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2 flex-wrap">
                <span className="font-bold text-lg sm:text-xl text-[#23244a] line-clamp-2" style={{ fontFamily: 'Playfair Display, Poppins, Inter, Montserrat, Arial, sans-serif' }}>{a.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {a.isNew && <span className="text-xs text-red-500 font-bold">{t('chatWithAstrologer.new', 'New!')}</span>}
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-medium mb-1 line-clamp-2">{a.skills.join(", ")}</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium mb-1 line-clamp-2">{a.languages.join(", ")}</div>
              <div className="text-sm sm:text-base text-gray-500 font-medium">{t('chatWithAstrologer.experience', 'Exp:')} {a.experience} {t('chatWithAstrologer.years', 'Years')}</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2 mt-auto pt-3 sm:pt-4">
            <div className="flex items-center justify-between sm:justify-start sm:flex-1 gap-2">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-bold text-base sm:text-lg">{a.rating}</span>
              </div>
              {a.orders > 0 && <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded shadow-sm">{a.orders} {t('chatWithAstrologer.orders', 'orders')}</span>}
              <span className="text-sm sm:text-base text-gray-700 font-bold">₹ {a.price}/min</span>
            </div>
            <Link href={`/astrologers/${a.id}`} className="w-full sm:w-auto">
              <button className="border-2 border-green-500 text-green-600 font-bold py-2.5 px-4 sm:px-6 rounded-lg hover:bg-green-50 transition w-full sm:w-auto text-sm sm:text-base min-h-[44px]" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}>{t('chatWithAstrologer.chat', 'Chat')}</button>
            </Link>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ChatWithAstrologer() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch astrologers from API
  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (selectedSkill) params.append("skill", selectedSkill);
    if (selectedLanguage) params.append("language", selectedLanguage);
    if (sortBy) params.append("sortBy", sortBy);
    if (search) params.append("search", search);
    fetch(`${API_URL}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setAstrologers(data.astrologers || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load astrologers");
        setLoading(false);
      });
  }, [selectedSkill, selectedLanguage, sortBy, search]);

  // Extract skills and languages from fetched data
  const SKILLS = useMemo(() => Array.from(new Set(astrologers.flatMap(a => a.skills))), [astrologers]);
  const LANGUAGES = useMemo(() => Array.from(new Set(astrologers.flatMap(a => a.languages))), [astrologers]);

  // Use fetched astrologers directly
  const filteredAstrologers = astrologers;

  return (
    <motion.div
      className="min-h-screen bg-[#fafbfc] py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 font-poppins"
      style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Banner Heading */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ duration: 0.7 }} 
        className="w-full rounded-2xl md:rounded-3xl py-8 md:py-12 px-4 md:px-16 mb-8 md:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]" 
        style={{ backgroundColor: '#FEFBF2' }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-3 md:mb-4 text-center drop-shadow-lg font-serif leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {t('chatWithAstrologer.title', 'Chat with Astrologer')}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center max-w-3xl font-sans px-2" style={{ fontFamily: 'Open Sans, Arial, sans-serif', color: '#166534' }}>
          Connect with experienced astrologers for personalized guidance and spiritual insights.
        </p>
      </motion.div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <span className="text-gray-700 font-medium text-sm sm:text-base" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}>{t('chatWithAstrologer.balance', 'Available balance:')} <span className="font-bold">₹ 0</span></span>
            <button className="bg-green-800 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-900 transition text-sm sm:text-base" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}>{t('chatWithAstrologer.recharge', 'Recharge')}</button>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-6">
        {/* Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
            <span className="text-sm sm:text-base font-medium" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}>Filter:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
            <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base bg-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all shadow-sm text-[#23244a] min-h-[44px]" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif', color: '#23244a' }}>
              <option value="">{t('chatWithAstrologer.allSkills', 'All Skills')}</option>
              {SKILLS.map(skill => <option key={skill} value={skill}>{skill}</option>)}
            </select>
            <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base bg-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all shadow-sm text-[#23244a] min-h-[44px]" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif', color: '#23244a' }}>
              <option value="">{t('chatWithAstrologer.allLanguages', 'All Languages')}</option>
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
        </div>
        {/* Sort By and Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center flex-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium text-sm sm:text-base whitespace-nowrap" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif' }}>{t('chatWithAstrologer.sortBy', 'Sort by:')}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base bg-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all shadow-sm text-[#23244a] min-h-[44px] flex-1" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif', color: '#23244a' }}>
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{t(`chatWithAstrologer.sort.${opt.value}`, opt.label)}</option>)}
              </select>
            </div>
            {/* Search */}
            <form className="flex gap-2 items-center flex-1 sm:max-w-xs" onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                placeholder={t('chatWithAstrologer.searchPlaceholder', 'Search name...')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm sm:text-base bg-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all shadow-sm text-[#23244a] flex-1 min-h-[44px]" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif', color: '#23244a' }}
              />
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-[#23244a] rounded-lg px-3 py-2.5 shadow font-bold min-h-[44px] flex items-center justify-center" style={{ fontFamily: 'Poppins, Inter, Montserrat, Arial, sans-serif', color: '#23244a' }}>
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Astrologer List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {loading ? (
          <div className="col-span-full text-center py-12 text-base sm:text-lg font-semibold text-gray-500">{t('chatWithAstrologer.loading', 'Loading astrologers...')}</div>
        ) : error ? (
          <div className="col-span-full text-center py-12 text-base sm:text-lg font-semibold text-red-500">{error}</div>
        ) : (
          <AnimatePresence>
            {filteredAstrologers.map((a, idx) => (
              <AstrologerCard key={a.id} astrologer={a} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
} 