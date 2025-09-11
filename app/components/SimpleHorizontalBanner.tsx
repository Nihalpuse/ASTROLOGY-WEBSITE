'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

const SimpleHorizontalBanner = () => {
  // ANIMATION STATE: posterIndex for current slide
  const [posterIndex, setPosterIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // FULL POSTER DATA - HORIZONTAL WIDE IMAGES
  const posterData = [
    {
      id: 1,
      title: 'Shop Cosmic Essentials',
      subtitle: 'Handpicked crystals, tools & guides for every sign',
      image: 'https://res.cloudinary.com/dxwspucxw/image/upload/v1757489039/ShopBanner_qa6r5g.jpg',
      link: '/shop/all-products',
      direction: 'rightToLeft'
    },
    {
      id: 2,
      title: 'Explore Astrology Services',
      subtitle: 'Readings, consultations & personalized guidance',
      image: 'https://res.cloudinary.com/dxwspucxw/image/upload/v1757489039/ServicesBanner_gosbnf.jpg',
      link: '/services/all',
      direction: 'rightToLeft'
    },
    {
      id: 3,
      title: 'Talk to Astrologer',
      subtitle: 'Discover Your Path',
      image: 'https://res.cloudinary.com/dxwspucxw/image/upload/v1753172470/Talk_to_Astrologer_ao8rzb.png',
      link: 'talk-to-astrologer',
      direction: 'rightToLeft'
    }
  ];

  // AUTOPLAY ANIMATION CONTROLLER
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPosterIndex((prev) => (prev + 1) % posterData.length);
      setAnimationKey((prev) => prev + 1);
    }, 3500); // 3.5 seconds per slide
    return () => clearInterval(interval);
  }, [isPaused, posterData.length]);

  // POSTER ANIMATIONS
  const posterVariants = {
    rightToLeftEnter: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
    },
    rightToLeftExit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    },
    leftToRightEnter: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
    },
    leftToRightExit: {
      x: '100%',
      opacity: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <div
      className="w-screen bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 overflow-hidden relative"
      style={{
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        maxWidth: '100vw'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[300px] md:h-[450px] w-full">
  <AnimatePresence mode="sync">
          <motion.div
            key={`poster-${posterIndex}-${animationKey}`}
            className="absolute inset-0 w-full h-full px-2"
            initial={{
              x: posterData[posterIndex].direction === 'rightToLeft' ? '100%' : '-100%',
              opacity: 0
            }}
            animate={
              posterData[posterIndex].direction === 'rightToLeft'
                ? posterVariants.rightToLeftEnter
                : posterVariants.leftToRightEnter
            }
            exit={
              posterData[posterIndex].direction === 'rightToLeft'
                ? posterVariants.rightToLeftExit
                : posterVariants.leftToRightExit
            }
          >
            <div className="relative w-full h-full bg-white rounded-xl shadow-lg overflow-hidden">
              <Link href={posterData[posterIndex].link} className="block w-full h-full">
                <div className="relative w-full h-full group cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform duration-300 bg-gray-100">
                  <Image
                    src={posterData[posterIndex].image}
                    alt={posterData[posterIndex].title}
                    fill
                    className="object-cover z-0"
                    sizes="100vw"
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="text-center text-white px-2 md:px-0">
                      <h1 className="text-2xl md:text-6xl font-bold mb-4 animate-in slide-in-from-bottom-4 duration-500 delay-300">
                        {posterData[posterIndex].title}
                      </h1>
                      <p className="text-base md:text-2xl opacity-90 mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-500">
                        {posterData[posterIndex].subtitle}
                      </p>
                      {posterData[posterIndex].title !== 'Talk to Astrologer' && (
                        <button
                          className="bg-white/20 backdrop-blur-sm text-white px-6 md:px-8 py-2 md:py-4 rounded-lg font-semibold hover:bg-white/30 hover:scale-105 active:scale-95 transition-all text-base md:text-lg pointer-events-none animate-in slide-in-from-bottom-4 duration-500 delay-700"
                        >
                          Explore Collection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SimpleHorizontalBanner;