'use client';

import React from "react";
import { CalculatorCard } from "./CalculatorCard";
import Image from "next/image";
import { useRouter } from "next/navigation";

const calculators = [
  {
    title: "Free Panchang",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/panchang.svg" alt="Panchang" width={200} height={200} className="w-40 h-40 md:w-52 md:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/today-panchang",
  },
  {
    title: "Free Nakshatra",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/nakshatra.svg" alt="Nakshatra" width={200} height={200} className="w-40 h-40 md:w-52 md:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/nakshatra-calculator",
  },
  {
    title: "Free Kundali Matching",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/kundalimaching.svg" alt="Kundali Matching" width={200} height={200} className="w-40 h-40 md:w-52 md:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
    link: "/freecalculators/kundli-matching",
  },
  {
    title: "Free Moon Sign",
    description: "With Horoscope, Kundali, And Predictions",
    icon: <Image src="/images/FreeCalculators/moonsign.svg" alt="Moon Sign" width={200} height={200} className="w-40 h-40 md:w-52 md:h-52" style={{ filter: 'hue-rotate(20deg) saturate(150%) brightness(120%) contrast(110%)' }} />,
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
    <section className="py-8 md:py-12">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[1440px] px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="w-full rounded-2xl md:rounded-3xl py-6 md:py-8 px-4 md:px-16 mb-8 md:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold text-black mb-3 text-center drop-shadow-lg tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Free Calculators
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center max-w-3xl font-sans px-2" style={{ fontFamily: 'Open Sans, Arial, sans-serif', color: '#166534' }}>
              Access a variety of free astrology calculators.
            </p>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
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
