'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Subcategory interface
interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

// Category interface to match backend data
interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  subcategories: Subcategory[];
}

// Color schemes for categories - will be assigned dynamically
const colorSchemes = [
  {
    color: 'from-emerald-300 via-green-400 to-teal-400',
    shadowColor: 'shadow-emerald-400/40',
    glowColor: 'shadow-emerald-300/50'
  },
  {
    color: 'from-amber-300 via-orange-300 to-yellow-400',
    shadowColor: 'shadow-amber-400/40',
    glowColor: 'shadow-amber-300/50'
  },
  {
    color: 'from-rose-300 via-pink-300 to-rose-400',
    shadowColor: 'shadow-rose-400/40',
    glowColor: 'shadow-rose-300/50'
  },
  {
    color: 'from-yellow-300 via-amber-300 to-orange-300',
    shadowColor: 'shadow-yellow-400/40',
    glowColor: 'shadow-yellow-300/50'
  },
  {
    color: 'from-blue-300 via-cyan-300 to-teal-300',
    shadowColor: 'shadow-blue-400/40',
    glowColor: 'shadow-blue-300/50'
  },
  {
    color: 'from-purple-300 via-indigo-300 to-blue-400',
    shadowColor: 'shadow-purple-400/40',
    glowColor: 'shadow-purple-300/50'
  },
  {
    color: 'from-red-300 via-pink-300 to-rose-400',
    shadowColor: 'shadow-red-400/40',
    glowColor: 'shadow-red-300/50'
  },
  {
    color: 'from-green-300 via-emerald-300 to-teal-400',
    shadowColor: 'shadow-green-400/40',
    glowColor: 'shadow-green-300/50'
  }
];

// CINEMATIC ANIMATION VARIANTS
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

// HEROIC ENTRANCE - RIGHT TO LEFT SLIDE
const heroicSlideVariants = {
  hidden: { 
    x: 150,
    opacity: 0,
    scale: 0.8,
    rotateY: 45
  },
  visible: { 
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// SIMPLE FRONT SCALE HOVER EFFECTS
const iconHoverVariants = {
  rest: { 
    scale: 1
  },
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300
    }
  }
};

// PAGE TRANSITION VARIANTS
const pageExitVariants = {
  exit: {
    x: '100vw',
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1]
    }
  }
};

