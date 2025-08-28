'use client';

import ZodiacPageTemplate from '@/app/components/ZodiacPageTemplate';

export default function AriesZodiacPage() {
  return (
    <ZodiacPageTemplate 
      zodiacSlug="aries"
      signKey="aries"
      theme={{
        gradient: 'from-red-50/30 via-white to-orange-50/40',
        glowColor: 'rgba(239, 68, 68, 0.15)',
        animationColor: 'rgba(239, 68, 68, 0.12)'
      }}
    />
  );
} 