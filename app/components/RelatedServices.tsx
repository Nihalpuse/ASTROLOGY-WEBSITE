"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/data/services';

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

  // Calculate discount percentage
  const getDiscountPercentage = (service: ServiceItem) => {
    if (!service.originalPrice || service.originalPrice <= service.price) return null;
    return Math.round(((service.originalPrice - service.price) / service.price) * 100);
  };

  if (relatedServices.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`}>
      <h2 className="text-2xl font-bold text-[#23244a] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {relatedServices.map((service) => {
          const discount = getDiscountPercentage(service);
          const serviceImage = service.images?.[0] || '/images/placeholder.jpg';
          
          return (
            <Link 
              key={service.id} 
              href={`/services/${service.slug}`}
              className="group block"
            >
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-[#23244a] group-hover:scale-105">
                {/* Service Image */}
                <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={serviceImage}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                    {service.category}
                  </div>
                  {/* Discount Badge */}
                  {discount !== null && discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {discount}% OFF
                    </div>
                  )}
                </div>
                
                {/* Service Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-[#23244a] line-clamp-2 group-hover:text-[#77A656] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                  
                  {/* Service Details */}
                  <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      {service.duration}
                    </span>
                    <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded">
                      {service.consultationType}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-yellow-500">★</span>
                    <span className="text-gray-600">{service.rating}/5</span>
                  </div>
                  
                  {/* Pricing */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">₹{service.price}</span>
                      {service.originalPrice && service.originalPrice > service.price && (
                        <span className="text-sm text-gray-400 line-through">₹{service.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-blue-600 hover:text-blue-800 text-sm font-medium group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* View All Services Link */}
      <div className="text-center mt-6">
        <Link 
          href="/services/all" 
          className="inline-flex items-center gap-2 bg-[#23244a] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#77A656] transition-colors"
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
