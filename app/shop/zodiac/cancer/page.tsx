'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalZodiacBanner from '../../../components/UniversalZodiacBanner';
import ZodiacInfoNavigation from '@/app/components/ZodiacInfoNavigation';
import SimpleHorizontalBanner from '../../../components/SimpleHorizontalBanner';
import ReusableProductGrid from '../../../components/ReusableProductGrid';

export default function CancerZodiacPage() {
  const [isPageEntering, setIsPageEntering] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setIsPageEntering(false);
      setIsLoaded(true);
      document.body.style.overflow = 'auto';
    }, 100);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      {/* CINEMATIC PAGE ENTRANCE OVERLAY */}
      <AnimatePresence mode="wait">
        {isPageEntering && (
          <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-r from-red-100 via-white to-orange-100 shadow-2xl"
            initial={{ x: '-100vw' }}
            animate={{ x: 0 }}
            exit={{ x: '100vw' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          />
        )}
      </AnimatePresence>

      {/* MAIN PAGE CONTENT */}
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-yellow-50/40 overflow-x-hidden overflow-y-hidden"
        initial={{ opacity: 0 }}
        animate={isLoaded ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* UNIVERSAL ZODIAC BANNER */}
        <UniversalZodiacBanner signKey="cancer" />

        {/* HORIZONTAL DROPDOWN NAVIGATION */}
        <ZodiacInfoNavigation zodiacSign="cancer" />

        {/* MAIN CONTENT AREA - FULL WIDTH */}
        <motion.div 
          className="w-full bg-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-7xl mx-auto p-4 pt-8 sm:p-8 sm:pt-12 w-full">
            {/* Cancer Product Grid */}
            {(() => {
              const cancerProductsRaw = [
                {
                  id: 'moonstone-empathy-crystal',
                  title: 'Moonstone Empathy Crystal',
                  description: 'Enhances empathy and intuition',
                  price: '₹2,999',
                  originalPrice: '₹5,999',
                  slug: 'moonstone-empathy-crystal',
                  image: '/images/course-1.jpg',
                  category: 'Empathy Crystals',
                },
                {
                  id: 'rose-quartz-love-stone',
                  title: 'Rose Quartz Love Stone',
                  description: 'Promotes love and emotional healing',
                  price: '₹2,499',
                  originalPrice: '₹4,999',
                  slug: 'rose-quartz-love-stone',
                  image: '/images/course-2.jpg',
                  category: 'Love Stones',
                },
                {
                  id: 'pearl-calmness-gem',
                  title: 'Pearl Calmness Gem',
                  description: 'Brings calmness and serenity',
                  price: '₹3,199',
                  originalPrice: '₹6,399',
                  slug: 'pearl-calmness-gem',
                  image: '/images/course-3.jpg',
                  category: 'Calmness Gems',
                },
                {
                  id: 'opal-nurturing-crystal',
                  title: 'Opal Nurturing Crystal',
                  description: 'Supports nurturing and care',
                  price: '₹2,199',
                  originalPrice: '₹4,399',
                  slug: 'opal-nurturing-crystal',
                  image: '/images/course-4.jpg',
                  category: 'Nurturing Crystals',
                },
                {
                  id: 'aquamarine-peace-stone',
                  title: 'Aquamarine Peace Stone',
                  description: 'Promotes peace and tranquility',
                  price: '₹2,799',
                  originalPrice: '₹5,599',
                  slug: 'aquamarine-peace-stone',
                  image: '/images/course-5.jpg',
                  category: 'Peace Stones',
                },
                {
                  id: 'sodalite-communication-gem',
                  title: 'Sodalite Communication Gem',
                  description: 'Improves communication and understanding',
                  price: '₹1,999',
                  originalPrice: '₹3,999',
                  slug: 'sodalite-communication-gem',
                  image: '/images/course-6.jpg',
                  category: 'Communication Gems',
                },
                {
                  id: 'emerald-family-crystal',
                  title: 'Emerald Family Crystal',
                  description: 'Strengthens family bonds',
                  price: '₹2,899',
                  originalPrice: '₹5,799',
                  slug: 'emerald-family-crystal',
                  image: '/images/course-7.jpg',
                  category: 'Family Crystals',
                },
                {
                  id: 'cancer-protection-stone',
                  title: 'Cancer Protection Stone',
                  description: 'Provides protection and security',
                  price: '₹1,799',
                  originalPrice: '₹3,599',
                  slug: 'cancer-protection-stone',
                  image: '/images/course-8.jpg',
                  category: 'Protection Stones',
                },
              ];
              // Add random ratings and review counts
              const cancerProducts = cancerProductsRaw.map(product => ({
                ...product,
                rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5 to 5.0
                reviewCount: Math.floor(Math.random() * 200 + 20), // 20 to 220
              }));
              return <ReusableProductGrid products={cancerProducts} columns={4} mobileColumns={2} gap="md" />;
            })()}
          </div>
        </motion.div>

        {/* GLOBAL STYLES FOR REFINED CANCER THEME */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
          .font-serif {
            font-family: 'Playfair Display', serif;
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #fef3c7;
          }
          ::-webkit-scrollbar-thumb {
            background: #f59e0b;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #d97706;
          }
          * {
            scroll-behavior: smooth;
          }
          button:focus, a:focus {
            outline: 2px solid #f59e0b;
            outline-offset: 2px;
          }
        `}</style>
      </motion.div>
    </>
  );
} 