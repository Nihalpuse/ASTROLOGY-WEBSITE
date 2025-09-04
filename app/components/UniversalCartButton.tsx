'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface UniversalCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  quantity?: number;
  image?: string;
  isStone?: boolean;
  isService?: boolean;
  carats?: number | null;
  variant?: 'addToCart' | 'buyNow';
  children: React.ReactNode;
  className?: string;
  [key: string]: string | number | boolean | null | undefined | React.ReactNode;
}

/**
 * UniversalCartButton - A versatile button component for adding products/services to cart
 * 
 * Features:
 * - Automatically detects user authentication
 * - Supports both products and services
 * - Integrates with the new cart API
 * - Handles image fetching for services
 * - Supports "Add to Cart" and "Buy Now" variants
 * - Automatic error handling and user feedback
 * 
 * @example
 * // Basic product button
 * <UniversalCartButton
 *   productId="123"
 *   productName="Gemstone Bracelet"
 *   price={99.99}
 *   image="/images/bracelet.jpg"
 * >
 *   Add to Cart
 * </UniversalCartButton>
 * 
 * @example
 * // Service button with Buy Now variant
 * <UniversalCartButton
 *   productId="456"
 *   productName="Astrology Consultation"
 *   price={150.00}
 *   isService={true}
 *   variant="buyNow"
 * >
 *   Book Now
 * </UniversalCartButton>
 */
export function UniversalCartButton({
  productId,
  productName,
  price,
  quantity = 1,
  image,
  isStone = false,
  isService = false,
  carats = null,
  variant = 'addToCart',
  children,
  className = '',
  ...props
}: UniversalCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem, items } = useCart();
  const { userId, isAuthenticated, isLoading: authLoading } = useCurrentUser();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !userId) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to add items to your cart.',
          variant: 'destructive',
        });
        return;
      }

      // If it's a service and no image is provided, try to fetch the service image
      let finalImage = image;
      if (isService && !image && productId) {
        try {
          // Try to fetch service details to get the image
          const serviceRes = await fetch(`/api/services/${productId}`);
          if (serviceRes.ok) {
            const serviceData = await serviceRes.json();
            if (serviceData.service_media && serviceData.service_media.length > 0) {
              // Use the first service media image
              finalImage = serviceData.service_media[0].media_url;
            }
          }
        } catch (err) {
          console.error('Error fetching service image:', err);
          // Continue with null image if fetch fails
        }
      }

      // Determine item type for the API
      const itemType = isService ? 'service' : 'product';
      
      // Prepare API request body
      const requestBody: {
        userId: string;
        itemType: string;
        quantity: number;
        productId?: number;
        serviceId?: number;
        price?: number;
      } = {
        userId,
        itemType,
        quantity
      };

      // Add appropriate ID based on item type
      if (isService) {
        requestBody.serviceId = parseInt(productId);
      } else {
        requestBody.productId = parseInt(productId);
      }

      // Add to backend cart first
      const cartResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!cartResponse.ok) {
        const errorData = await cartResponse.json();
        throw new Error(errorData.error || 'Failed to add item to cart');
      }

      const cartData = await cartResponse.json();

      // Add to frontend cart state
      addItem({ 
        id: productId, 
        name: productName, 
        price, 
        image: finalImage 
      }, quantity);

      toast({
        title: 'Item added to cart',
        description: `${productName} has been added to your cart.`,
        variant: 'default',
      });

      if (variant === 'buyNow') {
        router.push('/checkout');
      }
    } catch (error: unknown) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Disable button if auth is still loading or user is not authenticated
  const isDisabled = isLoading || authLoading || !isAuthenticated;

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {variant === 'buyNow' ? 'Processing...' : 'Adding...'}
        </>
      ) : (
        children
      )}
    </Button>
  );
}