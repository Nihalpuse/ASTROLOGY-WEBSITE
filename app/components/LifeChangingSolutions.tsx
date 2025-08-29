'use client'

import { GraduationCap, Heart, Activity, Briefcase, Users, Baby, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useLanguage } from '../contexts/useLanguage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CTASection } from './CTASection'

const solutions = [
  {
    icon: <GraduationCap className="w-12 h-12 text-black" />,
    titleKey: "lifeChangingSolutions.solutions.0.title",
    href: "/services/career-guidance",
    descriptionKey: "lifeChangingSolutions.solutions.0.description",
    themeColor: '#e0e7ff', // Light blue
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-1_lwqxsr.jpg"
  },
  {
    icon: <Heart className="w-12 h-12 text-black" />,
    titleKey: "lifeChangingSolutions.solutions.1.title",
    href: "/services/love-relationship",
    descriptionKey: "lifeChangingSolutions.solutions.1.description",
    themeColor: '#ffe0e0', // Light red
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-2_ribcdu.jpg"
  },
  {
    icon: <Activity className="w-12 h-12 text-black" />,
    titleKey: "lifeChangingSolutions.solutions.2.title",
    href: "/services/health-astrology",
    descriptionKey: "lifeChangingSolutions.solutions.2.description",
    themeColor: '#e6ffe0', // Light green
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-3_h9xwl3.jpg"
  },
  {
    icon: <Briefcase className="w-12 h-12 text-black" />,
    titleKey: "lifeChangingSolutions.solutions.3.title",
    href: "/services/business-astrology",
    descriptionKey: "lifeChangingSolutions.solutions.3.description",
    themeColor: '#fff5e0', // Light orange
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042873/course-4_vkpzzg.jpg"
  },
  {
    icon: <Users className="w-12 h-12 text-black" />,
    titleKey: "lifeChangingSolutions.solutions.4.title",
    href: "/kundali-matching",
    descriptionKey: "lifeChangingSolutions.solutions.4.description",
    themeColor: '#e0e0ff', // Light purple
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042874/course-5_uvm6d2.jpg"
  },
  {
    icon: <Baby className="w-12 h-12 text-black" />,
    titleKey: "lifeChangingSolutions.solutions.5.title",
    href: "/services/child-astrology",
    descriptionKey: "lifeChangingSolutions.solutions.5.description",
    themeColor: '#e0ffea', // Light aqua
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1752047576/course-6_mpzxwv.jpg"
  }
]

// Helper function for safe language access
function getLocalizedText(obj: { en: string; hi: string }, lang: string) {
  return obj[lang as keyof typeof obj] ?? obj['en'];
}

