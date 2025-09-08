'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Calendar, Video, Phone, MessageCircle } from 'lucide-react';
import { UniversalCartButton } from '@/app/components/UniversalCartButton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Service {
  id: string;
  title: string;
  shortDescription?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  slug: string;
  duration?: string;
  consultationType?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  reviewsCount?: number;
  ordersCount?: number;
  features?: string[];
  images?: string[];
  icon?: React.ReactNode;
  isPopular?: boolean;
  isNew?: boolean;
  availability?: 'available' | 'busy' | 'offline';
  nextAvailableSlot?: string;
}

interface ReusableServiceCardProps {
  service: Service;
  viewMode?: 'grid' | 'list';
  showQuickActions?: boolean;
  showBookmark?: boolean;
  showCompare?: boolean;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  onBookmarkClick?: (service: Service) => void;
  onCompareClick?: (service: Service) => void;
  onQuickViewClick?: (service: Service) => void;
}

// Helper function to get discount percentage
const getDiscountPercentage = (price: number, originalPrice?: number): number => {
  if (!originalPrice) return 0;
  return originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
};

// Helper function to get consultation type icon and color
const getConsultationIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'video call':
    case 'video/audio call':
      return { icon: <Video className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700' };
    case 'phone call':
    case 'audio call':
    case 'voice call':
      return { icon: <Phone className="w-3 h-3" />, color: 'bg-green-100 text-green-700' };
    case 'chat':
    case 'text chat':
      return { icon: <MessageCircle className="w-3 h-3" />, color: 'bg-purple-100 text-purple-700' };
    case 'in-person':
      return { icon: <Users className="w-3 h-3" />, color: 'bg-orange-100 text-orange-700' };
    default:
      return { icon: <Video className="w-3 h-3" />, color: 'bg-blue-100 text-blue-700' };
  }
};

// Helper function to get availability color
const getAvailabilityColor = (availability?: string) => {
  switch (availability) {
    case 'available':
      return 'bg-green-500';
    case 'busy':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-red-500';
    default:
      return 'bg-green-500';
  }
};

