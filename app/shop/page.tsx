'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useProducts } from '../../hooks/useProducts';

const ProductOfTheDay = dynamic(() => import('../components/ProductOfTheDay'), { loading: () => <div>Loading...</div>, ssr: false });
const CelestialJourneyMainGrid = dynamic(() => import('../components/Hero/CelestialJourneyMainGrid'), { loading: () => <div>Loading...</div>, ssr: false });
const ShopCategoriesMinimal = dynamic(() => import('../components/ShopCategoriesMinimal'), { loading: () => <div>Loading...</div>, ssr: false });
const NakshatraTicker = dynamic(() => import('../components/NakshatraTicker'), { loading: () => <div>Loading...</div>, ssr: false });
const ShopBanner = dynamic(() => import('../components/ShopBanner'), { loading: () => <div>Loading...</div>, ssr: false });
const ZodiacCategories = dynamic(() => import('../components/ZodiacCategories'), { loading: () => <div>Loading...</div>, ssr: false });
const SimpleHorizontalBanner = dynamic(() => import('../components/SimpleHorizontalBanner'), { loading: () => <div>Loading...</div>, ssr: false });
const ProductAnnouncementTicker = dynamic(() => import('../components/ProductAnnouncementTicker'), { loading: () => <div>Loading...</div>, ssr: false });
const ProductShowcase = dynamic(() => import('../components/ProductShowcase'), { loading: () => <div>Loading...</div>, ssr: false });
const ProductAssuranceBar = dynamic(() => import('../components/ProductAssuranceBar'), { loading: () => <div>Loading...</div>, ssr: false });
const NakshatraGyaanBanner = dynamic(() => import('../components/NakshatraGyaanBanner'), { loading: () => <div>Loading...</div>, ssr: false });
const SpiritualJourneyBanner = dynamic(() => import('../components/SpiritualJourneyBanner'), { loading: () => <div>Loading...</div>, ssr: false });


export default function ShopPage() {
  const { products, loading, error } = useProducts(8);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.shop-purpose-card').forEach(card => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ShopBanner />
      {/* NakshatraTicker - Moved right after banner for better flow */}
      <NakshatraTicker />
      {/* Zodiac Categories - ALL 12 ZODIAC SIGNS */}
      <ZodiacCategories />
      {/* CelestialJourneyMainGrid Section */}
      <CelestialJourneyMainGrid />
      
      {/* Nakshatra Gyaan Banner */}
      {/* <NakshatraGyaanBanner /> */}
      
      {/* Shop Categories Minimal - CINEMATIC VERSION */}
      <ShopCategoriesMinimal />
      
      {/* Simple Horizontal Banner - 3 GRID LAYOUT AFTER SACRED CATEGORIES */}
      <SimpleHorizontalBanner />

      {/* Product Announcements Ticker - RIGHT AFTER BANNER */}
      <ProductAnnouncementTicker />

      {/* Product Assurance Bar - AFTER SHOP BY AUDIENCE */}
      <ProductAssuranceBar />

      {/* Existing Content */}
      
        <div className="container mx-auto px-4 relative z-10">
          {/* Main Page Heading */}
          {/* Removed duplicate <h1>Spiritual Shop</h1> here */}
          {/* Full-width Product Carousel (dynamically imported) */}
          {/* New Best Seller Cards with RecentPosts Layout */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : (
            <ProductShowcase 
              products={products.map(product => ({
                id: product.id,
                title: product.name,
                description: product.description,
                price: `₹${product.price}`,
                originalPrice: product.original_price ? `₹${product.original_price}` : undefined,
                slug: product.slug,
                image: product.product_media.length > 0 
                  ? (product.product_media[0].media_url || product.product_media[0].url || '/images/placeholder.jpg')
                  : '/images/placeholder.jpg',
                category: product.category?.name,
                rating: 4.5,
                reviewCount: 50,
                inStock: product.product_stock.length > 0 ? product.product_stock[0].quantity > 0 : true,
                isNew: true,
                isFeatured: true
              }))}
              title="Best Selling Products" 
              subtitle="Explore our most loved and trusted spiritual items"
              cardsPerView={5}
              scrollStep={1}
            />
          )}
          {/* <FeaturedProducts /> */}
          {/* Product Of The Day Section */}
          <ProductOfTheDay />
          {/* Astrologer Profile, Statistics, Testimonials */}
          
          {/* Spiritual Journey Banner */}
          <SpiritualJourneyBanner />

          <style jsx global>{`
            .shop-purpose-card {
              opacity: 0;
              transform: translateY(40px);
              animation: shopPurposeFadeIn 0.7s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            }
            .shop-purpose-card:nth-child(1) { animation-delay: 0.05s; }
            .shop-purpose-card:nth-child(2) { animation-delay: 0.15s; }
            .shop-purpose-card:nth-child(3) { animation-delay: 0.25s; }
            .shop-purpose-card:nth-child(4) { animation-delay: 0.35s; }
            .shop-purpose-card:nth-child(5) { animation-delay: 0.45s; }
            .shop-purpose-card:nth-child(6) { animation-delay: 0.55s; }
            @keyframes shopPurposeFadeIn {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {/* AstrologyStones */}
          {/* <AstrologyStones /> */}
        </div>
     
    </div>
  )
}