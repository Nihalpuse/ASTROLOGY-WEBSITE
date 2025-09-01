'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Calendar, Video, Phone } from 'lucide-react';
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

// Helper function to get consultation type icon
const getConsultationIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'video call':
    case 'video/audio call':
      return <Video className="w-4 h-4" />;
    case 'phone call':
    case 'audio call':
      return <Phone className="w-4 h-4" />;
    case 'in-person':
      return <Users className="w-4 h-4" />;
    default:
      return <Video className="w-4 h-4" />;
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
          "group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden",
          className
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden">
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
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs font-medium">
                  {discount}% OFF
                </Badge>
              )}
              {service.isNew && (
                <Badge className="bg-green-500 hover:bg-green-600 text-xs font-medium">
                  New
                </Badge>
              )}
              {service.isPopular && (
                <Badge className="bg-amber-500 hover:bg-amber-600 text-xs font-medium">
                  Popular
                </Badge>
              )}
            </div>

            {/* Availability Indicator */}
            {service.availability && (
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <div className={cn("w-2 h-2 rounded-full", getAvailabilityColor(service.availability))} />
                <span className="text-xs bg-white/90 px-1 py-0.5 rounded text-gray-700 font-medium">
                  {service.availability === 'available' ? 'Available' : 
                   service.availability === 'busy' ? 'Busy' : 'Offline'}
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              {service.category && (
                <Badge variant="outline" className="mb-2 text-xs">
                  {service.category}
                </Badge>
              )}
              
              <Link href={`/services/${service.slug}`}>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-800 transition-colors">
                  {service.title}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {service.description}
              </p>

              {/* Service Details */}
              <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500">
                {service.consultationType && (
                  <div className="flex items-center gap-1">
                    {getConsultationIcon(service.consultationType)}
                    <span>{service.consultationType}</span>
                  </div>
                )}
                {service.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{service.duration}</span>
                  </div>
                )}
              </div>
              
              {/* Rating */}
              {service.rating && (
                <div className="flex items-center mb-0.5">
                  <div className="flex items-center">
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
                  <span className="text-xs text-gray-500 ml-2">
                    ({service.rating})
                  </span>
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">₹{service.price}</span>
                {service.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{service.originalPrice}
                  </span>
                )}
              </div>
              
              <UniversalCartButton
                productId={service.id}
                productName={service.title}
                price={service.price}
                image={mainImage}
                isService={true}
                className="bg-green-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-900 transition-colors"
              >
                Book Now
              </UniversalCartButton>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
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
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <Badge variant="destructive" className="text-xs font-medium">
              {discount}% OFF
            </Badge>
          )}
          {service.isNew && (
            <Badge className="bg-green-500 hover:bg-green-600 text-xs font-medium">
              New
            </Badge>
          )}
          {service.isPopular && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-xs font-medium">
              Popular
            </Badge>
          )}
        </div>

        {/* Category Badge */}
        {service.category && (
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium"
          >
            {service.category}
          </Badge>
        )}

        {/* Availability Indicator */}
        {service.availability && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <div className={cn("w-2 h-2 rounded-full", getAvailabilityColor(service.availability))} />
            <span className="text-xs text-gray-700 font-medium">
              {service.availability === 'available' ? 'Available' : 
               service.availability === 'busy' ? 'Busy' : 'Offline'}
            </span>
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <CardContent className="p-4 pb-1 flex-1 flex flex-col">
        <Link href={`/services/${service.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-green-800 transition-colors min-h-[3rem]">
            {service.title}
          </h3>
        </Link>
                
        {/* Rating */}
        <div className="mb-0.5 min-h-[1.5rem]">
          {service.rating && (
            <div className="flex items-center">
              <div className="flex items-center">
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
              <span className="text-xs text-gray-500 ml-2">
                ({service.rating})
              </span>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mt-auto mb-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">₹{service.price}</span>
            {service.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{service.originalPrice}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer with Book Button */}
      <CardFooter className="p-4 pt-0.5">
        <UniversalCartButton
          productId={service.id}
          productName={service.title}
          price={service.price}
          image={mainImage}
          isService={true}
          className="w-full bg-green-800 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={service.availability === 'offline'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {service.availability === 'offline' ? 'Currently Unavailable' : 'Book Now'}
        </UniversalCartButton>
      </CardFooter>
    </motion.div>
  );
};

export default ReusableServiceCard;
