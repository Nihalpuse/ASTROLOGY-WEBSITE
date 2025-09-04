'use client';

import UnlockCosmosBanner from './Hero/UnlockCosmosBanner';
import SpiritualTicker from './Hero/SpiritualTicker';
import ZodiacCategories from './ZodiacCategories';
import CelestialJourneyGrid from './Hero/CelestialJourneyGrid';
import { AstrologyPreloader } from './AstrologyPreloader';
import dynamic from "next/dynamic";

const CelestialJourneyMainGrid = dynamic(
  () => import("./Hero/CelestialJourneyMainGrid"),
  {
    loading: () => <AstrologyPreloader size="sm" message="Preparing celestial journey..." />,
    ssr: false,
  }
);

export default function NewHeroSection() {
  return (
    <>
      <UnlockCosmosBanner />
      <SpiritualTicker />
      <ZodiacCategories />
      
      <CelestialJourneyGrid />
      {/* Existing grid starts here */}
      <CelestialJourneyMainGrid />
    </>
  );
}