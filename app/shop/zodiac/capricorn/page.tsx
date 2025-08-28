'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalZodiacBanner from '../../../components/UniversalZodiacBanner';
import ZodiacInfoNavigation from '@/app/components/ZodiacInfoNavigation';
import ReusableProductGrid from '../../../components/ReusableProductGrid';
import SimpleHorizontalBanner from '../../../components/SimpleHorizontalBanner';

export default function CapricornZodiacPage() {
  const [isPageEntering, setIsPageEntering] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // PAGE ENTRANCE EFFECT
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
        <UniversalZodiacBanner signKey="capricorn" />

        {/* HORIZONTAL DROPDOWN NAVIGATION */}
        <ZodiacInfoNavigation zodiacSign="capricorn" />

        {/* MAIN CONTENT AREA - FULL WIDTH */}
        <motion.div 
          className="w-full bg-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-7xl mx-auto p-4 pt-8 sm:p-8 sm:pt-12 w-full">
            {/* Capricorn Product Grid (replace with your capricorn products) */}
            {/* Example: <ReusableProductGrid products={capricornProducts} columns={4} mobileColumns={2} gap="md" />; */}
          </div>
        </motion.div>




        {/* GLOBAL STYLES FOR REFINED CAPRICORN THEME */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600&display=swap');
          
          .capricorn-glow {
            box-shadow: 0 0 25px rgba(249, 115, 22, 0.15);
          }
          
          .capricorn-warm-animation {
            position: relative;
            overflow: hidden;
          }
          
          .capricorn-warm-animation::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%);
            animation: warmGlow 6s ease-in-out infinite alternate;
          }
          
          @keyframes warmGlow {
            0% { transform: scale(0.95) rotate(0deg); opacity: 0.3; }
            100% { transform: scale(1.05) rotate(180deg); opacity: 0.6; }
          }
          
          .saturn-energy-pulse {
            animation: saturnEnergy 4s ease-in-out infinite;
          }
          
          @keyframes saturnEnergy {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(249, 115, 22, 0.12);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 0 35px rgba(249, 115, 22, 0.25);
              transform: scale(1.008);
            }
          }
          
          /* Custom scrollbar for warm Capricorn theme */
          ::-webkit-scrollbar {
            width: 10px;
          }
          
          ::-webkit-scrollbar-track {
            background: #fff7ed;
            border-radius: 6px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #f97316, #fbbf24);
            border-radius: 6px;
            border: 2px solid #fff7ed;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #ea580c, #f59e0b);
          }
          
          /* Rich typography and sophisticated styling */
          .font-serif {
            font-family: 'Playfair Display', serif;
          }
          
          .backdrop-blur-glass {
            background: rgba(255, 255, 255, 0.90);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(249, 115, 22, 0.08);
          }
          
          .warm-gradient {
            background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
          }
          
          .text-shadow-soft {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
        `}</style>
      </motion.div>
    </>
  );
} 