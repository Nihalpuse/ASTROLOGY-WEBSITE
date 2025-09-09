"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { notFound } from 'next/navigation';
// Using real backend API instead of mock data
import { UniversalCartButton } from '../../components/UniversalCartButton';
import ServiceCarousels from '../../components/ServiceCarousels';
import NakshatraGyaanBanner from '../../components/NakshatraGyaanBanner';
import SpiritualJourneyBanner from '../../components/SpiritualJourneyBanner';
import { Testimonials } from '../../components/Testimonials';
import { useCart } from '../../contexts/CartContext';

// Interface for product data structure
interface ProductData {
  id: number;
  title: string;
  description: string;
  name?: string;
  detailedDescription?: string;
}

// Generic FAQs that will be customized based on product
const getProductFaqs = (product: ProductData | null) => {
  if (!product) return [];
  
  return [
  {
    question: `What is ${product.title} and what are its benefits?`,
    answer: `${product.title} is ${product.description}. This authentic product is carefully selected to provide maximum spiritual and healing benefits according to ancient Vedic traditions.`,
  },
  {
    question: `How do I know if my ${product.title} is genuine?`,
    answer: "All our products are lab-certified and 100% authentic. Each item comes with a certificate of authenticity and is sourced from trusted suppliers who follow traditional methods.",
  },
  {
    question: `How should I use my ${product.title}?`,
    answer: `For best results with your ${product.title}, follow the traditional guidelines. Cleanse it regularly with appropriate methods and use it with positive intentions. Our experts can provide personalized guidance on usage.`,
  },
  {
    question: "Can anyone use this product?",
    answer: `Yes, our ${product.title} can be used by anyone seeking its benefits. However, for personalized recommendations based on your birth chart or specific needs, we recommend consulting with our expert astrologers.`,
  },
  {
    question: "How often should I cleanse or maintain this product?",
    answer: "Regular cleansing helps maintain the product's energy and effectiveness. Generally, cleansing once a month or when you feel its energy has diminished is recommended. Methods vary by product type.",
  },
  {
    question: `What makes this ${product.title} special?`,
    answer: `Our ${product.title} is handpicked for quality and authenticity. Each item is blessed by expert astrologers and designed to provide maximum benefits according to Vedic traditions and spiritual practices.`,
  },
  {
    question: "How long does shipping take?",
    answer: "We offer fast shipping with delivery within 3-5 business days across India. International shipping takes 7-14 business days depending on your location. All orders are carefully packaged for safe delivery.",
  },
  ];
};

