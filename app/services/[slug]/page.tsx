"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { notFound } from 'next/navigation';
import { FaClock, FaStar, FaVideo, FaShoppingCart, FaShieldAlt, FaRegStar, FaRegLightbulb, FaRegSmile, FaRegHeart, FaRegComments, FaRegSun, FaRegGem } from 'react-icons/fa';
import { UniversalCartButton } from '@/app/components/UniversalCartButton';
import RelatedServices from '@/app/components/RelatedServices';
import Link from 'next/link';

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

// Generic FAQs for services
const getServiceFaqs = (service: Service) => [
  {
    question: `What is ${service.title} and what are its benefits?`,
    answer: `${service.title} is ${service.description}. This consultation provides personalized guidance based on ancient Vedic astrology principles to help you make informed decisions about your life.`,
  },
  {
    question: `How long is the ${service.title} session?`,
    answer: `The session duration is ${service.duration || 'as per consultation'}. This gives our expert astrologers enough time to thoroughly analyze your birth chart and provide comprehensive guidance.`,
  },
  {
    question: `What type of consultation is this?`,
    answer: `This is a ${service.delivery_type || 'online'} session. You can choose the format that's most convenient for you, and our astrologers will provide the same quality of guidance regardless of the medium.`,
  },
  {
    question: "What information do I need to provide?",
    answer: "You'll need your exact birth date, time, and place of birth for accurate chart calculation. If you don't have your birth time, our astrologers can work with available information to provide guidance.",
  },
  {
    question: "How accurate are the predictions?",
    answer: "Vedic astrology is highly accurate when performed by experienced astrologers. The accuracy depends on precise birth data and the astrologer's expertise. Our predictions are based on time-tested techniques and deep spiritual knowledge.",
  },
  {
    question: `What makes this ${service.title} special?`,
    answer: `Our ${service.title} combines traditional Vedic wisdom with modern insights. Each session is personalized and designed to provide practical guidance that you can implement in your daily life for positive transformation.`,
  },
  {
    question: "Can I ask follow-up questions?",
    answer: "Yes, our sessions are interactive. You can ask questions and seek clarification during the consultation. Our goal is to ensure you leave with complete understanding and actionable guidance.",
  },
];

