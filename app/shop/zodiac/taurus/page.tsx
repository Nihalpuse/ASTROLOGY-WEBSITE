'use client';

import ZodiacPageTemplate from '@/app/components/ZodiacPageTemplate';

export default function TaurusZodiacPage() {
  return (
    <ZodiacPageTemplate 
      zodiacSlug="taurus"
      signKey="taurus"
      theme={{
        gradient: 'from-green-50/30 via-white to-emerald-50/40',
        glowColor: 'rgba(34, 197, 94, 0.15)',
        animationColor: 'rgba(34, 197, 94, 0.12)'
      }}
    />
  );
}