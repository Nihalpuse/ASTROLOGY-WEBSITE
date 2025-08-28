'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UniversalZodiacBanner from '../../../components/UniversalZodiacBanner';
import ZodiacInfoNavigation from '@/app/components/ZodiacInfoNavigation';
import ReusableProductGrid from '../../../components/ReusableProductGrid';
import SimpleHorizontalBanner from '../../../components/SimpleHorizontalBanner';

export default function AquariusZodiacPage() {
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
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
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
    <UniversalZodiacBanner signKey="aquarius" />

    {/* HORIZONTAL DROPDOWN NAVIGATION */}
    <ZodiacInfoNavigation zodiacSign="aquarius" />

    {/* MAIN CONTENT AREA - FULL WIDTH */}
    <motion.div 
      className="w-full bg-white"
      initial={{ opacity: 0, y: 30 }}
      animate={isLoaded ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="max-w-7xl mx-auto p-4 pt-8 sm:p-8 sm:pt-12 w-full">
        {/* Map Aquarius products to Product interface for ReusableProductGrid */}
        {(() => {
          const aquariusProductsRaw = [
            {
              id: 'amethyst-innovation-crystal',
              title: 'Amethyst Innovation Crystal',
              description: 'Enhances innovation and intuition',
              price: '₹3,999',
              originalPrice: '₹7,999',
              slug: 'amethyst-innovation-crystal',
              image: '/images/course-1.jpg',
              category: 'Innovation Crystals',
            },
            {
              id: 'aquamarine-vision-stone',
              title: 'Aquamarine Vision Stone',
              description: 'Promotes vision and clarity',
              price: '₹2,799',
              originalPrice: '₹5,599',
              slug: 'aquamarine-vision-stone',
              image: '/images/course-2.jpg',
              category: 'Vision Stones',
            },
            {
              id: 'clear-quartz-amplifier',
              title: 'Clear Quartz Amplifier',
              description: 'Amplifies energy and clarity',
              price: '₹3,299',
              originalPrice: '₹6,599',
              slug: 'clear-quartz-amplifier',
              image: '/images/course-3.jpg',
              category: 'Amplifier Crystals',
            },
            {
              id: 'fluorite-intelligence-crystal',
              title: 'Fluorite Intelligence Crystal',
              description: 'Boosts intelligence and focus',
              price: '₹2,199',
              originalPrice: '₹4,399',
              slug: 'fluorite-intelligence-crystal',
              image: '/images/course-4.jpg',
              category: 'Intelligence Crystals',
            },
            {
              id: 'labradorite-magic-stone',
              title: 'Labradorite Magic Stone',
              description: 'Enhances magic and intuition',
              price: '₹2,999',
              originalPrice: '₹5,999',
              slug: 'labradorite-magic-stone',
              image: '/images/course-5.jpg',
              category: 'Magic Stones',
            },
            {
              id: 'aquarius-originality-crystal',
              title: 'Aquarius Originality Crystal',
              description: 'Boosts originality and creativity',
              price: '₹1,899',
              originalPrice: '₹3,799',
              slug: 'aquarius-originality-crystal',
              image: '/images/course-6.jpg',
              category: 'Originality Crystals',
            },
            {
              id: 'sodalite-logic-stone',
              title: 'Sodalite Logic Stone',
              description: 'Enhances logic and reasoning',
              price: '₹2,499',
              originalPrice: '₹4,999',
              slug: 'sodalite-logic-stone',
              image: '/images/course-7.jpg',
              category: 'Logic Stones',
            },
            {
              id: 'celestite-communication-crystal',
              title: 'Celestite Communication Crystal',
              description: 'Improves communication skills',
              price: '₹1,799',
              originalPrice: '₹3,599',
              slug: 'celestite-communication-crystal',
              image: '/images/course-8.jpg',
              category: 'Communication Crystals',
            },
          ];
          // Add random ratings and review counts
          const aquariusProducts = aquariusProductsRaw.map(product => ({
            ...product,
            rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5 to 5.0, number
            reviewCount: Math.floor(Math.random() * 200 + 20), // 20 to 220
          }));
          return <ReusableProductGrid products={aquariusProducts} columns={4} mobileColumns={2} gap="md" />;
        })()}
      </div>
    </motion.div>

        {/* GLOBAL STYLES FOR REFINED AQUARIUS THEME */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600&display=swap');
          
          .aquarius-glow {
            box-shadow: 0 0 25px rgba(249, 115, 22, 0.15);
          }
          
          .aquarius-warm-animation {
            position: relative;
            overflow: hidden;
          }
          
          .aquarius-warm-animation::before {
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
          
          .uranus-energy-pulse {
            animation: uranusEnergy 4s ease-in-out infinite;
          }
          
          @keyframes uranusEnergy {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(249, 115, 22, 0.12);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 0 35px rgba(249, 115, 22, 0.25);
              transform: scale(1.008);
            }
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