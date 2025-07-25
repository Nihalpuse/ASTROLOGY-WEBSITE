"use client";
import { AnimatedStars } from '../components/AnimatedStars'
import { MysticBackground } from '../components/MysticBackground'
import { CTASection } from '../components/CTASection'
import ShopBanner from '../components/ShopBanner'
import NakshatraTicker from '../components/NakshatraTicker'
import SpiritualJourneyBanner from '../components/SpiritualJourneyBanner'

import { UniversalServicesGrid } from '../components/UniversalServiceGrid';
export default function ServicesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 -mt-4">
      <AnimatedStars />
      <MysticBackground>
      
      {/* SHOP BANNER AT THE TOP */}
      <ShopBanner />
      
      {/* NAKSHATRA TICKER */}
      <NakshatraTicker />
      
      <div className="container mx-auto pt-8 px-4 pb-16 relative z-10">
        <h1
          className="text-5xl md:text-7xl mb-2 text-center font-normal text-black"
          style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, letterSpacing: '0.01em', marginTop: '0px' }}
        >
          Our Spiritual Services
        </h1>
        <p
          className="text-xl text-center mb-10 max-w-3xl mx-auto"
          style={{ color: '#232323', fontFamily: 'Playfair Display, serif', fontWeight: 400, letterSpacing: '0.01em' }}
        >
          Embark on a transformative journey with our comprehensive range of spiritual services. Let our expert astrologers and spiritual guides illuminate your path to self-discovery and enlightenment.
        </p>

      
        <UniversalServicesGrid />
        
        <div className="mt-16">
          <CTASection />
        </div>
      </div>

      {/* Spiritual Journey Banner */}
      <SpiritualJourneyBanner />
        </MysticBackground>
    </div>
  )
}
