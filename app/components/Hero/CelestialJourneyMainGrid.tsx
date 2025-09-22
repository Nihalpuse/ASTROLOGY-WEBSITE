"use client";
import React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function CelestialJourneyMainGrid() {
  return (
    <div className="max-w-[1440px] mx-auto w-full p-4">
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-4 gap-4 h-[576px] max-w-6xl mx-auto">
        
        {/* Left Tall Block - Full Height */}
        <div className="col-span-1 h-full relative">
          <Carousel
            opts={{ loop: true, align: "center", skipSnaps: false }}
            plugins={[Autoplay({ delay: 3500, stopOnInteraction: false })]}
            className="w-full h-full"
          >
            <CarouselContent className="h-[576px]">
              {[
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752494996/A_realistic_cosmic_calendar_illustration_showing_the_planets_of_the_solar_system_orbiting_around_the_sun_with_soft_lighting_galaxy_background_visible_constellations_moon_phases_and_astrological_zodiac_symbols_s_1_uxgzjk.jpg",
                "https://res.cloudinary.com/dxwspucxw/image/upload/c_crop,ar_9:16/v1753181211/bracelets_lqvtwk.png",
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042874/course-5_uvm6d2.jpg"
              ].map((img, i) => (
                <CarouselItem key={i} className="h-[576px]">
                  <div className="relative w-full h-[576px] rounded-lg overflow-hidden bg-pink-100 border border-gray-200">
                    <Image
                      src={img}
                      alt={`Left Block ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Static Glassmorphism CTA Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <button className="px-6 py-3 bg-black/70 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
              Shop
            </button>
          </div>
        </div>

        {/* Center Column - Contains Top and Bottom blocks */}
        <div className="col-span-2 h-full flex flex-col gap-4">
          
          {/* Center Top Block */}
          <div className="h-[400px] relative">
            <Carousel
              opts={{ loop: true, align: "center", skipSnaps: false }}
              plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
              className="w-full h-full"
            >
              <CarouselContent className="h-[400px]">
                {[
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042873/cosmiccalendar_v8ndoq.png",
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-2_ribcdu.jpg",
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/astrology_app_eoszbs.jpg",
                ].map((img, i) => (
                  <CarouselItem key={i} className="h-[400px]">
                    <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-yellow-400 border border-gray-200">
                      <Image
                        src={img}
                        alt={`Center Top ${i + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* Static Glassmorphism CTA Button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <button className="px-6 py-3 bg-black/70 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
                Chat
              </button>
            </div>
          </div>

          {/* Center Bottom Row - Two smaller blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[160px]">
            {/* Bottom Left Block */}
            <div className="h-full relative">
              <Carousel
                opts={{ loop: true, align: "center", skipSnaps: false }}
                plugins={[Autoplay({ delay: 3800, stopOnInteraction: false })]}
                className="w-full h-full"
              >
                <CarouselContent className="h-[160px]">
                  {[
                    "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042879/zodiac_decoder_aphuoz.avif",
                    "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/astrowellness_qltouz.jpg",
                    "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-1_lwqxsr.jpg",
                  ].map((img, i) => (
                    <CarouselItem key={i} className="h-[160px]">
                      <div className="relative w-full h-[160px] rounded-lg overflow-hidden bg-blue-100 border border-gray-200">
                        <Image
                          src={img}
                          alt={`Bottom Left ${i + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 20vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {/* Static Glassmorphism CTA Button */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                          <button className="px-4 py-2 bg-black/70 backdrop-blur-md border border-white/30 rounded-lg text-white font-medium text-sm shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
                            All Products
                          </button>
                        </div>
            </div>

            {/* Bottom Right Block */}
            <div className="h-full relative">
              <Carousel
                opts={{ loop: true, align: "center", skipSnaps: false }}
                plugins={[Autoplay({ delay: 4200, stopOnInteraction: false })]}
                className="w-full h-full"
              >
                <CarouselContent className="h-[160px]">
                  {[
                    "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042876/myth_h93fku.jpg",
                    "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-3_h9xwl3.jpg",
                  ].map((img, i) => (
                    <CarouselItem key={i} className="h-[160px]">
                      <div className="relative w-full h-[160px] rounded-lg overflow-hidden bg-green-100 border border-gray-200">
                        <Image
                          src={img}
                          alt={`Bottom Right ${i + 1}`}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 20vw"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
              {/* Static Glassmorphism CTA Button */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                          <button className="px-4 py-2 bg-black/70 backdrop-blur-md border border-white/30 rounded-lg text-white font-medium text-sm shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
                            All Services
                          </button>
                        </div>
            </div>
          </div>
        </div>

        {/* Right Tall Block - Full Height */}
        <div className="col-span-1 h-full relative">
          <Carousel
            opts={{ loop: true, align: "center", skipSnaps: false }}
            plugins={[Autoplay({ delay: 3200, stopOnInteraction: false })]}
            className="w-full h-full"
          >
            <CarouselContent className="h-[576px]">
              {[
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752497900/A_highly_realistic_image_of_a_calm_person_meditating_in_lotus_pose_on_a_flat_rock_bathed_in_soft_golden_sunrise_light._The_background_features_misty_hills_and_subtle_spiritual_symbols_like_chakra_icons_or_Om_sign_faint_zetsen.jpg",
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/gemstones_wztxzb.jpg",
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752049127/meditation_b2qe9b.jpg"
              ].map((img, i) => (
                <CarouselItem key={i} className="h-[576px]">
                  <div className="relative w-full h-[576px] rounded-lg overflow-hidden bg-pink-200 border border-gray-200">
                    <Image
                      src={img}
                      alt={`Right Block ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Static Glassmorphism CTA Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <button className="px-6 py-3 bg-black/70 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
              Service
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout - 3 Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Mobile Chat Card - Full Width */}
        <div className="h-[250px] relative">
          <Carousel
            opts={{ loop: true, align: "center", skipSnaps: false }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="w-full h-full"
          >
            <CarouselContent className="h-[250px]">
              {[
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042873/cosmiccalendar_v8ndoq.png",
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-2_ribcdu.jpg",
                "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/astrology_app_eoszbs.jpg",
              ].map((img, i) => (
                <CarouselItem key={i} className="h-[250px]">
                  <div className="relative w-full h-[250px] rounded-lg overflow-hidden bg-yellow-400 border border-gray-200">
                    <Image
                      src={img}
                      alt={`Mobile Chat ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="100vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Static Glassmorphism CTA Button */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <button className="px-6 py-3 bg-black/70 backdrop-blur-md border border-white/30 rounded-xl text-white font-semibold text-base shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
              Chat
            </button>
          </div>
        </div>

        {/* Mobile Bottom Grid - All Products & All Services */}
        <div className="grid grid-cols-2 gap-4">
          {/* All Products */}
          <div className="h-[180px] relative">
            <Carousel
              opts={{ loop: true, align: "center", skipSnaps: false }}
              plugins={[Autoplay({ delay: 3800, stopOnInteraction: false })]}
              className="w-full h-full"
            >
              <CarouselContent className="h-[180px]">
                {[
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042879/zodiac_decoder_aphuoz.avif",
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042871/astrowellness_qltouz.jpg",
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-1_lwqxsr.jpg",
                ].map((img, i) => (
                  <CarouselItem key={i} className="h-[180px]">
                    <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-blue-100 border border-gray-200">
                      <Image
                        src={img}
                        alt={`Mobile Products ${i + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="50vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* Static Glassmorphism CTA Button */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
              <button className="px-3 py-2 bg-black/70 backdrop-blur-md border border-white/30 rounded-lg text-white font-medium text-xs shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
                Products
              </button>
            </div>
          </div>

          {/* All Services */}
          <div className="h-[180px] relative">
            <Carousel
              opts={{ loop: true, align: "center", skipSnaps: false }}
              plugins={[Autoplay({ delay: 4200, stopOnInteraction: false })]}
              className="w-full h-full"
            >
              <CarouselContent className="h-[180px]">
                {[
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042876/myth_h93fku.jpg",
                  "https://res.cloudinary.com/dxwspucxw/image/upload/v1752042872/course-3_h9xwl3.jpg",
                ].map((img, i) => (
                  <CarouselItem key={i} className="h-[180px]">
                    <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-green-100 border border-gray-200">
                      <Image
                        src={img}
                        alt={`Mobile Services ${i + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="50vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* Static Glassmorphism CTA Button */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
              <button className="px-3 py-2 bg-black/70 backdrop-blur-md border border-white/30 rounded-lg text-white font-medium text-xs shadow-lg hover:bg-black/80 transition-all duration-300 hover:scale-105">
                Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}