export function LifeChangingSolutions() {
  const { t } = useLanguage();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isMobile = window.innerWidth < 768; // md breakpoint

      // More sensitive threshold for tablet to allow scrolling when even 1 card is partially hidden
      const threshold = isMobile ? 1 : 50; // 50px threshold for tablet, 1px for mobile

      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Responsive scroll distance: mobile shows ~2 cards, tablet shows ~4 cards
      const isMobile = window.innerWidth < 768; // md breakpoint
      const scrollDistance = isMobile
        ? scrollContainerRef.current.clientWidth / 2  // Scroll by half width on mobile
        : scrollContainerRef.current.clientWidth / 3; // Scroll by third width on tablet
      scrollContainerRef.current.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Responsive scroll distance: mobile shows ~2 cards, tablet shows ~4 cards
      const isMobile = window.innerWidth < 768; // md breakpoint
      const scrollDistance = isMobile
        ? scrollContainerRef.current.clientWidth / 2  // Scroll by half width on mobile
        : scrollContainerRef.current.clientWidth / 3; // Scroll by third width on tablet
      scrollContainerRef.current.scrollBy({ left: scrollDistance, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, []);

  const scrollToContact = () => {
    router.push('/contact');
  };

  return (
    <section className="py-16 bg-white text-black font-sans">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Banner Section */}
        <div className="w-full rounded-3xl py-10 px-4 md:px-16 mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-black mb-4 text-center drop-shadow-lg tracking-tight">
            {t('lifeChangingSolutions.bannerTitle')}
          </h2>
          <p className="text-lg md:text-2xl text-center max-w-2xl" style={{ color: '#166534' }}>
            {t('lifeChangingSolutions.bannerDescription')}
          </p>
        </div>
        {/* Main Solutions Section */}
        <div className="mb-12">
          {/* Desktop View - Grid */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Link href={solution.href} key={index} className="block h-full">
                <motion.div
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 h-full flex flex-col"
                  whileHover={{ scale: 1.05, y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98, rotate: 0 }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`relative h-48 w-full ` + (solution.themeColor ? `bg-[${solution.themeColor}]` : 'bg-gray-200')}>
                    <Image
                      src={solution.imageUrl}
                      alt={t(solution.titleKey)}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-extrabold mb-2 text-black">{t(solution.titleKey)}</h3>
                    <p className="text-base text-black mb-4 leading-tight tracking-wide font-serif flex-grow">
                      {t(solution.descriptionKey)}
                    </p>
                  </CardContent>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Mobile/Tablet View - Horizontal Scroll */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-32 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-opacity ${canScrollLeft ? 'opacity-100 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                  }`}
                style={{ marginLeft: '-20px' }}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 top-32 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-opacity ${canScrollRight ? 'opacity-100 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                  }`}
                style={{ marginRight: '-20px' }}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollButtons}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-2"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {solutions.map((solution, index) => (
                  <div
                    key={`mobile-${index}`}
                    className="flex-none w-[calc(52%-6px)] md:w-[calc(26%-9px)] min-w-[170px] md:min-w-[190px] snap-start"
                  >
                    <Link href={solution.href} className="block h-full">
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[300px] flex flex-col">
                        <div className="relative w-full h-32 flex-shrink-0">
                          <Image
                            src={solution.imageUrl}
                            alt={t(solution.titleKey)}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                            {t(solution.titleKey)}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3 line-clamp-4 flex-1 leading-relaxed">
                            {t(solution.descriptionKey)}
                          </p>
                          <div className="mt-auto">
                            <Button className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs font-semibold text-center hover:bg-gray-800 transition-all">
                              {t('lifeChangingSolutions.exploreMoreButton')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Explore More Astrological Insights Section */}
        <div>
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-black">{t('lifeChangingSolutions.exploreMoreTitle')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* Continue Learning Content Card */}
            <motion.div
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105 h-full min-h-[400px] md:min-h-[450px]"
              whileHover={{ scale: 1.05, y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.98, rotate: 0 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative h-48 md:h-52 w-full bg-gray-200 flex-shrink-0">
                <Image
                  src="https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/continue-learning_mtpgqr.jpg"
                  alt={t('lifeChangingSolutions.continueLearningAlt')}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <CardContent className="p-4 md:p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-lg md:text-lg font-bold mb-3 text-black leading-tight">{t('lifeChangingSolutions.continueLearningTitle')}</h3>
                  <p className="text-sm md:text-sm text-gray-700 mb-4 leading-relaxed tracking-wide font-serif">
                    {t('lifeChangingSolutions.continueLearningDescription')}
                    <br />
                    Explore guides on birth charts, planetary influences, and practical remedies.
                    <br />
                    Access exclusive articles, video lessons, and tools to help you unlock the wisdom of the stars.
                  </p>
                </div>
                <div className="flex items-end flex-1 pt-2">
                  <Link href="/study" passHref>
                    <button
                      className="bg-black text-white font-semibold py-2 md:py-2.5 px-6 md:px-7 rounded-full shadow-lg hover:bg-gray-800 border border-[#E0E0E0] transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      {t('lifeChangingSolutions.exploreMoreButton')}
                    </button>
                  </Link>
                </div>
              </CardContent>
            </motion.div>

            {/* CTA Section Card (replaces Book Your Call Now!) */}
            <div className="flex items-stretch w-full h-full min-h-[400px] md:min-h-[450px]"><CTASection /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
