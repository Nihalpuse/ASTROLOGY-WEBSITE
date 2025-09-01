"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Grid3X3, List } from 'lucide-react';
import { ReusableServiceGrid } from '@/app/components/service-cards';
import { AnimatedStars } from '@/app/components/AnimatedStars';
import { MysticBackground } from '@/app/components/MysticBackground';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define the Service interface based on the backend schema
interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
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

// Filter option builders based on real service data
const buildFilterOptions = (services: Service[]) => {
  const deliveryTypes = [...new Set(services.map(s => s.delivery_type).filter(Boolean))].sort() as string[];
  const durations = [...new Set(services.map(s => s.duration).filter(Boolean))].sort() as string[];
  
  const priceRanges = ['Under ₹500', '₹500 - ₹1000', '₹1000 - ₹2000', 'Above ₹2000'];
  
  return { 
    deliveryType: deliveryTypes, 
    duration: durations, 
    priceRange: priceRanges
  };
};

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name' | 'newest';
type ViewMode = 'grid' | 'list';

// Sidebar component similar to products page
const FilterSidebar = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
  isOpen,
  onClose
}: {
  filters: Record<string, string[]>;
  filterOptions: Record<string, string[]>;
  onFilterChange: (category: string, value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState('deliveryType');
  
  const tabLabels = {
    deliveryType: 'Delivery Type',
    duration: 'Duration',
    priceRange: 'Price Range'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 lg:hidden filter-backdrop"
            style={{ zIndex: 2147483647 }}
            onClick={onClose}
          />
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-green-800 hover:text-green-900 font-medium"
                  >
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category} className="border-b border-gray-200 pb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4 capitalize">
                      {category.replace(/([A-Z])/g, ' $1')}
                    </h4>
                    <div className="space-y-2">
                      {options.map(option => (
                        <label key={option} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters[category]?.includes(option) || false}
                            onChange={() => onFilterChange(category, option)}
                            className="mr-3 h-4 w-4 text-green-700 border-gray-200 bg-gray-50 rounded focus:ring-green-600 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Mobile modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl h-[50vh] lg:hidden filter-modal"
            style={{ zIndex: 2147483647 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors bg-gray-50 border border-gray-300"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {Object.keys(filterOptions).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={cn(
                      "flex-1 py-3 px-2 text-xs font-medium text-center transition-colors",
                      activeTab === category
                        ? "text-green-800 bg-white border-b-2 border-green-800"
                        : "text-gray-600 hover:text-gray-800"
                    )}
                  >
                    {tabLabels[category as keyof typeof tabLabels]}
                  </button>
                ))}
              </div>
              
              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {filterOptions[activeTab]?.map(option => (
                    <label key={option} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={activeTab}
                        checked={filters[activeTab]?.includes(option) || false}
                        onChange={() => onFilterChange(activeTab, option)}
                        className="mr-3 h-4 w-4 text-green-700 border-gray-200 bg-gray-50 focus:ring-green-600 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer with action buttons */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={onClearFilters}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function AllServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const servicesPerPage = 12;

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

  const filterOptions = useMemo(() => buildFilterOptions(services), [services]);

  // Initialize filters
  useEffect(() => {
    const initial: Record<string, string[]> = {};
    Object.keys(filterOptions).forEach(k => { initial[k] = []; });
    setFilters(initial);
  }, [filterOptions]);

  const filteredAndSortedServices = useMemo(() => {
    const result = services.filter(service => {
      // Only show active services
      if (!service.is_active) return false;
      
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(
          service.title.toLowerCase().includes(q) ||
          service.description.toLowerCase().includes(q) ||
          service.delivery_type?.toLowerCase().includes(q) ||
          service.duration?.toLowerCase().includes(q)
        )) return false;
      }
      
      // Delivery type
      if (filters.deliveryType?.length) {
        if (!filters.deliveryType.includes(service.delivery_type || '')) return false;
      }
      
      // Duration
      if (filters.duration?.length) {
        if (!filters.duration.includes(service.duration || '')) return false;
      }
      
      // Price range
      if (filters.priceRange?.length) {
        const price = service.price;
        const prMatch = filters.priceRange.some(range => {
          switch (range) {
            case 'Under ₹500': return price < 500;
            case '₹500 - ₹1000': return price >= 500 && price <= 1000;
            case '₹1000 - ₹2000': return price >= 1000 && price <= 2000;
            case 'Above ₹2000': return price > 2000;
            default: return true;
          }
        });
        if (!prMatch) return false;
      }
      
      return true;
    });

    // Sort (copy)
    const sorted = [...result];
    switch (sortOption) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price); break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price); break;
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()); break;
      default:
        // Featured: keep original order (most recently added first from API)
        break;
    }
    return sorted;
  }, [services, filters, searchQuery, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedServices.length / servicesPerPage) || 1;
  const paginatedServices = filteredAndSortedServices.slice(
    (currentPage - 1) * servicesPerPage,
    currentPage * servicesPerPage
  );

  const toggleFilter = (category: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category]?.includes(value)
        ? prev[category].filter(v => v !== value)
        : [...(prev[category] || []), value]
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    const cleared: Record<string, string[]> = {};
    Object.keys(filterOptions).forEach(k => { cleared[k] = []; });
    setFilters(cleared);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => Object.values(filters).reduce((s, arr) => s + arr.length, 0);

  // Transform services for the ReusableServiceGrid component
  const transformedServices = paginatedServices.map(service => {
    // Get the primary image or first available image
    const primaryImage = service.service_media?.find(media => media.is_primary && media.is_active)?.media_url;
    const firstImage = service.service_media?.find(media => media.is_active)?.media_url;
    const imageUrl = primaryImage || firstImage || '/images/astro.jpg'; // Using existing image as fallback
    
    console.log(`Service ${service.id} media:`, service.service_media); // Debug log
    
    return {
      id: service.id.toString(),
      title: service.title,
      description: service.description,
      price: service.price,
      images: [imageUrl], // Changed from 'image' to 'images' array
      category: service.delivery_type || 'General',
      consultationType: service.delivery_type || 'Online',
      rating: 4.5, // Default rating since not in schema
      tags: [service.duration, service.delivery_type].filter(Boolean) as string[],
      slug: service.slug
    };
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading services</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50">
      <AnimatedStars />
      <MysticBackground>
    <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Add global style to hide floating elements when modal is open */}
          {showFilters && (
            <style jsx global>{`
              [class*="chatbot"], 
              [id*="chatbot"], 
              [class*="chat"], 
              [id*="chat"],
              [class*="float"], 
              [id*="float"],
              [class*="scroll"], 
              [id*="scroll"],
              [class*="back-to-top"], 
              [id*="back-to-top"],
              .fixed:not(.filter-modal):not(.filter-backdrop) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `}</style>
          )}
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-normal text-gray-900 mb-4 font-playfair">
              All Spiritual Services
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 font-playfair">
              Discover our complete collection of spiritual services designed to guide you on your journey of self-discovery and enlightenment. From ancient Vedic wisdom to modern spiritual practices.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">{services.length}+</div>
                <div className="text-sm text-gray-600">Services Available</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">50+</div>
                <div className="text-sm text-gray-600">Expert Astrologers</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">10k+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
              <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-0 py-0">
            <div className="flex gap-8">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar
                    filters={filters}
                    filterOptions={filterOptions}
                    onFilterChange={toggleFilter}
                    onClearFilters={clearAllFilters}
                    activeFiltersCount={getActiveFiltersCount()}
                    isOpen={true}
                    onClose={() => {}}
                  />
                </div>
              </div>

              {/* Mobile Sidebar */}
              <FilterSidebar
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={toggleFilter}
                onClearFilters={clearAllFilters}
                activeFiltersCount={getActiveFiltersCount()}
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
              />

              {/* Services Section */}
              <div className="flex-1">
                {/* Controls Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-300 placeholder-gray-400 text-gray-900"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Mobile Filter Button */}
                      <button
                        onClick={() => setShowFilters(true)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        Filters
                        {getActiveFiltersCount() > 0 && (
                          <span className="bg-green-800 text-white text-xs px-2 py-1 rounded-full">
                            {getActiveFiltersCount()}
                          </span>
                        )}
                      </button>
                      <span className="text-gray-600">{filteredAndSortedServices.length} services found</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={cn('p-2 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-gray-800')}
                        >
                          <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={cn('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-green-700' : 'text-gray-600 hover:text-gray-800')}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Sort */}
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                        <option value="newest">Newest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Active filters:</span>
                        {Object.entries(filters).map(([category, values]) => values.map(value => (
                          <span key={`${category}-${value}`} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {value}
                            <button onClick={() => toggleFilter(category, value)} className="ml-2 text-green-700 hover:text-green-900">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )))}
                        <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">Clear all</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Services Grid/List */}
                <ReusableServiceGrid
                  services={transformedServices}
                  viewMode={viewMode}
                  columns={4}
                  mobileColumns={2}
                  loading={loading}
                  loadingCount={12}
                  className="max-w-none"
                  emptyMessage="Try adjusting your search or filter criteria to find the right service for you."
                />

                {/* No Results */}
                {filteredAndSortedServices.length === 0 && !loading && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                    <button onClick={clearAllFilters} className="bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors">
                      Clear all filters
                    </button>
                  </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg font-semibold transition-colors border border-green-800 bg-green-800 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed hover:bg-green-900 hover:border-green-900"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              'px-4 py-2 rounded-lg font-semibold transition-colors border',
                              currentPage === page
                                ? 'bg-green-800 text-white border-green-800 hover:bg-green-900 hover:border-green-900'
                                : 'bg-white text-green-800 border-green-800 hover:bg-green-50 hover:text-green-900'
                            )}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2 text-green-800">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg font-semibold transition-colors border border-green-800 bg-green-800 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed hover:bg-green-900 hover:border-green-900"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="flex justify-center my-16">
            <hr className="border-t-2 border-gray-200 w-3/4 md:w-2/3 lg:w-1/2 rounded-full" />
          </div>
          {/* CTA Section (kept minimal) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 font-playfair">Need Personalized Guidance?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Connect with our expert astrologers for a personalized consultation tailored to your unique spiritual journey.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/chat-with-astrologer">
                <Button size="lg" className="bg-green-800 hover:bg-green-900 text-white w-full md:w-auto">Talk to Astrologer</Button>
              </a>
              <a href="/contact">
                <Button size="lg" variant="outline" className="border-green-800 text-green-800 hover:bg-green-50 w-full md:w-auto">Book Free Consultation</Button>
              </a>
            </div>
          </motion.div>
        </div>
      </MysticBackground>
    </div>
  );
}
