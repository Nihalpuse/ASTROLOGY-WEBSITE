import { useState, useEffect } from 'react';

export interface ServiceMedia {
  id: string;
  media_type: string;
  media_url: string;
  alt_text: string;
  title: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration?: string;
  delivery_type?: string;
  is_active: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
  service_media: ServiceMedia[];
}

export interface ServicesResponse {
  services: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useServices(limit: number = 6) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/services?limit=${limit}&is_active=true`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data: ServicesResponse = await response.json();
        setServices(data.services);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [limit]);

  return { services, loading, error };
}