export default function ServicePage({ params }: { params: { slug: string } }) {
  // Move all hooks to the top before any conditional returns
  const [selectedImage, setSelectedImage] = useState(0);
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service data from backend
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/services/slug/${params.slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Service not found');
            return;
          }
          throw new Error('Failed to fetch service');
        }
        
        const data = await response.json();
        setService(data.service);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [params.slug]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Service not found</h3>
          <p className="text-gray-600 mb-6">{error || 'The requested service could not be found.'}</p>
          <Link 
            href="/services/all"
            className="bg-green-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors"
          >
            Browse All Services
          </Link>
        </div>
      </div>
    );
  }

  // Helper function for default detailed description
  const getDefaultDetailedDescription = (service: Service) => {
    return `
      <div style="color: #374151; line-height: 1.8;">
        <h3 style="font-size: 1.5rem; font-weight: 600; color: #23244a; margin-bottom: 1rem; font-family: 'Playfair Display', serif;">About ${service.title}</h3>
        <p style="margin-bottom: 1rem; color: #4b5563;">${service.description}</p>
        
        <h4 style="font-size: 1.25rem; font-weight: 600; color: #23244a; margin-top: 1.5rem; margin-bottom: 0.75rem;">What You'll Get:</h4>
        <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Personalized consultation based on your birth chart</li>
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Expert guidance from experienced astrologers</li>
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Practical remedies and solutions</li>
        </ul>
        
        <h4 style="font-size: 1.25rem; font-weight: 600; color: #23244a; margin-top: 1.5rem; margin-bottom: 0.75rem;">Benefits:</h4>
        <ul style="margin-bottom: 1.5rem; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Clear insights into your life path and purpose</li>
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Guidance for important life decisions</li>
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Understanding of karmic patterns and challenges</li>
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Spiritual remedies for harmony and success</li>
          <li style="margin-bottom: 0.5rem; color: #4b5563;">Personalized recommendations for growth</li>
        </ul>
        
        <h4 style="font-size: 1.25rem; font-weight: 600; color: #23244a; margin-top: 1.5rem; margin-bottom: 0.75rem;">Consultation Process:</h4>
        <p style="margin-bottom: 1rem; color: #4b5563;">Our consultation is conducted through ${service.delivery_type || 'online'} and lasts ${service.duration || 'as per consultation'}. You'll receive personalized insights based on your birth chart analysis and can ask questions throughout the session.</p>
      </div>
    `;
  };

  // Create service images array from backend media
  const serviceImages = service.service_media && service.service_media.length > 0 
    ? service.service_media
        .filter(media => media.is_active)
        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
        .map(media => media.media_url)
    : ['/images/astro.jpg'];

  // Calculate discount percentage (if needed)
  const getDiscountPercentage = () => {
    // Since we don't have originalPrice in backend, return null
    return null;
  };

  const discount = getDiscountPercentage();
  const serviceFaqs = getServiceFaqs(service);

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
          {/* Main Service Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Left: Service Images */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-square bg-neutral-50 flex items-center justify-center p-3">
                  <Image
                    src={serviceImages[selectedImage]}
                    alt={service.title}
                    width={320}
                    height={320}
                    className="object-cover w-full h-full rounded-xl"
                    priority
                  />
                </div>
                {serviceImages.length > 1 && (
                  <div className="p-2.5 bg-white border-t border-neutral-100">
                    <div className="flex gap-1.5 overflow-x-auto">
                      {serviceImages.map((img, idx) => (
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
                            alt={service.title} 
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

            {/* Right: Service Info */}
            <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col">
              {/* Service Header */}
              <div className="mb-0">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                  {service.delivery_type || 'Consultation'}
                </span>
                <h1 className="text-xl lg:text-2xl font-serif font-bold text-neutral-900 mb-1">
                  {service.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-base">★</span>
                    <span className="font-medium text-neutral-900 text-sm">4.5</span>
                  </div>
                  <span className="text-neutral-600 text-sm">(50+ reviews)</span>
                </div>
              </div>

              {/* Middle content that grows to push description to bottom */}
              <div className="flex flex-col gap-6 mt-3 flex-1">
                {/* Pricing */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-neutral-900">
                      ₹{service.price}
                    </span>
                  </div>
                </div>

                {/* Service Details - Vertical Layout */}
                <div>
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-neutral-900 mb-4">
                      Consultation Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <FaClock className="text-purple-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Duration</p>
                          <p className="text-sm text-neutral-600">{service.duration || 'Flexible timing'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <FaVideo className="text-green-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Consultation Type</p>
                          <p className="text-sm text-neutral-600">{service.delivery_type || 'Online consultation'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaRegStar className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Expert Guidance</p>
                          <p className="text-sm text-neutral-600">Certified Vedic astrologers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Consultation Button - Above Description */}
              <div className="mt-4">
                <UniversalCartButton
                  productId={service.id.toString()}
                  productName={service.title}
                  price={service.price}
                  className="w-full py-3 bg-green-800 hover:bg-green-900 text-white rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  Book Consultation
                </UniversalCartButton>
              </div>

              {/* Service Description */}
              <div className="mt-4">
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full text-left p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors flex justify-between items-center"
                    onClick={() => setDescriptionOpen(!descriptionOpen)}
                    aria-expanded={descriptionOpen}
                  >
                    <span className="font-semibold text-neutral-900 text-sm">Service Description</span>
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
                              __html: getDefaultDetailedDescription(service)
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

        {/* Consultation Promise Cards */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
              Our Promise to You
            </h2>
            <p className="text-lg text-neutral-600">
              Expert guidance, confidentiality, and customer satisfaction guaranteed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Expert Guidance Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <FaRegStar className="text-2xl text-green-800" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Expert Guidance</h3>
              <div className="text-neutral-600 space-y-2 mb-6">
                <p>• Certified Vedic astrologers</p>
                <p>• Personalized consultations</p>
                <p>• Traditional wisdom with modern insights</p>
              </div>
              <a 
                href="/about"
                className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors font-medium"
              >
                Learn More
              </a>
            </div>

            {/* Privacy Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-2xl text-green-800" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Complete Privacy</h3>
              <div className="text-neutral-600 space-y-2 mb-6">
                <p>• 100% confidential sessions</p>
                <p>• Secure data protection</p>
                <p>• Private consultation environment</p>
              </div>
              <a 
                href="/privacy-policy"
                className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors font-medium"
              >
                Learn More
              </a>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <FaRegComments className="text-2xl text-green-800" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-4">24/7 Support</h3>
              <div className="text-neutral-600 space-y-2 mb-6">
                <p>• Round-the-clock customer support</p>
                <p>• Follow-up guidance available</p>
                <p>• Multiple communication channels</p>
              </div>
              <a 
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-xl hover:bg-green-900 transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Service Quality Assurance */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
                Quality Assurance
              </h2>
              <p className="text-lg text-neutral-600">
                Every consultation meets our highest standards
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaRegStar className="text-2xl text-green-800" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Expert Guidance
                </h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaShieldAlt className="text-2xl text-green-800" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Authentic Vedic
                </h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaRegHeart className="text-2xl text-green-800" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Personalized Approach
                </h3>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaClock className="text-2xl text-green-800" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Timely Sessions
                </h3>
              </div>
              
              <div className="text-center col-span-2 md:col-span-1">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <FaVideo className="text-2xl text-green-800" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm uppercase tracking-wide">
                  Online & Offline
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600">
              Everything you need to know about this service
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {serviceFaqs.map((faq, idx) => {
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

        {/* Related Services */}
        <div className="max-w-7xl mx-auto mb-16">
          <RelatedServices 
            currentServiceId={service.id.toString()}
            category={service.delivery_type || 'Astrology'}
            title="Related Services"
            maxItems={4}
            className="mt-8"
          />
        </div>
      </div>
    </>
  );
}
