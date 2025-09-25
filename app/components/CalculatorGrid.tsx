'use client';

import React from "react";
import { CalculatorCard } from "./CalculatorCard";
import Image from "next/image";
import { useRouter } from "next/navigation";

const calculators = [
  {
    title: "Free Panchang",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/panchang.svg" alt="Panchang" width={200} height={200} className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/today-panchang",
  },
  {
    title: "Free Nakshatra",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/nakshatra.svg" alt="Nakshatra" width={200} height={200} className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/nakshatra-calculator",
  },
  {
    title: "Free Kundali Matching",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/kundalimaching.svg" alt="Kundali Matching" width={200} height={200} className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/kundli-matching",
  },
  {
    title: "Free Moon Sign",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/moonsign.svg" alt="Moon Sign" width={200} height={200} className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/moonsign-calculator",
  },
];

export const CalculatorGrid: React.FC = () => {
  const router = useRouter();

  const handleCardClick = (link: string | null) => {
    if (link) {
      router.push(link);
    }
  };

  return (
    <section className="py-6 sm:py-8 md:py-12">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1440px] px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="w-full rounded-2xl md:rounded-3xl py-6 sm:py-6 md:py-8 px-4 sm:px-6 md:px-16 mb-6 sm:mb-8 md:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-2 sm:mb-3 text-center drop-shadow-lg tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Free Calculators
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center max-w-3xl font-sans px-2" style={{ fontFamily: 'Open Sans, Arial, sans-serif', color: '#166534' }}>
              Access a variety of free astrology calculators.
            </p>
          </div>
          
          <div className="grid gap-3 sm:gap-5 md:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
            {calculators.map((calc, index) => (
              <CalculatorCard
                key={index}
                title={calc.title}
                description={calc.description}
                icon={calc.icon}
                onClick={() => handleCardClick(calc.link)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
