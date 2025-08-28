'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalZodiacBanner from '../../../components/UniversalZodiacBanner';
import ZodiacInfoNavigation from '@/app/components/ZodiacInfoNavigation';
import SimpleHorizontalBanner from '../../../components/SimpleHorizontalBanner';
import ReusableProductGrid from '../../../components/ReusableProductGrid';

export default function GeminiZodiacPage() {
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
        <UniversalZodiacBanner signKey="gemini" />

        {/* HORIZONTAL DROPDOWN NAVIGATION */}
        <ZodiacInfoNavigation zodiacSign="gemini" />

        {/* MAIN CONTENT AREA - FULL WIDTH */}
        <motion.div 
          className="w-full bg-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-7xl mx-auto p-4 pt-8 sm:p-8 sm:pt-12 w-full">
            {/* Gemini Product Grid (replace with your gemini products) */}
            {/* Example: <ReusableProductGrid products={geminiProducts} columns={4} mobileColumns={2} gap="md" />; */}
          </div>
        </motion.div>



        {/* GLOBAL STYLES FOR REFINED GEMINI THEME */}
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