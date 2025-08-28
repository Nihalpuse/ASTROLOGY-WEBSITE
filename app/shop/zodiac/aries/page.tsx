'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalZodiacBanner from '../../../components/UniversalZodiacBanner';
import ZodiacInfoNavigation from '@/app/components/ZodiacInfoNavigation';

import SimpleHorizontalBanner from '../../../components/SimpleHorizontalBanner';
import ReusableProductGrid from '../../../components/ReusableProductGrid';

export default function AriesZodiacPage() {
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
        <UniversalZodiacBanner signKey="aries" />

        {/* HORIZONTAL DROPDOWN NAVIGATION */}
        <ZodiacInfoNavigation zodiacSign="aries" />

        {/* MAIN CONTENT AREA - FULL WIDTH */}
        <motion.div 
          className="w-full bg-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="max-w-7xl mx-auto p-4 pt-8 sm:p-8 sm:pt-12 w-full">
            {/* Aries Product Grid */}
            {(() => {
              const ariesProductsRaw = [
                {
                  id: 'red-jasper-courage-stone',
                  title: 'Red Jasper Courage Stone',
                  description: 'Boosts courage and determination',
                  price: '₹2,499',
                  originalPrice: '₹4,999',
                  slug: 'red-jasper-courage-stone',
                  image: '/images/course-1.jpg',
                  category: 'Courage Stones',
                },
                {
                  id: 'carnelian-energy-crystal',
                  title: 'Carnelian Energy Crystal',
                  description: 'Enhances energy and motivation',
                  price: '₹2,799',
                  originalPrice: '₹5,599',
                  slug: 'carnelian-energy-crystal',
                  image: '/images/course-2.jpg',
                  category: 'Energy Crystals',
                },
                {
                  id: 'bloodstone-action-gem',
                  title: 'Bloodstone Action Gem',
                  description: 'Promotes action and vitality',
                  price: '₹3,299',
                  originalPrice: '₹6,599',
                  slug: 'bloodstone-action-gem',
                  image: '/images/course-3.jpg',
                  category: 'Action Gems',
                },
                {
                  id: 'garnet-passion-stone',
                  title: 'Garnet Passion Stone',
                  description: 'Ignites passion and confidence',
                  price: '₹2,199',
                  originalPrice: '₹4,399',
                  slug: 'garnet-passion-stone',
                  image: '/images/course-4.jpg',
                  category: 'Passion Stones',
                },
                {
                  id: 'pyrite-success-crystal',
                  title: 'Pyrite Success Crystal',
                  description: 'Attracts success and abundance',
                  price: '₹2,999',
                  originalPrice: '₹5,999',
                  slug: 'pyrite-success-crystal',
                  image: '/images/course-5.jpg',
                  category: 'Success Crystals',
                },
                {
                  id: 'clear-quartz-focus-gem',
                  title: 'Clear Quartz Focus Gem',
                  description: 'Improves focus and clarity',
                  price: '₹1,899',
                  originalPrice: '₹3,799',
                  slug: 'clear-quartz-focus-gem',
                  image: '/images/course-6.jpg',
                  category: 'Focus Gems',
                },
                {
                  id: 'hematite-grounding-stone',
                  title: 'Hematite Grounding Stone',
                  description: 'Provides grounding and protection',
                  price: '₹2,499',
                  originalPrice: '₹4,999',
                  slug: 'hematite-grounding-stone',
                  image: '/images/course-7.jpg',
                  category: 'Grounding Stones',
                },
                {
                  id: 'citrine-optimism-crystal',
                  title: 'Citrine Optimism Crystal',
                  description: 'Inspires optimism and joy',
                  price: '₹1,799',
                  originalPrice: '₹3,599',
                  slug: 'citrine-optimism-crystal',
                  image: '/images/course-8.jpg',
                  category: 'Optimism Crystals',
                },
              ];
              // Add random ratings and review counts
              const ariesProducts = ariesProductsRaw.map(product => ({
                ...product,
                rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5 to 5.0
                reviewCount: Math.floor(Math.random() * 200 + 20), // 20 to 220
              }));
              return <ReusableProductGrid products={ariesProducts} columns={4} mobileColumns={2} gap="md" />;
            })()}
          </div>
        </motion.div>

        {/* GLOBAL STYLES FOR REFINED ARIES THEME */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600&display=swap');
          
          .aries-glow {
            box-shadow: 0 0 25px rgba(249, 115, 22, 0.15);
          }
          
          .aries-warm-animation {
            position: relative;
            overflow: hidden;
          }
          
          .aries-warm-animation::before {
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
          
          .mars-energy-pulse {
            animation: marsEnergy 4s ease-in-out infinite;
          }
          
          @keyframes marsEnergy {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(249, 115, 22, 0.12);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 0 35px rgba(249, 115, 22, 0.25);
              transform: scale(1.008);
            }
          }
          
          /* Custom scrollbar for warm Aries theme */
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