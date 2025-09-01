import { useState, useEffect } from 'react';

export interface ProductMedia {
  id: string;
  type: string;
  url?: string;
  media_url?: string; // Some endpoints return media_url instead of url
  alt_text: string;
  title: string;
  created_at: string;
}

export interface ProductStock {
  id: string;
  quantity: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Zodiac {
  id: number;
  name: string;
  symbol: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_price?: number;
  sku: string;
  slug: string;
  category_id?: number;
  zodiac_id?: number;
  is_active: boolean;
  available: number;
  product_type?: string;
  weight?: number;
  carats?: number;
  quantity?: number;
  quality?: string;
  clarity?: string;
  color?: string;
  mukhi?: string;
  material?: string;
  per_carat_price?: number;
  per_gram_price?: number;
  per_piece_price?: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  zodiac?: Zodiac;
  product_media: ProductMedia[];
  product_stock: ProductStock[];
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useProducts(limit: number = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products?limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data: ProductsResponse = await response.json();
        setProducts(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  return { products, loading, error };
}
