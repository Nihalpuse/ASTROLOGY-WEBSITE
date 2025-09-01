
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
  const { items, updateQuantity } = useCart();

  // Real-time offer timer (generic 24 hour offer)
  const OFFER_DURATION = 24 * 60 * 60; // 24 hours in seconds
  const [secondsLeft, setSecondsLeft] = useState(OFFER_DURATION);

  // Find if this product is already in cart and get its quantity
  const productId = product ? String(product.id) : params.id;
  const cartItem = items.find(item => item.id === productId);
  const cartQuantity = cartItem?.quantity || 0;

  // Sync local quantity with cart quantity when cart changes
  useEffect(() => {
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
    }
  }, [cartQuantity]);

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-start py-6 px-2 md:px-0 mt-8">
        {/* Main Product Section with Fixed Left and Scrollable Right */}
        <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-8 relative">
          {/* Left: Fixed Image Section */}
          <div className="lg:w-1/2 lg:sticky lg:top-8 lg:self-start flex flex-col items-center">
            <div className="w-full rounded-xl overflow-hidden bg-[#f7f5ed] flex items-center justify-center mb-3" style={{ aspectRatio: '1/1', maxWidth: 400 }}>
              <Image
                src={productImages[selectedImage]}
                alt={product?.title || 'Product'}
                width={380}
                height={380}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="flex flex-row gap-2 w-full overflow-x-auto pb-2 justify-center">
              {productImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded-lg border-2 ${selectedImage === idx ? 'border-black' : 'border-transparent'} overflow-hidden focus:outline-none`}
                  style={{ minWidth: 64, minHeight: 64 }}
                >
                  <Image src={img} alt={product?.title || 'Product'} width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Scrollable Product Info Section */}
          <div className="lg:w-1/2 flex flex-col gap-4 lg:max-h-screen lg:overflow-y-auto lg:pr-4" style={{ scrollbarWidth: 'thin' }}>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#23244a]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>{product?.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#FFD700] text-lg">&#9733;</span>
              <span className="text-base font-medium text-[#23244a]">{product?.rating}</span>
              <span className="text-sm text-[#23244a]">Based on customer reviews</span>
            </div>
            <div className="flex gap-2 mt-2">
              {product?.category && (
                <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{product.category}</span>
              )}
              <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Authentic</span>
              <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Premium</span>
            </div>
            <div className="flex items-end gap-3 mt-3">
              {secondsLeft === 0 ? (
                <span className="text-xl font-bold text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>{product?.originalPrice || product?.price}</span>
              ) : (
                <>
                  <span className="text-xl font-bold text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>{product?.price}</span>
                  {product?.originalPrice && (
                    <>
                      <span className="text-base text-gray-400 line-through">{product.originalPrice}</span>
                      {discount && <span className="text-base font-semibold text-green-700">{discount}% OFF</span>}
                    </>
                  )}
                </>
              )}
            </div>
         
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-[#23244a]">Quantity</span>
              <button
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-[#23244a] bg-white"
                onClick={() => {
                  const newQty = Math.max(1, quantity - 1);
                  setQuantity(newQty);
                  if (cartQuantity > 0) {
                    updateQuantity(productId, newQty);
                  }
                }}
              >-</button>
              <span className="text-base font-medium text-[#23244a] w-7 text-center">{quantity}</span>
              <button
                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold text-[#23244a] bg-white"
                onClick={() => {
                  const newQty = quantity + 1;
                  setQuantity(newQty);
                  if (cartQuantity > 0) {
                    updateQuantity(productId, newQty);
                  }
                }}
              >+</button>
              {cartQuantity > 0 && (
                <span className="text-xs text-green-600 ml-2">({cartQuantity} in cart)</span>
              )}
            </div>
            
            
            {/* Delivery Date Input */}
            <div className="mt-3 bg-gray-100 rounded-lg p-3 flex flex-col gap-2">
              <span className="text-xs font-medium text-[#23244a]">ESTIMATED DELIVERY DATE</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your pincode"
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  className="rounded-md px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#23244a] bg-white"
                  style={{ maxWidth: 120 }}
                />
                <button className="bg-black text-white px-4 py-1.5 rounded-md font-semibold text-sm hover:bg-[#23244a] transition">CHECK</button>
              </div>
            </div>
            
            {/* Add to Cart / Buy Now */}
            <div className="flex gap-3 mt-5">
              <UniversalCartButton
                productId={productId}
                productName={product?.title || ''}
                price={Number((product?.price || '0').replace(/[^\d]/g, ''))}
                image={product?.image || ''}
                quantity={quantity}
                className="flex-1 bg-black text-white py-3 rounded-md font-semibold text-base hover:bg-[#23244a] transition"
              >
                {cartQuantity > 0 ? 'UPDATE CART' : 'ADD TO CART'}
              </UniversalCartButton>
              <button className="flex-1 bg-yellow-400 text-black py-3 rounded-md font-semibold text-base hover:bg-yellow-500 transition">BUY IT NOW</button>
            </div>

            {/* Product Description Dropdown */}
            <div className="mt-6 border border-gray-200 rounded-lg">
              <button
                className="w-full text-left p-4 font-medium text-[#23244a] cursor-pointer text-base focus:outline-none flex justify-between items-center hover:bg-gray-50"
                onClick={() => setDescriptionOpen(!descriptionOpen)}
                aria-expanded={descriptionOpen}
              >
                <span className="font-semibold">Product Description</span>
                <span className={`ml-2 transition-transform text-lg ${descriptionOpen ? 'rotate-90' : ''}`}>▶</span>
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
                    <div className="p-4 pt-0 border-t border-gray-100">
                      <div 
                        className="product-description"
                        style={{
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#374151'
                        }}
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
        {/* ProductPurchaseInfo */}
        <div className="w-full flex justify-center px-2 md:px-0 my-8">
          <div className="max-w-5xl w-full bg-[#F9F6F2] rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="py-8 md:py-12 px-4 md:px-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 md:mb-10 text-black text-center tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.08em' }}>
                BEFORE YOU BUY: OUR PROMISE
              </h2>
              <div className="flex flex-col md:flex-row w-full justify-between items-stretch gap-4 md:gap-8">
                {/* SHIPPING */}
                <div className="flex flex-col items-center flex-1 min-w-0 mb-8 md:mb-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-6 h-6 md:w-8 md:h-8">
                      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" stroke="#FFD600" strokeWidth="1.5" fill="none"/><path d="M10 22h12M16 10v12" stroke="#FFD600" strokeWidth="1.2"/></svg>
                    </div>
                    <div className="mt-2 md:mt-3 text-base md:text-lg font-bold text-black tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.08em' }}>SHIPPING</div>
                    <div className="mt-2 mb-4 text-black w-full text-sm md:text-base">
                      <ul className="list-disc ml-6 text-base" style={{fontFamily: 'Lora, Georgia, serif', color: 'black'}}>
                        <li>Complimentary delivery across India</li>
                        <li>Cash on Delivery available for all orders</li>
                      </ul>
                    </div>
                    <a href="/shipping-policy" className="mt-auto px-4 md:px-6 py-2 border border-black text-black rounded transition hover:bg-black hover:text-white text-xs md:text-sm font-medium" style={{minWidth:100, fontFamily: 'Inter, Montserrat, Playfair Display, Arial, sans-serif'}}>
                      Learn More
                    </a>
                  </div>
                </div>
                {/* Separator */}
                <div className="hidden md:flex items-center" style={{height:180, width:0}}>
                  <div className="h-32 border-r" style={{borderColor: '#FFD600'}} />
                </div>
                {/* RETURNS */}
                <div className="flex flex-col items-center flex-1 min-w-0 mb-8 md:mb-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-6 h-6 md:w-8 md:h-8">
                      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" stroke="#FFD600" strokeWidth="1.5" fill="none"/><rect x="12" y="12" width="8" height="8" stroke="#FFD600" strokeWidth="1.2" fill="none"/></svg>
                    </div>
                    <div className="mt-2 md:mt-3 text-base md:text-lg font-bold text-black tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.08em' }}>RETURNS</div>
                    <div className="mt-2 mb-4 text-black w-full text-sm md:text-base">
                      <ul className="list-disc ml-6 text-base" style={{fontFamily: 'Lora, Georgia, serif', color: 'black'}}>
                        <li>7-day easy return on loose gemstones</li>
                        <li>Taxes, duties, and shipping are non-refundable</li>
                      </ul>
                    </div>
                    <a href="/return-policy" className="mt-auto px-4 md:px-6 py-2 border border-black text-black rounded transition hover:bg-black hover:text-white text-xs md:text-sm font-medium" style={{minWidth:100, fontFamily: 'Inter, Montserrat, Playfair Display, Arial, sans-serif'}}>
                      Learn More
                    </a>
                  </div>
                </div>
                {/* Separator */}
                <div className="hidden md:flex items-center" style={{height:180, width:0}}>
                  <div className="h-32 border-r" style={{borderColor: '#FFD600'}} />
                </div>
                {/* PAYMENT */}
                <div className="flex flex-col items-center flex-1 min-w-0 mb-8 md:mb-0">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-6 h-6 md:w-8 md:h-8">
                      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" stroke="#FFD600" strokeWidth="1.5" fill="none"/><path d="M10 18l3.5 3.5L22 13" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                    </div>
                    <div className="mt-2 md:mt-3 text-base md:text-lg font-bold text-black tracking-wide uppercase" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.08em' }}>PAYMENT</div>
                    <div className="mt-2 mb-4 text-black w-full text-sm md:text-base">
                      <ul className="list-disc ml-6 text-base" style={{fontFamily: 'Lora, Georgia, serif', color: 'black'}}>
                        <li>All major credit & debit cards accepted</li>
                        <li>Net Banking & UPI available</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ProductAssuranceBar */}
        <div className="w-full flex justify-center px-2 md:px-0 my-8">
          <div className="max-w-5xl w-full bg-[#F9F6F2] rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="py-8 md:py-12 px-4 md:px-8">
              {/* Mobile: 2 rows (3+2), Desktop: 1 row */}
              <div className="w-full">
                {/* Mobile layout */}
                <div className="flex flex-col gap-6 md:hidden">
                  <div className="flex w-full justify-between items-center">
                    {/* Row 1: 3 items */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <svg width="40" height="40" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M15 25l5 5 9-13" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M22 14l3 6h-6l3-6z" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                      </div>
                      <span className="mt-2 text-xs font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.06em', fontFamily: 'Playfair Display, serif'}}>PURITY<br/>PROMISE</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <svg width="40" height="40" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M22 14v12" stroke="#FFD600" strokeWidth="2"/><circle cx="22" cy="32" r="2.5" fill="#FFD600"/></svg>
                      </div>
                      <span className="mt-2 text-xs font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.06em', fontFamily: 'Playfair Display, serif'}}>CERTIFIED<br/>NATURAL</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <svg width="40" height="40" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><circle cx="22" cy="22" r="7" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                      </div>
                      <span className="mt-2 text-xs font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.06em', fontFamily: 'Playfair Display, serif'}}>ETHICAL<br/>SOURCING</span>
                    </div>
                  </div>
                  <div className="flex w-full justify-center gap-16">
                    {/* Row 2: 2 items */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <svg width="40" height="40" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><rect x="16" y="16" width="12" height="12" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                      </div>
                      <span className="mt-2 text-xs font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.06em', fontFamily: 'Playfair Display, serif'}}>AURA<br/>TUNED</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <svg width="40" height="40" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M15 32h14M22 14v18" stroke="#FFD600" strokeWidth="1.5"/></svg>
                      </div>
                      <span className="mt-2 text-xs font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.06em', fontFamily: 'Playfair Display, serif'}}>FREE<br/>DELIVERY</span>
                    </div>
                  </div>
                </div>

                {/* Desktop layout - consistent with mobile */}
                <div className="hidden md:flex w-full justify-between items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg width="48" height="48" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M15 25l5 5 9-13" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M22 14l3 6h-6l3-6z" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                    </div>
                    <span className="mt-3 text-sm font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.08em', fontFamily: 'Playfair Display, serif'}}>PURITY<br/>PROMISE</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg width="48" height="48" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M22 14v12" stroke="#FFD600" strokeWidth="2"/><circle cx="22" cy="32" r="2.5" fill="#FFD600"/></svg>
                    </div>
                    <span className="mt-3 text-sm font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.08em', fontFamily: 'Playfair Display, serif'}}>CERTIFIED<br/>NATURAL</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg width="48" height="48" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><circle cx="22" cy="22" r="7" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                    </div>
                    <span className="mt-3 text-sm font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.08em', fontFamily: 'Playfair Display, serif'}}>ETHICAL<br/>SOURCING</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg width="48" height="48" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><rect x="16" y="16" width="12" height="12" stroke="#FFD600" strokeWidth="1.5" fill="none"/></svg>
                    </div>
                    <span className="mt-3 text-sm font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.08em', fontFamily: 'Playfair Display, serif'}}>AURA<br/>TUNED</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <svg width="48" height="48" fill="none" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" stroke="#FFD600" strokeWidth="2" fill="none"/><path d="M15 32h14M22 14v18" stroke="#FFD600" strokeWidth="1.5"/></svg>
                    </div>
                    <span className="mt-3 text-sm font-bold text-black tracking-wide uppercase text-center" style={{letterSpacing: '0.08em', fontFamily: 'Playfair Display, serif'}}>FREE<br/>DELIVERY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Full-width ServiceCarousels */}
        <div className="w-screen overflow-x-clip" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <ServiceCarousels />
        </div>
        {/* Nakshatra Gyaan Banner */}
        <NakshatraGyaanBanner />
        {/* Related Products - Commented out */}
        {/*
        <div className="w-screen overflow-x-clip mb-16" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-[#23244a] text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Related Products</h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4 md:px-8">
            {getRelatedProducts(product, products).map(relatedProduct => (
              <div key={relatedProduct.slug} className="group">
                <ProductServiceCard
                  image={relatedProduct.image}
                  title={relatedProduct.title}
                  description={relatedProduct.oldPrice ? `${relatedProduct.price} (was ${relatedProduct.oldPrice})` : relatedProduct.price}
                  badge={relatedProduct.oldPrice ? 'Recommended' : ''}
                  href={`/shop/${relatedProduct.slug}`}
                />
              </div>
            ))}
          </div>
        </div>
        */}
        {/* Spiritual Journey Banner */}
        <SpiritualJourneyBanner />
        
        {/* FAQ Section - Moved to end */}
        <div className="w-screen overflow-x-clip mt-14 mb-10" style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
          <div className="max-w-5xl w-full mx-auto px-2 md:px-0">
            <h2 className="text-2xl md:text-3xl font-semibold mb-7 text-[#23244a] text-center" style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.02em' }}>Frequently Asked Questions</h2>
            <div className="space-y-5 w-full">
              {productFaqs.map((faq, idx) => {
                const isOpen = openFaqs.has(idx);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    className="rounded-xl border border-gray-200 bg-white/80 shadow-md p-4 group hover:shadow-lg transition-all w-full"
                  >
                    <button
                      className="w-full text-left font-medium text-[#23244a] cursor-pointer text-base group-open:text-[#77A656] focus:outline-none flex justify-between items-center"
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
                      {faq.question}
                      <span className={`ml-2 transition-transform text-lg ${isOpen ? 'rotate-90' : ''}`}>▶</span>
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
                          <div className="mt-2 text-[#2C3A4B] text-sm leading-relaxed">{faq.answer}</div>
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
