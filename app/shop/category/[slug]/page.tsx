"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, X, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { UniversalCartButton } from "@/app/components/UniversalCartButton";
import SpiritualTicker from "@/app/components/Hero/SpiritualTicker";
import NakshatraGyaanBanner from "@/app/components/NakshatraGyaanBanner";
import SpiritualJourneyBanner from "@/app/components/SpiritualJourneyBanner";

// Interface for API product data from backend
interface ApiProduct {
  id: number;
  name: string;
  material?: string;
  product_type?: string;
  color?: string;
  price: string;
  original_price?: string;
  description?: string;
  image?: string;
  product_media?: Array<{
    media_url?: string;
    url?: string;
  }>;
}

// Type definitions
interface Product {
  id: number;
  name: string;
  material?: string;
  type?: string;
  color?: string;
  purpose: string[];
  style?: string;
  gender?: string;
  zodiac?: string[];
  chakra?: string[];
  planet?: string;
  price: string;
  oldPrice: string;
  image: string;
  description: string;
  path: string;
  category: string;
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  tags?: string[] | null;
  gradient_from?: string | null;
  gradient_to?: string | null;
  created_at: string | null;
  updated_at: string | null;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
  }>;
}

interface CategoryConfig {
  title: string;
  description: string;
  bannerImage: string;
  tags: string[];
  gradientFrom: string;
  gradientTo: string;
}

interface Filters {
  [key: string]: string[];
}

type FilterCategory = string;
type DropdownType = FilterCategory | null;

// Default category gradients
const defaultGradients: Record<string, { from: string, to: string }> = {
  bracelets: { from: "purple-50", to: "rose-50" },
  "gemstones-crystals": { from: "blue-50", to: "amber-50" },
  rings: { from: "emerald-50", to: "yellow-50" },
  pendants: { from: "indigo-50", to: "purple-50" },
  malas: { from: "orange-50", to: "red-50" },
  default: { from: "gray-50", to: "gray-100" }
};

// Dynamic filter options based on product attributes
const getFilterOptions = (products: Product[]): Record<string, string[]> => {
  // Extract all available attributes from products
  const attributeValues: Record<string, Set<string>> = {};
  
  // Process each product
  products.forEach(product => {
    // Extract all product attributes
    Object.entries(product).forEach(([key, value]) => {
      // Skip certain keys that aren't filterable attributes
      if (['id', 'name', 'description', 'price', 'oldPrice', 'image', 'path', 'category'].includes(key)) {
        return;
      }
      
      // Handle array values (like purpose, zodiac, chakra)
      if (Array.isArray(value)) {
        if (!attributeValues[key]) {
          attributeValues[key] = new Set();
        }
        
        value.forEach(val => {
          if (typeof val === 'string' && val.trim()) {
            attributeValues[key].add(val);
          }
        });
      } 
      // Handle string values
      else if (typeof value === 'string' && value.trim()) {
        if (!attributeValues[key]) {
          attributeValues[key] = new Set();
        }
        attributeValues[key].add(value);
      }
    });
  });
  
  // Convert Sets to sorted arrays
  const result: Record<string, string[]> = {};
  Object.entries(attributeValues).forEach(([key, valueSet]) => {
    if (valueSet.size > 0) {
      result[key] = Array.from(valueSet).sort();
    }
  });
  
  return result;
};