// Related Products based on category (commented out as not currently used)
/*
interface RelatedProductData {
  id: number;
  title: string;
  image: string;
  price: string;
  originalPrice?: string;
  slug?: string;
  category?: string;
}

const getRelatedProducts = (currentProduct: RelatedProductData, allProducts: RelatedProductData[]) => {
  return allProducts
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4)
    .map(product => ({
      title: product.title,
      image: product.image,
      price: product.price,
      oldPrice: product.originalPrice,
      slug: product.slug,
    }));
};
*/

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  type UiProduct = {
    id: number;
    title: string;
    image: string;
    images?: string[];
    price: string;
    originalPrice?: string;
    slug?: string;
    description: string;
    detailedDescription?: string;
    category?: string;
    rating?: string;
  };

  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        // Using ID as the parameter (could be numeric ID or slug)
        const res = await fetch(`/api/products/${params.id}`);
        if (res.status === 404) {
          setLoading(false);
          setProduct(null);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const p = await res.json();
        // Interface for product media from API
        interface ProductMedia {
          media_url?: string;
          url?: string;
        }

        const images: string[] = Array.isArray(p.product_media) && p.product_media.length > 0
          ? p.product_media.map((m: ProductMedia) => m.media_url || m.url).filter(Boolean)
          : (p.image_url ? [p.image_url] : []);

        const mapped: UiProduct = {
          id: p.id,
          title: p.name,
          image: images[0] || '/images/products/default.jpg',
          images,
          price: `₹${p.price}`,
          originalPrice: p.original_price ? `₹${p.original_price}` : undefined,
          slug: p.slug,
          description: p.description || '',
          detailedDescription: p.product_meta?.[0]?.meta_description || undefined,
          category: p.category?.name,
          rating: '4.8'
        };
        setProduct(mapped);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load product';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  // React hooks must be called at the top level, before any conditional returns
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const { items, updateQuantity, addItem, removeItem } = useCart();

  // Real-time offer timer (generic 24 hour offer)
  const OFFER_DURATION = 24 * 60 * 60; // 24 hours in seconds
  const [secondsLeft, setSecondsLeft] = useState(OFFER_DURATION);

  // Find if this product is already in cart and get its quantity
  const productId = product ? String(product.id) : params.id;
  const cartItem = items.find(item => item.id === productId);
  const cartQuantity = cartItem?.quantity || 0;

  // Initialize local quantity with cart quantity only once when product loads
  useEffect(() => {
    if (cartQuantity > 0 && quantity === 1) {
      setQuantity(cartQuantity);
    }
  }, [cartQuantity, product?.id]); // Only sync when product changes

  // Reset quantity to 1 when switching between products if not in cart
  useEffect(() => {
    if (cartQuantity === 0) {
      setQuantity(1);
    }
  }, [product?.id]);

  // Timer effect
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  if (!loading && !product) return notFound();

  // Helper function for default detailed description
  const getDefaultDetailedDescription = (product: UiProduct) => {
    return `
      <div style="color: #374151; line-height: 1.8;">
        <h3 style="font-size: 1.5rem; font-weight: 600; color: #23244a; margin-bottom: 1rem; font-family: 'Playfair Display', serif;">About ${product.title}</h3>
        <p style="margin-bottom: 1rem; color: #4b5563;">${product.description}</p>
        
        
    `;
  };

  // Create product images array (using main image multiple times as placeholder)
  const productImages = product?.images && product.images.length > 0
    ? product.images
    : [product?.image || '/images/products/default.jpg'];

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!product?.originalPrice) return null;
    const original = Number(product.originalPrice.replace(/[^\d]/g, ''));
    const current = Number(product.price.replace(/[^\d]/g, ''));
    return Math.round(((original - current) / original) * 100);
  };

  const discount = getDiscountPercentage();

  // Format time function (commented out as not currently used)
  /*
  function formatTime(secs: number) {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h} hr : ${m} min : ${s} sec`;
  }
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const productFaqs = getProductFaqs(product);

  return (
    <>
      <style jsx global>{`
        *::-webkit-scrollbar {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
          background: transparent !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Left: Product Images */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-square bg-neutral-50 flex items-center justify-center p-3">
                  <Image
                    src={productImages[selectedImage]}
                    alt={product?.title || 'Product'}
                    width={320}
                    height={320}
                    className="object-cover w-full h-full rounded-xl"
                    priority
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="p-2.5 bg-white border-t border-neutral-100">
                    <div className="flex gap-1.5 overflow-x-auto">
                      {productImages.map((img, idx) => (
                        <button
                          key={`${img}-${idx}`}
                          onClick={() => setSelectedImage(idx)}
                          className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${
                            selectedImage === idx 
                              ? 'border-green-800 shadow-md' 
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <Image 
                            src={img} 
                            alt={product?.title || 'Product'} 
                            width={48} 
                            height={48} 
                            className="object-cover w-full h-full" 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col">
              {/* Product Header */}
              <div className="mb-0">
                {product?.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                    {product.category}
                  </span>
                )}
                <h1 className="text-xl lg:text-2xl font-serif font-bold text-neutral-900 mb-1">
                  {product?.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-base">★</span>
                    <span className="font-medium text-neutral-900 text-sm">{product?.rating}</span>
                  </div>
                  <span className="text-neutral-600 text-sm">Based on customer reviews</span>
                </div>
              </div>

              {/* Middle content that grows to push description to bottom */}
              <div className="flex flex-col gap-6 mt-3 flex-1">
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-2">
                    {secondsLeft === 0 ? (
                      <span className="text-xl font-bold text-neutral-900">
                        {product?.originalPrice || product?.price}
                      </span>
                    ) : (
                      <>
                        <span className="text-xl font-bold text-neutral-900">
                          {product?.price}
                        </span>
                        {product?.originalPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-400 line-through">
                              {product.originalPrice}
                            </span>
                            {discount !== null && discount > 0 && (
                              <span className="px-1.5 py-0.5 rounded-lg bg-green-100 text-green-800 text-xs font-semibold">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Quantity</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-neutral-300 rounded-lg">
                      <button
                        className="p-1.5 hover:bg-neutral-50 transition-colors rounded-l-lg"
                        onClick={() => {
                          const newQty = Math.max(0, quantity - 1);
                          setQuantity(newQty);
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium border-x border-neutral-300">
                        {quantity}
                      </span>
                      <button
                        className="p-1.5 hover:bg-neutral-50 transition-colors rounded-r-lg"
                        onClick={() => {
                          const newQty = quantity + 1;
                          setQuantity(newQty);
                        }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    {cartQuantity > 0 && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">
                        {cartQuantity} in cart
                      </span>
                    )}
                    {quantity !== cartQuantity && cartQuantity > 0 && (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                        Changed
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Estimation */}
                <div>
                  <div className="bg-neutral-50 rounded-lg p-2.5">
                    <h3 className="text-sm font-medium text-neutral-900 mb-1.5">
                      Check Delivery & Services
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-sm"
                      />
                      <button className="px-4 py-2 bg-green-800 text-white rounded-lg font-medium hover:bg-green-900 transition-colors text-sm">
                        Check
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-2">
                  <div className="space-y-2.5">
                     <button
                       onClick={async () => {
                         if (quantity === 0 && cartQuantity > 0) {
                           // Remove from cart
                           removeItem(productId);
                         } else if (cartQuantity > 0) {
                           // Update existing cart item
                           updateQuantity(productId, quantity);
                         } else if (quantity > 0) {
                           // Add new item to cart
                           addItem({
                             id: productId,
                             name: product?.title || '',
                             price: Number((product?.price || '0').replace(/[^\d]/g, '')),
                             image: product?.image || ''
                           }, quantity);
                         }
                       }}
                       disabled={cartQuantity > 0 && quantity === cartQuantity}
                       className={`w-full py-2.5 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 hover:shadow-xl ${
                         cartQuantity > 0 && quantity === cartQuantity
                           ? 'bg-green-900 cursor-not-allowed text-white'
                           : quantity === 0 && cartQuantity > 0
                             ? 'bg-red-600 hover:bg-red-700 text-white'
                             : 'bg-green-800 hover:bg-green-900 text-white'
                       }`}
                     >
                       {quantity === 0 && cartQuantity > 0 
                         ? 'Remove from Cart' 
                         : cartQuantity > 0 
                           ? (quantity !== cartQuantity ? 'Update Cart' : 'In Cart')
                           : 'Add to Cart'
                       }
                     </button>
                     <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-200">
                       Buy Now
                     </button>
                   </div>
                 </div>
              </div>

              {/* Product Description */}
              <div className="mt-4">
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors flex justify-between items-center"
                    onClick={() => setDescriptionOpen(!descriptionOpen)}
                    aria-expanded={descriptionOpen}
                  >
                    <span className="font-semibold text-neutral-900 text-sm">Product Description</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${descriptionOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {descriptionOpen && (
                      <motion.div
                        key="description-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-neutral-200 bg-white">
                          <div 
                            className="text-neutral-700 leading-relaxed text-sm"
                            dangerouslySetInnerHTML={{ 
                              __html: product?.detailedDescription || (product ? getDefaultDetailedDescription(product) : '')
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Purchase Information Cards */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
              Our Promise to You
            </h2>
            <p className="text-lg text-neutral-600">
              Quality, authenticity, and customer satisfaction guaranteed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shipping Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Free Shipping</h3>
              <div className="text-neutral-600 space-y-2 mb-6">
                <p>• Complimentary delivery across India</p>
                <p>• Cash on Delivery available</p>
                <p>• Secure packaging guaranteed</p>
              </div>
              <a 
                href="/shipping-policy"
                className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors font-medium"
              >
                Learn More
              </a>
            </div>

            {/* Returns Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Easy Returns</h3>
              <div className="text-neutral-600 space-y-2 mb-6">
                <p>• 7-day easy return on gemstones</p>
                <p>• Hassle-free return process</p>
                <p>• Quality guarantee</p>
              </div>
              <a 
                href="/return-policy"
                className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors font-medium"
              >
                Learn More
              </a>
            </div>

            {/* Payment Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Secure Payment</h3>
              <div className="text-neutral-600 space-y-2 mb-6">
                <p>• All major cards accepted</p>
                <p>• Net Banking & UPI available</p>
                <p>• 100% secure checkout</p>
              </div>
              <button className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors font-medium">
                Secure Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Product Assurance */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
                Quality Assurance
              </h2>
              <p className="text-lg text-neutral-600">
                Every product meets our highest standards
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Purity Promise
                </h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Certified Natural
                </h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Ethical Sourcing
                </h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Aura Tuned
                </h3>
              </div>
              
              <div className="text-center col-span-2 md:col-span-1">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Free Delivery
                </h3>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Sections */}
        <div className="w-full bg-gradient-to-b from-neutral-50 to-white">
          {/* Service Carousels */}
          <div className="py-16">
            <ServiceCarousels />
          </div>
          
          {/* Nakshatra Gyaan Banner */}
          <div className="py-8">
            <NakshatraGyaanBanner />
          </div>
          
          {/* Spiritual Journey Banner */}
          <div className="py-8">
            <SpiritualJourneyBanner />
          </div>
          
          {/* Testimonials */}
          <div className="py-16">
            <Testimonials />
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to know about this product
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {productFaqs.map((faq, idx) => {
                const isOpen = openFaqs.has(idx);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <button
                      className="w-full text-left p-6 flex justify-between items-center hover:bg-neutral-50 transition-colors"
                      onClick={() => {
                        const newOpenFaqs = new Set(openFaqs);
                        if (isOpen) {
                          newOpenFaqs.delete(idx);
                        } else {
                          newOpenFaqs.add(idx);
                        }
                        setOpenFaqs(newOpenFaqs);
                      }}
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-neutral-900 text-lg pr-4">
                        {faq.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 border-t border-neutral-100">
                            <div className="pt-4 text-neutral-700 leading-relaxed">
                              {faq.answer}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <Testimonials />
      </div>
    </>
  );
}
