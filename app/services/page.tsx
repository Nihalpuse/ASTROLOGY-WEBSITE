"use client";
import { useState, useEffect } from 'react';
import { AnimatedStars } from '../components/AnimatedStars'
import { MysticBackground } from '../components/MysticBackground'
import dynamic from 'next/dynamic';
import ShopBanner from '../components/ShopBanner'
import NakshatraTicker from '../components/NakshatraTicker'
import { ServicesSearch } from '../components/ServicesSearch'
import { UniversalServiceCardGrid } from '../components/UniversalServiceCardGrid'
import ServiceShowcase from '../components/ServiceShowcase'
//import ServiceCarousels from '../components/ServiceCarousels'
import NakshatraGyaanBanner from '../components/NakshatraGyaanBanner'
import ProductAssuranceBar from '../components/ProductAssuranceBar'

// Define Service interface based on backend schema
interface Service {
  id: number;
  title: string;
  description: string;
  slug: string;
  price: number;
  duration?: string;
  delivery_type?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  service_media?: ServiceMedia[];
}

interface ServiceMedia {
  id: number;
  service_id: number;
  media_type: string;
  media_url: string;
  alt_text?: string;
  title?: string;
  sort_order: number;
  is_primary: boolean;
  is_active: boolean;
}

const CTASection = dynamic(() => import('../components/CTASection').then(mod => mod.CTASection), { loading: () => <div>Loading...</div>, ssr: false });
const SpiritualJourneyBanner = dynamic(() => import('../components/SpiritualJourneyBanner'), { loading: () => <div>Loading...</div>, ssr: false });
export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/services?limit=100&is_active=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(search.toLowerCase()) ||
    service.description.toLowerCase().includes(search.toLowerCase())
  );



  // Transform backend services to match ServiceShowcase expectations
  const transformServiceForShowcase = (service: Service, index: number) => {
    const consultationTypes = ['Video Call', 'Phone Call', 'In Person'];
    const ratings = [4.2, 4.5, 4.7, 4.8, 4.9];

    // Use backend data or fallback to defaults
    const consultationType = service.delivery_type || consultationTypes[index % consultationTypes.length];
    const duration = service.duration || '45 mins';
    const rating = ratings[index % ratings.length];

    // Get primary image from service media
    const primaryImage = service.service_media?.find(media => media.is_primary)?.media_url || 
                        service.service_media?.[0]?.media_url || 
                        '/images/astro.jpg';



    return {
      id: service.id.toString(),
      title: service.title,
      description: service.description,
      slug: service.slug,
      price: service.price,
      originalPrice: undefined, // Backend doesn't have this field
      rating: rating,
      reviewsCount: Math.floor(Math.random() * 100) + 20,
      duration: duration,
      consultationType: consultationType,
      availability: 'available' as const,
      image: primaryImage,
      images: service.service_media?.map(media => media.media_url) || [primaryImage],
    };
  };

  const showcaseServices = filteredServices.map(transformServiceForShowcase);

  // Show all services in the main section
  const allServices = showcaseServices;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 -mt-4">
      <AnimatedStars />
      <MysticBackground>
      
      {/* SHOP BANNER AT THE TOP */}
      <ShopBanner variant="services" />
      
      {/* NAKSHATRA TICKER */}
      <NakshatraTicker />
      
      <div className="container mx-auto pt-8 px-4 pb-16 relative z-10">
        <h1
          className="text-5xl md:text-7xl mb-2 text-center font-normal text-black"
          style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, letterSpacing: '0.01em', marginTop: '0px' }}
        >
          Our Spiritual Services
        </h1>
        <p
          className="text-xl text-center mb-10 max-w-3xl mx-auto"
          style={{ color: '#232323', fontFamily: 'Playfair Display, serif', fontWeight: 400, letterSpacing: '0.01em' }}
        >
          Embark on a transformative journey with our comprehensive range of spiritual services. Let our expert astrologers and spiritual guides illuminate your path to self-discovery and enlightenment.
        </p>

        {/* Services Search */}
        <ServicesSearch onSearchChange={setSearch} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your services</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load services</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

                 {/* Services Content */}
         {!loading && !error && (
           <>
             {/* All Services */}
             <ServiceShowcase
               title="Our Services"
               subtitle="Discover our complete collection of spiritual services and expert consultations"
               services={allServices}
               cardsPerView={5}
               scrollStep={1}
             />

             {/* Service Carousels (Top-Selling Section) 
             <div className="mt-16 mb-32">
               <ServiceCarousels />
             </div>
*/}
             {/* Nakshatra Gyaan Banner */}
             <div className="mt-16 mb-32">
               <NakshatraGyaanBanner />
             </div>
           </>
         )}

        {/* Product Assurance Bar */}
        <ProductAssuranceBar />
        
        <div className="mt-16">
          <CTASection />
        </div>
      </div>

      {/* Spiritual Journey Banner */}
      <SpiritualJourneyBanner />
        </MysticBackground>
    </div>
  )
}