export const ReusableServiceCard = ({
  service,
  viewMode = 'grid',
  showQuickActions = true,
  showBookmark = true,
  showCompare = false,
  className,
  imageClassName,
  priority = false,
  onBookmarkClick,
  onCompareClick,
  onQuickViewClick,
}: ReusableServiceCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const discount = getDiscountPercentage(service.price, service.originalPrice);
  const mainImage = service.images?.[0] || '/images/placeholder.jpg';

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
            <Link href={`/services/${service.slug}`}>
              <Image
                src={mainImage}
                alt={service.title}
                fill
                className={cn(
                  "object-cover group-hover:scale-105 transition-transform duration-300",
                  imageClassName
                )}
                priority={priority}
                onLoadingComplete={() => setImageLoading(false)}
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
            </Link>
            
            {/* Service Type Badge */}
            {service.consultationType && (
              <div className="absolute top-3 right-3">
                <Badge 
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border-0 shadow-sm",
                    getConsultationIcon(service.consultationType).color
                  )}
                >
                  {getConsultationIcon(service.consultationType).icon}
                  <span className="font-semibold">{service.consultationType}</span>
                </Badge>
              </div>
            )}

            {/* Popular/New Badge */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {service.isPopular && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  ⭐ Popular
                </Badge>
              )}
              {service.isNew && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  ✨ New
                </Badge>
              )}
            </div>

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="destructive" className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  {discount}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <Link href={`/services/${service.slug}`}>
                  <h3 className="font-bold text-xl text-gray-900 line-clamp-2 hover:text-green-700 transition-colors leading-tight">
                    {service.title}
                  </h3>
                </Link>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {service.description}
              </p>

              {/* Service Info */}
              <div className="flex items-center gap-6">
                {/* Duration */}
                {service.duration && (
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{service.duration}</span>
                  </div>
                )}
                
                {/* Availability */}
                {service.availability && (
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", getAvailabilityColor(service.availability))} />
                    <span className="text-sm font-medium text-gray-700">
                      {service.availability === 'available' ? 'Available Now' : 
                       service.availability === 'busy' ? 'Busy' : 'Offline'}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {service.rating ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < Math.floor(service.rating!) 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900">{service.rating}</span>
                    {service.reviewsCount && (
                      <span className="text-sm text-gray-500">({service.reviewsCount} reviews)</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Star className="w-4 h-4 text-gray-300" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between pt-0 border-t border-gray-100 mt-1">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
                {service.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{service.originalPrice}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-0.5">
                <UniversalCartButton
                  productId={service.id}
                  productName={service.title}
                  price={service.price}
                  image={mainImage}
                  isService={true}
                  className={cn(
                    "py-2.5 px-5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 text-sm",
                    service.availability === 'offline'
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800 text-white hover:shadow-lg transform hover:-translate-y-0.5"
                  )}
                  disabled={service.availability === 'offline'}
                >
                  <Calendar className="w-4 h-4" />
                  {service.availability === 'offline' ? 'Unavailable' : 'Book Session'}
                </UniversalCartButton>
                
                {/* Next Available Slot */}
                {service.nextAvailableSlot && service.availability !== 'offline' && (
                  <p className="text-xs text-green-600 font-medium">
                    Next: {service.nextAvailableSlot}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default) - Service-oriented design
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col",
        className
      )}
    >
      {/* Image Section with Service Type Badge */}
      <div className="relative aspect-[16/10] overflow-hidden flex-shrink-0">
        <Link href={`/services/${service.slug}`}>
          <Image
            src={mainImage}
            alt={service.title}
            fill
            className={cn(
              "object-cover group-hover:scale-105 transition-transform duration-300",
              imageClassName
            )}
            priority={priority}
            onLoadingComplete={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
        </Link>
        
        {/* Service Type Badge - Top Right */}
        {service.consultationType && (
          <div className="absolute top-3 right-3">
            <Badge 
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border-0 shadow-sm",
                getConsultationIcon(service.consultationType).color
              )}
            >
              {getConsultationIcon(service.consultationType).icon}
              <span className="font-semibold">{service.consultationType}</span>
            </Badge>
          </div>
        )}

        {/* Popular/New Badge - Top Left */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {service.isPopular && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              ⭐ Popular
            </Badge>
          )}
          {service.isNew && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              ✨ New
            </Badge>
          )}
        </div>

        {/* Discount Badge - Bottom Left */}
        {discount > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="destructive" className="text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {discount}% OFF
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Service Title and Category */}
        <div className="mb-3">
          <Link href={`/services/${service.slug}`}>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 hover:text-green-700 transition-colors leading-tight">
              {service.title}
            </h3>
          </Link>
        </div>
        
        {/* Service Info Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Duration */}
          {service.duration && (
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{service.duration}</span>
            </div>
          )}
          
          {/* Availability Status */}
          {service.availability && (
            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", getAvailabilityColor(service.availability))} />
              <span className="text-sm font-medium text-gray-700">
                {service.availability === 'available' ? 'Available Now' : 
                 service.availability === 'busy' ? 'Busy' : 'Offline'}
              </span>
            </div>
          )}
        </div>
        
        {/* Rating and Reviews */}
        <div className="mb-4">
          {service.rating ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(service.rating!) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">{service.rating}</span>
                {service.reviewsCount && (
                  <span className="text-sm text-gray-500">({service.reviewsCount} reviews)</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Star className="w-4 h-4 text-gray-300" />
              <span>No reviews yet</span>
            </div>
          )}
        </div>
        
  {/* Price Section */}
  <div className="flex items-center justify-between mb-1 pt-0 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
            {service.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                ₹{service.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

  {/* Footer with Book Button */}
  <div className="p-4 pt-0 space-y-2">
          <UniversalCartButton
          productId={service.id}
          productName={service.title}
          price={service.price}
          image={mainImage}
          isService={true}
          className={cn(
            "w-full py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm",
            service.availability === 'offline'
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-800 text-white hover:shadow-lg transform hover:-translate-y-0.5"
          )}
          disabled={service.availability === 'offline'}
        >
          <Calendar className="w-4 h-4" />
          {service.availability === 'offline' ? 'Currently Unavailable' : 'Book Session'}
        </UniversalCartButton>
        
        {/* Next Available Slot */}
        {service.nextAvailableSlot && service.availability !== 'offline' && (
          <div className="text-center">
            <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-lg">
              Next available: {service.nextAvailableSlot}
            </p>
          </div>
        )}
        
        {/* Quick Info */}
        {!service.nextAvailableSlot && service.availability === 'available' && (
          <div className="text-center">
            <p className="text-xs text-green-600 font-medium">
              ✅ Available for immediate booking
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ReusableServiceCard;
