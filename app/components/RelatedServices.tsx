"use client";

import React from 'react';
import Link from 'next/link';
import { services } from '@/data/services';
import ServiceShowcase from './ServiceShowcase';

interface RelatedServicesProps {
  currentServiceId: string;
  category?: string;
  title?: string;
  maxItems?: number;
  className?: string;
}

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images?: string[];
  category: string;
  rating: number;
  duration: string;
  consultationType: string;
}

const RelatedServices: React.FC<RelatedServicesProps> = ({
  currentServiceId,
  category,
  title = "Related Services",
  maxItems = 4,
  className = ""
}) => {
  // Get related services based on category or show random services
  const getRelatedServices = (): ServiceItem[] => {
    let filteredServices = services.filter(service => service.id !== currentServiceId);
    
    // If category is provided, filter by category first
    if (category) {
      const sameCategoryServices = filteredServices.filter(service => service.category === category);
      if (sameCategoryServices.length >= maxItems) {
        return sameCategoryServices.slice(0, maxItems);
      }
      // If not enough services in same category, include others
      filteredServices = [...sameCategoryServices, ...filteredServices.filter(service => service.category !== category)];
    }
    
    // Shuffle and return the required number
    const shuffled = filteredServices.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, maxItems);
  };

  const relatedServices = getRelatedServices();

  if (relatedServices.length === 0) {
    return null;
  }

  // Transform ServiceItem to the format expected by ServiceShowcase
  const showcaseServices = relatedServices.map(service => ({
    slug: service.slug,
    title: service.title,
    description: service.description,
    image: service.images?.[0] || '/images/placeholder.jpg',
    price: service.price,
    originalPrice: service.originalPrice,
    rating: service.rating,
    reviewsCount: Math.floor(Math.random() * 50) + 10, // Random review count
  }));

  return (
    <div className={className}>
      <ServiceShowcase
        services={showcaseServices}
        title={title}
        cardsPerView={maxItems}
        scrollStep={1}
      />
      
      {/* View All Services Link */}
      <div className="text-center mt-6">
        <Link 
          href="/services/all" 
          className="inline-flex items-center gap-2 bg-green-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-900 transition-colors"
        >
          View All Services
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default RelatedServices;
