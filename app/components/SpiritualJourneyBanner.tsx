'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function SpiritualJourneyBanner() {
  return (
    <div className="w-full py-16 md:py-20" style={{ backgroundColor: '#FEFBF2' }}>
      <div className="w-full px-4 md:px-8">
        
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Image at top for mobile */}
            <div className="relative w-full h-[300px] md:h-[400px]">
              <Image
                src="/images/course-1.jpg"
                alt="Spiritual Journey Consultation"
                fill
                className="object-cover rounded-2xl"
                sizes="100vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl"></div>
            </div>

            {/* Content below image */}
            <div className="text-center space-y-6">
              {/* Top Badge */}
              <div className="inline-block">
                <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider bg-amber-100 px-4 py-2 rounded-full">
                  Transform Your Life Today
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Begin Your Sacred
                <span className="block text-amber-600">Spiritual Journey</span>
                <span className="block text-amber-600">with Us</span>
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Playfair Display, serif' }}>
                Connect with ancient wisdom and modern spirituality. Our dedicated team of spiritual guides and astrologers are here to support your journey towards inner peace, clarity, and divine connection.
              </p>

              {/* Features with checkmarks */}
              <div className="space-y-3 max-w-md mx-auto">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Sacred Rituals & Pujas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Divine Blessings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Spiritual Awakening</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">Life Transformation</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Link href="/signin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors duration-300"
                  >
                    Start Your Journey
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Section - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Top Badge */}
              <div className="inline-block">
                <span className="text-sm font-semibold text-amber-700 uppercase tracking-wider bg-amber-100 px-4 py-2 rounded-full">
                  Transform Your Life Today
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Begin Your Sacred
                <span className="block text-amber-600">Spiritual Journey</span>
                <span className="block text-amber-600">with Us</span>
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Connect with ancient wisdom and modern spirituality. Our dedicated team of spiritual guides and astrologers are here to support your journey towards inner peace, clarity, and divine connection.
              </p>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Sacred Rituals & Pujas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Divine Blessings</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Spiritual Awakening</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Life Transformation</span>
                </div>
              </div>

              {/* CTA Button for desktop */}
              <div className="pt-6">
                <Link href="/signin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors duration-300"
                  >
                    Start Your Journey
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right Section - Single Prominent Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden h-[500px]">
                <Image
                  src="/images/course-1.jpg"
                  alt="Spiritual Journey Consultation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="lazy"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 