export default function ShopCategoriesMinimal() {
  const ref = useRef(null);
  const router = useRouter();
  const isInView = useInView(ref, { once: true, margin: "-150px" });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error loading categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to get color scheme for a category
  const getColorScheme = (index: number) => {
    // Return a unified amber gradient and shadow for all categories to match ZodiacCategories
    return {
      color: 'from-amber-300 via-amber-400 to-amber-500',
      shadowColor: 'shadow-amber-500/30',
      glowColor: 'shadow-amber-500/20'
    };
  };

  // CINEMATIC PAGE TRANSITION
  const handleExploreMore = async () => {
    setIsTransitioning(true);
    
    // Create cinematic exit animation
    document.body.style.overflow = 'hidden';
    
    // Wait for exit animation
    setTimeout(() => {
      router.push('/shop/categories');
    }, 800);
  };

  return (
    <>
      {/* Custom styles to hide scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
      
      {/* ELEGANT PAGE EXIT OVERLAY - BOOK PAGE TURNING */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-r from-amber-50 via-white to-amber-50"
            initial={{ x: '-100vw' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          />
        )}
      </AnimatePresence>

      <section 
        className="w-screen py-20 relative overflow-visible bg-gradient-to-b from-transparent via-white/50 to-transparent"
        style={{ 
          marginLeft: 'calc(-50vw + 50%)', 
          marginRight: 'calc(-50vw + 50%)',
          maxWidth: '100vw'
        }}
      >
        
        <div className="w-full px-8 md:px-16 lg:px-20 relative z-10">
          
          {/* CINEMATIC HEADER */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -50, rotateX: -30 }}
            animate={isInView ? { 
              opacity: 1, 
              y: 0, 
              rotateX: 0,
              transition: { 
                duration: 1.2, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2 
              }
            } : {}}
          >
            <h2 className="text-4xl md:text-5xl font-light mb-4 bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 bg-clip-text text-transparent">
              Sacred Categories
            </h2>
            
            {/* ANIMATED UNDERLINE */}
            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 mx-auto rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isInView ? { 
                scaleX: 1, 
                opacity: 1,
                transition: { duration: 1, delay: 0.8 }
              } : {}}
            />
          </motion.div>

          {/* HEROIC CATEGORIES GRID WITH SCROLL */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mb-16 max-w-none overflow-visible"
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                <span className="ml-4 text-lg text-gray-600">Loading sacred realms...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-lg text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-gray-600">No categories found. Create your first category!</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-8 pt-8 relative hide-scrollbar overflow-y-visible" style={{ scrollBehavior: 'smooth' }}>
                {/* Left fade indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-10" />
                
                {/* Right fade indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-10" />
                
                {/* Scroll hint */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 pointer-events-none z-10">
                  ← Scroll to explore →
                </div>
                
                <div className="flex gap-8 md:gap-10 lg:gap-12 min-w-max px-6 py-4">
                  {categories.map((category, index) => {
                    const colorScheme = getColorScheme(index);
                    return (
                      <motion.div
                        key={category.id}
                        variants={heroicSlideVariants}
                        className="flex flex-col items-center min-w-[140px] md:min-w-[160px] lg:min-w-[180px]"
                      >
                        <Link href={`/shop/category/${category.slug}`}>
                          <motion.div
                            variants={iconHoverVariants}
                            initial="rest"
                            whileHover="hover"
                            className="relative cursor-pointer"
                          >
                            {/* MAIN CIRCLE - MUCH LARGER SIZE WITH IMAGE */}
                            <motion.div
                              className={`relative w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full bg-gradient-to-br ${colorScheme.color} shadow-lg ${colorScheme.shadowColor} border-3 border-white/40 overflow-hidden`}
                              whileHover={{
                                scale: 1.15,
                                boxShadow: '0 25px 50px rgba(251, 146, 60, 0.4)',
                                transition: { duration: 0.3 }
                              }}
                            >
                              {/* CATEGORY IMAGE */}
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                {category.image_url ? (
                                  <Image
                                    src={category.image_url}
                                    alt={category.name}
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 768px) 112px, (max-width: 1024px) 128px, (max-width: 1280px) 144px, 160px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                    <span className="text-3xl text-gray-500">📷</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* SUBTLE COLOR OVERLAY */}
                              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorScheme.color} opacity-30 mix-blend-soft-light`} />
                              
                              {/* INNER GLOW BORDER */}
                              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                            </motion.div>
                          </motion.div>
                        </Link>

                        {/* CATEGORY NAME */}
                        <motion.h3
                          className="mt-4 text-center text-sm md:text-base lg:text-lg font-semibold text-slate-700"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={isInView ? {
                            opacity: 1,
                            y: 0,
                            transition: {
                              delay: 0.8 + index * 0.2,
                              duration: 0.6
                            }
                          } : {}}
                        >
                          {category.name}
                        </motion.h3>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* CINEMATIC EXPLORE MORE BUTTON */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={isInView ? {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                delay: 1.8,
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            } : {}}
          >
            <motion.button
              onClick={handleExploreMore}
              className="relative px-12 py-4 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white font-semibold rounded-full shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 text-lg overflow-hidden"
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
              }}
              whileTap={{ scale: 0.98 }}
              disabled={isTransitioning}
            >
              {/* SHIMMER EFFECT */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: [-300, 300]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />
              
              <span className="relative flex items-center space-x-3">
                <span>{isTransitioning ? 'Opening Portal...' : 'Explore More Realms'}</span>
                <motion.svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{
                    x: [0, 5, 0],
                    rotate: isTransitioning ? [0, 360] : 0
                  }}
                  transition={{
                    x: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 1, repeat: Infinity }
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </>
  );
} 