// Product Banner Component
const ProductBanner: React.FC<{ config: CategoryConfig }> = ({ config }) => (
  <div className={`w-full bg-gradient-to-r from-${config.gradientFrom} via-${config.gradientFrom} to-${config.gradientTo} py-8 md:py-12 relative overflow-hidden`}>
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Section - Full Height Image */}
        <div className="relative h-48 md:h-64 lg:h-80">
          <Image
            src={config.bannerImage}
            alt={`${config.title} Collection`}
            fill
            className="object-cover rounded-2xl shadow-2xl"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              // Fallback to default image on error
              const target = e.target as HTMLImageElement;
              target.src = "/images/products/default-banner.jpg";
              target.onerror = null; // Prevent infinite loop
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl"></div>
        </div>
        
        {/* Right Section - Text Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-800 mb-3 leading-tight">
            {config.title}
          </h1>
          <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed max-w-lg mx-auto lg:mx-0 mb-4">
            {config.description}
          </p>
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {config.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 ${index === 0 ? 'bg-purple-100/50 text-purple-800 border-purple-200/50' : 
                          index === 1 ? 'bg-pink-100/50 text-pink-800 border-pink-200/50' : 
                          'bg-rose-100/50 text-rose-800 border-rose-200/50'} rounded-full text-xs font-medium border`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [filters, setFilters] = useState<Filters>({});
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Fetch category data from API
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/categories/slug/${slug}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch category data');
        }
        
        setCategoryData(result.data);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  // Fetch products for this category from API once category id is known
  useEffect(() => {
    const fetchProductsForCategory = async () => {
      if (!categoryData?.id) return;

      try {
        setProductLoading(true);
        const res = await fetch(`/api/products?category=${categoryData.id}&limit=100`);
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        const apiProducts = Array.isArray(data.products) ? data.products : [];

        // Map API products to local Product shape used by this page
        const mapped: Product[] = apiProducts.map((p: ApiProduct) => {
          // Extract image URL from product media
          let imageUrl = '/images/products/default.jpg';
          
          if (p.product_media && p.product_media.length > 0) {
            // Try to get the first media URL
            const firstMedia = p.product_media[0];
            if (firstMedia.media_url) {
              imageUrl = firstMedia.media_url;
            } else if (firstMedia.url) {
              imageUrl = firstMedia.url;
            }
          } else if (p.image) {
            // Fallback to legacy image field
            imageUrl = p.image;
          }
          
          // Extract product attributes for filtering
          // These would typically come from product_attributes table
          // For now, we'll use empty arrays as placeholders
          const purpose: string[] = [];
          const zodiac: string[] = [];
          const chakra: string[] = [];
          
          return {
            id: p.id,
            name: p.name,
            material: p.material || undefined,
            type: p.product_type || undefined,
            color: p.color || undefined,
            purpose,
            style: undefined,
            gender: undefined,
            zodiac,
            chakra,
            planet: undefined,
            price: `₹${p.price}`,
            oldPrice: p.original_price ? `₹${p.original_price}` : `₹${(Number(p.price) * 1.2).toFixed(2)}`,
            image: imageUrl,
            description: p.description || '',
            path: `/shop/${p.id}`,
            category: slug
          };
        });

        setCategoryProducts(mapped);
      } catch (err) {
        console.error('Error fetching products:', err);
        setCategoryProducts([]);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProductsForCategory();
  }, [categoryData, slug]);

  // Get category configuration based on API data or fallback
  const categoryConfig = useMemo(() => {
    if (categoryData) {
      // Extract tags from category attributes if available
      let tags: string[] = ["Spiritual", "Sacred", "Divine"];
      
      if (categoryData.tags) {
        try {
          // If tags is a string (JSON), parse it
          if (typeof categoryData.tags === 'string') {
            const parsedTags = JSON.parse(categoryData.tags);
            if (Array.isArray(parsedTags)) {
              tags = parsedTags;
            }
          } 
          // If tags is already an array, use it directly
          else if (Array.isArray(categoryData.tags)) {
            tags = categoryData.tags;
          }
        } catch (e) {
          console.error('Error parsing category tags:', e);
          // Keep default tags if parsing fails
        }
      }
      
      // Get gradient colors from defaults or use standard fallbacks
      const gradientColors = defaultGradients[slug] || defaultGradients.default;
      
      // Get banner image from category data
      let bannerImage = "/images/products/default-banner.jpg";
      
      // Try to use banner_url first, then fall back to image_url
      if (categoryData.banner_url) {
        bannerImage = categoryData.banner_url;
      } else if (categoryData.image_url) {
        bannerImage = categoryData.image_url;
      }
      
      return {
        title: categoryData.name,
        description: categoryData.description || "Discover our collection of spiritual products",
        bannerImage,
        tags,
        gradientFrom: categoryData.gradient_from || gradientColors.from,
        gradientTo: categoryData.gradient_to || gradientColors.to
      };
    }
    
    // Fallback configuration if no category data
    const gradientColors = defaultGradients[slug] || defaultGradients.default;
    return {
      title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: "Discover our collection of spiritual products",
      bannerImage: "/images/products/default-banner.jpg",
      tags: ["Spiritual", "Sacred", "Divine"],
      gradientFrom: gradientColors.from,
      gradientTo: gradientColors.to
    };
  }, [categoryData, slug]);

  // Get filter options from products
  const filterOptions = useMemo(() => {
    return getFilterOptions(categoryProducts);
  }, [categoryProducts]);

  // Initialize filters when category changes
  useEffect(() => {
    const initialFilters: Filters = {};
    Object.keys(filterOptions).forEach(key => {
      initialFilters[key] = [];
    });
    setFilters(initialFilters);
  }, [filterOptions]);

  // Filter products based on selected criteria
  const filteredProducts = useMemo(() => {
    return categoryProducts.filter(product => {
      return Object.entries(filters).every(([filterKey, filterValues]) => {
        // If no values selected for this filter, return true (don't filter)
        if (filterValues.length === 0) return true;
        
        const productValue = product[filterKey as keyof Product];
        
        // Handle array values (like purpose, zodiac, chakra)
        if (Array.isArray(productValue)) {
          return productValue.some(val => filterValues.includes(val));
        }
        
        // Handle string values
        if (typeof productValue === 'string') {
          return filterValues.includes(productValue);
        }
        
        // If the product doesn't have this attribute, exclude it
        return false;
      });
    });
  }, [categoryProducts, filters]);

  const toggleFilter = (category: FilterCategory, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category]?.includes(value)
        ? prev[category].filter(item => item !== value)
        : [...(prev[category] || []), value]
    }));
  };

  const clearAllFilters = (): void => {
    const clearedFilters: Filters = {};
    Object.keys(filterOptions).forEach(key => {
      clearedFilters[key] = [];
    });
    setFilters(clearedFilters);
  };

  const getActiveFiltersCount = (): number => {
    return Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Show loading state
  if (loading || productLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Product Banner */}
      <ProductBanner config={categoryConfig} />
      
      {/* Spiritual Ticker */}
      <SpiritualTicker />
      
      {/* Category Description */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Filters Section */}
        <div className="bg-gray-50 rounded-2xl shadow-sm p-6 mb-12 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-gray-700 font-medium">Filter by:</span>
            
            {Object.entries(filterOptions).map(([filterKey, options]) => (
              <div key={filterKey} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === filterKey ? null : filterKey);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors capitalize text-gray-900"
                >
                  {filterKey.replace(/([A-Z])/g, ' $1')}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === filterKey ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto transition-all duration-200 ease-out ${activeDropdown === filterKey ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2 pointer-events-none'}`}>
                  {options.map(option => (
                    <label key={option} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900">
                      <input
                        type="checkbox"
                        checked={filters[filterKey]?.includes(option) || false}
                        onChange={() => toggleFilter(filterKey, option)}
                        className="mr-2"
                      />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Clear All Filters */}
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Clear all ({getActiveFiltersCount()})
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([category, values]) =>
                values.map((value: string) => (
                  <span
                    key={`${category}-${value}`}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {value}
                    <button
                      onClick={() => toggleFilter(category, value)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* Subcategories Section */}
        {categoryData?.subcategories && categoryData.subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryData.subcategories.map((subcategory) => (
                <Link 
                  key={subcategory.id} 
                  href={`/shop/category/${slug}/${subcategory.slug}`}
                  className="group"
                >
                  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow text-center">
                    <div className="relative h-20 mb-3">
                      <Image
                        src={subcategory.image_url || '/images/products/default-category.jpg'}
                        alt={subcategory.name}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to default image on error
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/products/default-category.jpg";
                          target.onerror = null; // Prevent infinite loop
                        }}
                      />
                    </div>
                    <h3 
                      className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors overflow-hidden text-ellipsis line-clamp-2 min-h-[2.5rem]"
                      title={subcategory.name}
                    >
                      {subcategory.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {categoryProducts.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={product.path} className="w-full max-w-sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col"
                >
                                     {/* Product Image */}
                   <div className="relative h-36 overflow-hidden rounded-t-2xl">
                     <Image
                       src={product.image}
                       alt={product.name}
                       fill
                       className="object-cover group-hover:scale-105 transition-transform duration-300"
                       onError={(e) => {
                         // Fallback to default image on error
                         const target = e.target as HTMLImageElement;
                         target.src = "/images/products/default.jpg";
                         target.onerror = null; // Prevent infinite loop
                       }}
                     />
                     
                     {/* Edit Button Overlay */}
                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                       <Link
                         href={`/admin/products/add?edit=${product.id}`}
                         className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group/edit"
                         onClick={(e) => e.stopPropagation()}
                         title="Edit Product"
                       >
                         <Edit className="w-4 h-4" />
                         <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/edit:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
                           Edit Product
                         </span>
                       </Link>
                     </div>
                   </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 
                      className="font-serif font-bold text-gray-900 mb-2 text-lg overflow-hidden text-ellipsis line-clamp-2 min-h-[3.5rem]"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                    <p 
                      className="text-gray-600 text-sm mb-3 font-light overflow-hidden text-ellipsis line-clamp-2 min-h-[2.5rem]"
                      title={product.description}
                    >
                      {product.description}
                    </p>
                    
                    {/* Product Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.purpose.slice(0, 2).map((purpose, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full overflow-hidden text-ellipsis max-w-full"
                          title={purpose}
                        >
                          {purpose.length > 15 ? `${purpose.substring(0, 15)}...` : purpose}
                        </span>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                      <div className="flex items-center flex-wrap">
                        <span className="font-bold text-gray-900">{product.price}</span>
                        <span className="text-gray-500 line-through text-sm ml-2">{product.oldPrice}</span>
                      </div>
                      <span className="text-green-600 text-sm font-medium whitespace-nowrap">
                        {Math.round(((parseInt(product.oldPrice.replace(/[^\d]/g, '')) - parseInt(product.price.replace(/[^\d]/g, ''))) / parseInt(product.oldPrice.replace(/[^\d]/g, ''))) * 100)}% OFF
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <UniversalCartButton
                      productId={product.id.toString()}
                      productName={product.name}
                      price={Number(product.price.replace(/[^\d]/g, ''))}
                      image={product.image}
                      className="w-full bg-gray-900 text-white py-2 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </UniversalCartButton>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products match your current filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
              >
                Clear Filters
                <span className="ml-2">→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nakshatra Gyaan Banner */}
      <NakshatraGyaanBanner />

      {/* Spiritual Journey Banner */}
      {/* <SpiritualJourneyBanner /> */}
    </div>
  );
}