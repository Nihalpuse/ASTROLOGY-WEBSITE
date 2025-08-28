'use client';

import ZodiacPageTemplate from '@/app/components/ZodiacPageTemplate';

export default function AquariusZodiacPage() {
  return (
    <ZodiacPageTemplate 
      zodiacSlug="aquarius"
      signKey="aquarius"
      theme={{
        gradient: 'from-orange-50/30 via-white to-yellow-50/40',
        glowColor: 'rgba(249, 115, 22, 0.15)',
        animationColor: 'rgba(249, 115, 22, 0.12)'
      }}
    />
  );
} 