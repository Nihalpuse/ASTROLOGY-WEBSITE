'use client';

import ZodiacPageTemplate from "@/app/components/ZodiacPageTemplate";

export default function LeoZodiacPage() {
  return (
    <ZodiacPageTemplate 
      zodiacSlug="leo"
      signKey="leo"
      theme={{
        gradient: 'from-red-50/30 via-white to-orange-50/40',
        glowColor: 'rgba(239, 68, 68, 0.15)',
        animationColor: 'rgba(239, 68, 68, 0.12)'
      }}
    />
  );
}
