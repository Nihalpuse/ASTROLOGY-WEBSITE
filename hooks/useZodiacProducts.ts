import { useState, useEffect } from 'react';
import { Product } from '@/app/components/ReusableProductCard';

interface ZodiacProductsResponse {
  products: Product[];
  zodiacSign: {
    id: number;
    name: string;
    slug: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UseZodiacProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export const useZodiacProducts = (
  zodiacSlug: string, 
  options: UseZodiacProductsOptions = {}
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ZodiacProductsResponse['pagination'] | null>(null);
  const [zodiacSign, setZodiacSign] = useState<ZodiacProductsResponse['zodiacSign'] | null>(null);

  const { page = 1, limit = 12, search } = options;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) {
          params.append('search', search);
        }

        const response = await fetch(`/api/products/zodiac/${zodiacSlug}?${params}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Zodiac sign not found');
          }
          throw new Error('Failed to fetch products');
        }
        
        const data: ZodiacProductsResponse = await response.json();
        setProducts(data.products || []);
        setPagination(data.pagination);
        setZodiacSign(data.zodiacSign);
      } catch (err) {
        console.error('Error fetching zodiac products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
        setPagination(null);
        setZodiacSign(null);
      } finally {
        setLoading(false);
      }
    };

    if (zodiacSlug) {
      fetchProducts();
    }
  }, [zodiacSlug, page, limit, search]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // This will trigger the useEffect to run again
  };

  return {
    products,
    loading,
    error,
    pagination,
    zodiacSign,
    refetch,
  };
};
