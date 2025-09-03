'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/useLanguage';

// Zodiac sign interface
interface ZodiacSign {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Color mapping for zodiac signs
const zodiacColors: { [key: string]: { color: string; shadowColor: string; dates: string } } = {
  'aries': { color: 'from-red-300 via-orange-300 to-red-400', shadowColor: 'shadow-red-400/40', dates: 'Mar 21 - Apr 19' },
  'taurus': { color: 'from-green-300 via-emerald-300 to-green-400', shadowColor: 'shadow-green-400/40', dates: 'Apr 20 - May 20' },
  'gemini': { color: 'from-yellow-300 via-amber-300 to-yellow-400', shadowColor: 'shadow-yellow-400/40', dates: 'May 21 - Jun 20' },
  'cancer': { color: 'from-blue-300 via-cyan-300 to-blue-400', shadowColor: 'shadow-blue-400/40', dates: 'Jun 21 - Jul 22' },
  'leo': { color: 'from-orange-300 via-amber-300 to-orange-400', shadowColor: 'shadow-orange-400/40', dates: 'Jul 23 - Aug 22' },
  'virgo': { color: 'from-emerald-300 via-teal-300 to-emerald-400', shadowColor: 'shadow-emerald-400/40', dates: 'Aug 23 - Sep 22' },
  'libra': { color: 'from-pink-300 via-rose-300 to-pink-400', shadowColor: 'shadow-pink-400/40', dates: 'Sep 23 - Oct 22' },
  'scorpio': { color: 'from-purple-300 via-violet-300 to-purple-400', shadowColor: 'shadow-purple-400/40', dates: 'Oct 23 - Nov 21' },
  'sagittarius': { color: 'from-indigo-300 via-blue-300 to-indigo-400', shadowColor: 'shadow-indigo-400/40', dates: 'Nov 22 - Dec 21' },
  'capricorn': { color: 'from-gray-300 via-slate-300 to-gray-400', shadowColor: 'shadow-gray-400/40', dates: 'Dec 22 - Jan 19' },
  'aquarius': { color: 'from-cyan-300 via-sky-300 to-cyan-400', shadowColor: 'shadow-cyan-400/40', dates: 'Jan 20 - Feb 18' },
  'pisces': { color: 'from-teal-300 via-green-300 to-teal-400', shadowColor: 'shadow-teal-400/40', dates: 'Feb 19 - Mar 20' }
};

// CINEMATIC ANIMATION VARIANTS
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// HEROIC RIGHT TO LEFT SLIDE
const heroicSlideVariants = {
  hidden: { 
    x: 120,
    opacity: 0,
    scale: 0.85
  },
  visible: { 
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// SIMPLE FRONT SCALE HOVER
const iconHoverVariants = {
  rest: { 
    scale: 1
  },
  hover: { 
    scale: 1.1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
      duration: 0.3
    }
  }
};

export default function ZodiacCategories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showAll, setShowAll] = useState(false);
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacSign[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch zodiac signs from backend
  useEffect(() => {
    const fetchZodiacSigns = async () => {
      try {
        const response = await fetch('/api/zodiac-signs');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched zodiac signs:', data);
          setZodiacSigns(data || []);
        } else {
          console.error('Failed to fetch zodiac signs');
          setZodiacSigns([]);
        }
      } catch (error) {
        console.error('Error fetching zodiac signs:', error);
        setZodiacSigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchZodiacSigns();
  }, []);

  // Split zodiac signs into main (first 6) and additional (remaining)
  const mainZodiacSigns = zodiacSigns.slice(0, 6);
  const additionalZodiacSigns = zodiacSigns.slice(6);

  // Debug logging
  console.log('Component state:', { loading, zodiacSigns: zodiacSigns.length, mainZodiacSigns: mainZodiacSigns.length, additionalZodiacSigns: additionalZodiacSigns.length });

  // Helper function to get zodiac sign data with colors and dates
  const getZodiacData = (sign: ZodiacSign) => {
    const colorData = zodiacColors[sign.slug.toLowerCase()] || {
      color: 'from-gray-300 via-slate-300 to-gray-400',
      shadowColor: 'shadow-gray-400/40',
      dates: 'Unknown'
    };
    
    return {
      ...sign,
      ...colorData,
      image: sign.image_url || '/placeholder-user.jpg',
      symbol: '' // Empty symbol for now
    };
  };

  return (
    <section 
      className="py-16 relative w-screen overflow-visible" 
      style={{ 
        marginLeft: 'calc(-50vw + 50%)', 
        marginRight: 'calc(-50vw + 50%)',
        maxWidth: '100vw'
      }}
    >
      
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-yellow-200/15 to-amber-200/15 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full px-8 md:px-16 lg:px-20 relative z-10">
        
                 {/* Section Header */}
         <motion.div
           className="text-center mb-12"
           initial={{ opacity: 0, y: -30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
         >
           <h2 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4 text-slate-800"
               style={{ fontFamily: 'Playfair Display, serif' }}>
             Shop By Zodiac
           </h2>
           
           <motion.div
             className="w-24 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 mx-auto rounded-full"
             initial={{ scaleX: 0, opacity: 0 }}
             animate={{ 
               scaleX: 1, 
               opacity: 1,
               transition: { duration: 1, delay: 0.8 }
             }}
           />
         </motion.div>

                {/* MAIN ZODIAC SIGNS - First Row */}
        <div ref={ref}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              <span className="ml-3 text-slate-600">Loading zodiac signs...</span>
            </div>
          ) : zodiacSigns.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🌟</div>
                <p className="text-slate-600 text-lg">No zodiac signs available</p>
                <p className="text-slate-500 text-sm mt-2">Please add zodiac signs through the admin panel</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Horizontal Scroll */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="md:hidden overflow-x-auto scrollbar-hide scroll-smooth mb-8"
              >
                <div className="flex gap-4 px-4 py-6 min-w-max">
                  {mainZodiacSigns.map((sign, index) => {
                    const zodiacData = getZodiacData(sign);
                    return (
                      <motion.div
                        key={sign.slug}
                        variants={heroicSlideVariants}
                        className="flex flex-col items-center p-2 flex-shrink-0"
                      >
                        <Link href={`/shop/zodiac/${sign.slug}`}>
                          <motion.div
                            variants={iconHoverVariants}
                            initial="rest"
                            whileHover="hover"
                            className="relative cursor-pointer"
                          >
                            {/* CIRCULAR ZODIAC CARD - Mobile optimized */}
                            <motion.div
                              className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${zodiacData.color} shadow-lg ${zodiacData.shadowColor} border-3 border-white/40 overflow-hidden`}
                              whileHover={{
                                scale: 1.1,
                                boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)',
                                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                              }}
                            >
                              {/* ZODIAC IMAGE */}
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                <Image
                                  src={zodiacData.image}
                                  alt={sign.name}
                                  fill
                                  className="object-cover object-center"
                                  sizes="96px"
                                />
                              </div>
                              
                              {/* SUBTLE COLOR OVERLAY */}
                              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${zodiacData.color} opacity-30 mix-blend-soft-light`} />
                              
                              {/* ZODIAC SYMBOL */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl text-white font-bold drop-shadow-lg">
                                  {zodiacData.symbol}
                                </span>
                              </div>
                              
                              {/* INNER GLOW */}
                              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                            </motion.div>
                          </motion.div>
                        </Link>

                        {/* ZODIAC NAME - Mobile optimized */}
                        <motion.h3
                          className="mt-2 text-center text-sm font-semibold text-slate-700 whitespace-nowrap"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: 1, 
                            y: 0,
                            transition: { delay: index * 0.1 + 0.8, duration: 0.4 }
                          }}
                        >
                          {sign.name}
                        </motion.h3>
                        
                        {/* DATES - Mobile optimized */}
                        <motion.p
                          className="text-xs text-slate-500 mt-1 text-center whitespace-nowrap"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: { delay: index * 0.1 + 1, duration: 0.4 }
                          }}
                        >
                          {zodiacData.dates}
                        </motion.p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Desktop Grid Layout */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 lg:gap-10 mb-8 px-4 py-6 max-w-none"
              >
                {mainZodiacSigns.map((sign, index) => {
                  const zodiacData = getZodiacData(sign);
                  return (
                    <motion.div
                      key={sign.slug}
                      variants={heroicSlideVariants}
                      className="flex flex-col items-center p-2"
                    >
                      <Link href={`/shop/zodiac/${sign.slug}`}>
                        <motion.div
                          variants={iconHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          className="relative cursor-pointer"
                        >
                          {/* CIRCULAR ZODIAC CARD */}
                          <motion.div
                            className={`relative w-32 h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-gradient-to-br ${zodiacData.color} shadow-lg ${zodiacData.shadowColor} border-3 border-white/40 overflow-hidden`}
                            whileHover={{
                              scale: 1.15,
                              boxShadow: '0 25px 50px rgba(251, 146, 60, 0.4)',
                              transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                            }}
                          >
                            {/* ZODIAC IMAGE */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                              <Image
                                src={zodiacData.image}
                                alt={sign.name}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 1024px) 128px, (max-width: 1280px) 144px, 160px"
                              />
                            </div>
                            
                            {/* SUBTLE COLOR OVERLAY */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${zodiacData.color} opacity-30 mix-blend-soft-light`} />
                            
                            {/* ZODIAC SYMBOL */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-5xl lg:text-6xl xl:text-7xl text-white font-bold drop-shadow-lg">
                                {zodiacData.symbol}
                              </span>
                            </div>
                            
                            {/* INNER GLOW */}
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                          </motion.div>
                        </motion.div>
                      </Link>

                      {/* ZODIAC NAME */}
                      <motion.h3
                        className="mt-3 text-center text-base font-semibold text-slate-700"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1, 
                          y: 0,
                          transition: { delay: index * 0.1 + 0.8, duration: 0.4 }
                        }}
                      >
                        {sign.name}
                      </motion.h3>
                      
                      {/* DATES */}
                      <motion.p
                        className="text-xs text-slate-500 mt-1 text-center"
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: { delay: index * 0.1 + 1, duration: 0.4 }
                        }}
                      >
                        {zodiacData.dates}
                      </motion.p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </>
          )}
        </div>

        {/* EXPANDABLE SECTION */}
        <AnimatePresence>
          {showAll && additionalZodiacSigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-visible"
            >
              {/* Mobile Horizontal Scroll for Additional Signs */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="md:hidden overflow-x-auto scrollbar-hide scroll-smooth mb-8"
              >
                <div className="flex gap-4 px-4 py-6 min-w-max">
                  {additionalZodiacSigns.map((sign, index) => {
                    const zodiacData = getZodiacData(sign);
                    return (
                      <motion.div
                        key={sign.slug}
                        variants={heroicSlideVariants}
                        className="flex flex-col items-center p-2 flex-shrink-0"
                      >
                        <Link href={`/shop/zodiac/${sign.slug}`}>
                          <motion.div
                            variants={iconHoverVariants}
                            initial="rest"
                            whileHover="hover"
                            className="relative cursor-pointer"
                          >
                            {/* CIRCULAR ZODIAC CARD - Mobile optimized */}
                            <motion.div
                              className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${zodiacData.color} shadow-lg ${zodiacData.shadowColor} border-3 border-white/40 overflow-hidden`}
                              whileHover={{
                                scale: 1.1,
                                boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)',
                                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                              }}
                            >
                              {/* ZODIAC IMAGE */}
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                <Image
                                  src={zodiacData.image}
                                  alt={sign.name}
                                  fill
                                  className="object-cover object-center"
                                  sizes="96px"
                                />
                              </div>
                              
                              {/* COLOR OVERLAY */}
                              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${zodiacData.color} opacity-30 mix-blend-soft-light`} />
                              
                              {/* ZODIAC SYMBOL */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl text-white font-bold drop-shadow-lg">
                                  {zodiacData.symbol}
                                </span>
                              </div>
                              
                              {/* INNER GLOW */}
                              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                            </motion.div>
                          </motion.div>
                        </Link>

                        {/* ZODIAC NAME - Mobile optimized */}
                        <h3 className="mt-2 text-center text-sm font-semibold text-slate-700 whitespace-nowrap"
                            style={{ fontFamily: 'Playfair Display, serif' }}>
                          {sign.name}
                        </h3>
                        
                        {/* DATES - Mobile optimized */}
                        <p className="text-xs text-slate-500 mt-1 text-center whitespace-nowrap">
                          {zodiacData.dates}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Desktop Grid Layout for Additional Signs */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 lg:gap-10 mb-8 px-4 py-6 max-w-none"
              >
                {additionalZodiacSigns.map((sign, index) => {
                  const zodiacData = getZodiacData(sign);
                  return (
                    <motion.div
                      key={sign.slug}
                      variants={heroicSlideVariants}
                      className="flex flex-col items-center p-2"
                    >
                      <Link href={`/shop/zodiac/${sign.slug}`}>
                        <motion.div
                          variants={iconHoverVariants}
                          initial="rest"
                          whileHover="hover"
                          className="relative cursor-pointer"
                        >
                          {/* CIRCULAR ZODIAC CARD */}
                          <motion.div
                            className={`relative w-32 h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-gradient-to-br ${zodiacData.color} shadow-lg ${zodiacData.shadowColor} border-3 border-white/40 overflow-hidden`}
                            whileHover={{
                              scale: 1.15,
                              boxShadow: '0 25px 50px rgba(251, 146, 60, 0.4)',
                              transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                            }}
                          >
                            {/* ZODIAC IMAGE */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                              <Image
                                src={zodiacData.image}
                                alt={sign.name}
                                fill
                                className="object-cover object-center"
                                sizes="(max-width: 1024px) 128px, (max-width: 1280px) 144px, 160px"
                              />
                            </div>
                            
                            {/* COLOR OVERLAY */}
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${zodiacData.color} opacity-30 mix-blend-soft-light`} />
                            
                            {/* ZODIAC SYMBOL */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-5xl lg:text-6xl xl:text-7xl text-white font-bold drop-shadow-lg">
                                {zodiacData.symbol}
                              </span>
                            </div>
                            
                            {/* INNER GLOW */}
                            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                          </motion.div>
                        </motion.div>
                      </Link>

                      {/* ZODIAC NAME */}
                      <h3 className="mt-3 text-center text-base font-semibold text-slate-700"
                          style={{ fontFamily: 'Playfair Display, serif' }}>
                        {sign.name}
                      </h3>
                      
                      {/* DATES */}
                      <p className="text-xs text-slate-500 mt-1 text-center">
                        {zodiacData.dates}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

                 {/* EXPAND/COLLAPSE BUTTON */}
         {!loading && additionalZodiacSigns.length > 0 && (
           <motion.div
             className="text-center"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1, duration: 0.6 }}
           >
            <motion.button
              onClick={() => setShowAll(!showAll)}
              className="group bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center mx-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-2">
                {showAll ? 'Show Less Signs' : 'Show More Signs'}
              </span>
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: showAll ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
} 