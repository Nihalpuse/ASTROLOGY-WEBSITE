'use client';

import ZodiacPageTemplate from '@/app/components/ZodiacPageTemplate';

export default function GeminiZodiacPage() {
  return (
    <ZodiacPageTemplate 
      zodiacSlug="gemini"
      signKey="gemini"
      theme={{
        gradient: 'from-yellow-50/30 via-white to-amber-50/40',
        glowColor: 'rgba(245, 158, 11, 0.15)',
        animationColor: 'rgba(245, 158, 11, 0.12)'
      }}
    />
  );
} 