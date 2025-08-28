'use client';

import ZodiacPageTemplate from '@/app/components/ZodiacPageTemplate';


export default function CapricornZodiacPage() {
  return (
    <ZodiacPageTemplate 
      zodiacSlug="capricorn"
      signKey="capricorn"
      theme={{
        gradient: 'from-teal-50/30 via-white to-emerald-50/40',
        glowColor: 'rgba(239, 68, 68, 0.15)',
        animationColor: 'rgba(239, 68, 68, 0.12)'
      }}
    />
  );
}