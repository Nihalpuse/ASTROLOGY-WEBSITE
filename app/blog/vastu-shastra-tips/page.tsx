'use client'

import { useState, useEffect } from 'react';
import { User, Calendar, BookOpen, HelpCircle } from 'lucide-react';
import { blogPosts } from '../../data/blogPosts';
import Image from 'next/image';
import Link from 'next/link';
import { CTASection } from '../../components/CTASection';
import { motion } from 'framer-motion';

const post = blogPosts['vastu-shastra-tips'];
const nextInSeries = blogPosts['gemstones-and-powers']
const tabs = ['Overview', 'Principles', 'Remedies', 'FAQs'];

export default function VastuShastraTipsPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [email, setEmail] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-white pt-0 md:pt-2">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-4 leading-tight">
                {post.title.en}
              </h1>
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-6 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author.en}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {post.category}</span>
              </div>
            </div>
            {/* Hero Image */}
            <div className="w-full h-64 md:h-96 relative mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image src={post.imageUrl} alt={post.title.en} fill className="object-cover" />
            </div>
            {/* Intro */}
            <div className="mb-8 text-lg leading-relaxed text-gray-700 space-y-6 text-justify">
              <p>
                {post.content.en.split('\n')[0]}
              </p>
              <p>
                <span className="font-semibold text-indigo-700">What is Vastu Shastra?</span> Vastu Shastra is an ancient Indian science of architecture and design that harmonizes human dwellings with natural and cosmic energies. It provides guidelines for creating living spaces that promote health, wealth, prosperity, and spiritual growth by aligning with the five elements and cosmic forces.
              </p>
              <p>
                <span className="font-semibold text-indigo-700">History & Origins:</span> Vastu Shastra originated from the Vedas and has been practiced for over 5,000 years. Ancient sages observed how cosmic energies, natural elements, and geographical directions affect human well-being. This wisdom was documented in texts like the Brihat Samhita and continues to guide modern architecture and interior design.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-4">
                <li><span className="font-semibold text-indigo-700">Five Elements:</span> Vastu is based on the balance of Panchabhutas - Earth (Prithvi), Water (Jal), Fire (Agni), Air (Vayu), and Space (Akash). Each element governs specific areas and functions in your home, and their proper balance ensures harmony and positive energy flow.</li>
                <li><span className="font-semibold text-indigo-700">Eight Directions:</span> The eight cardinal directions (Ashta Dik) each have specific energies and deities. North brings wealth and prosperity, East represents health and family, South governs fame and recognition, and West is associated with creativity and children.</li>
                <li><span className="font-semibold text-indigo-700">Energy Flow:</span> Vastu emphasizes the smooth flow of positive energy (Prana) through your home. Proper placement of rooms, doors, windows, and furniture ensures that cosmic energies circulate freely, bringing abundance and well-being to all family members.</li>
                <li><span className="font-semibold text-indigo-700">Room Placement:</span> Each room has an ideal direction based on its function. The kitchen should face southeast for fire energy, bedrooms should be in the southwest for stability, and the study should face east for concentration and wisdom.</li>
                <li><span className="font-semibold text-indigo-700">Remedies:</span> Vastu offers practical solutions through colors, materials, symbols, and placement adjustments to correct energy imbalances and enhance positive vibrations in your living space.</li>
              </ul>
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg">
                <span className="text-indigo-600 font-medium">Tip:</span> Start with small Vastu corrections in your home - even minor adjustments can bring significant positive changes. Focus on decluttering, proper lighting, and maintaining cleanliness as these are fundamental to good Vastu.
              </div>
            </div>

            {/* Key Takeaway */}
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded-lg">
              <p className="text-gray-700">
                <span className="text-indigo-600 font-medium">Key Takeaway:</span> Vastu Shastra is a practical science that helps create harmonious living environments by aligning your home with cosmic energies, leading to improved health, relationships, and prosperity.
              </p>
            </div>
            {/* Tabs */}
            <div className="flex flex-nowrap gap-1 sm:gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-sm xs:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            {activeTab === 'Overview' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Core Principles of Vastu Shastra</h2>
                <div className="space-y-6 text-gray-700 mb-8 text-justify">
                  <p>
                    Vastu Shastra operates on the fundamental principle that everything in the universe is interconnected through energy. Your home is not just a physical structure but a living entity that interacts with cosmic forces, natural elements, and your personal energy field. When these energies are in harmony, you experience peace, prosperity, and well-being. However, when there&apos;s disharmony, it can manifest as health issues, financial problems, or relationship conflicts. Understanding this principle helps you see your living space as a sacred environment that needs to be nurtured and balanced.
                  </p>
                  <p>
                    The concept of energy flow, or Prana, is central to Vastu. Just as your body has energy channels (nadis) that need to be clear for good health, your home has energy pathways that must remain unobstructed for positive energy to circulate freely. Doors, windows, and open spaces act as energy entry points, while walls, furniture, and clutter can block or redirect this flow. The goal is to create a smooth, continuous energy circulation that nourishes every corner of your home and every member of your family.
                  </p>
                  <p>
                    Directional energies play a crucial role in Vastu. Each of the eight directions is ruled by specific cosmic forces and deities, and each governs particular aspects of life. The North is ruled by Kuber (God of Wealth) and brings financial prosperity and career opportunities. The East is ruled by Indra (God of Health) and promotes physical well-being and family harmony. The South is ruled by Yama (God of Fame) and brings recognition and social status. Understanding these directional energies helps you place rooms and functions in their most beneficial locations.
                  </p>
                  <p>
                    The five elements (Panchabhutas) are the building blocks of Vastu. Earth represents stability and foundation, Water symbolizes emotions and flow, Fire brings energy and transformation, Air governs movement and communication, and Space represents expansion and consciousness. Each element has specific qualities and needs to be balanced in your home. For example, too much fire energy can cause conflicts and restlessness, while too much water energy can lead to emotional instability and financial losses.
                  </p>
                  <p>
                    Time and cosmic cycles also influence Vastu. The movement of planets, phases of the moon, and seasonal changes affect the energy dynamics of your home. Vastu remedies and adjustments should be made during auspicious times to maximize their effectiveness. Regular Vastu audits help you stay aligned with changing cosmic energies and maintain the harmony of your living space.
                  </p>
                </div>
              </motion.section>
            )}
            {activeTab === 'Principles' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Key Principles and Concepts</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-black text-lg mb-3">The Five Elements</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li>• Earth (Prithvi): Foundation, stability, and material wealth</li>
                      <li>• Water (Jal): Emotions, flow, and financial prosperity</li>
                      <li>• Fire (Agni): Energy, passion, and transformation</li>
                      <li>• Air (Vayu): Movement, communication, and relationships</li>
                      <li>• Space (Akash): Expansion, consciousness, and spiritual growth</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-black text-lg mb-3">The Eight Directions</h3>
                    <ul className="text-gray-700 space-y-2">
                      <li>• North: Wealth and career (Kuber)</li>
                      <li>• Northeast: Knowledge and spirituality (Ishanya)</li>
                      <li>• East: Health and family (Indra)</li>
                      <li>• Southeast: Fire and energy (Agneya)</li>
                      <li>• South: Fame and recognition (Yama)</li>
                      <li>• Southwest: Stability and relationships (Nairutya)</li>
                      <li>• West: Creativity and children (Varuna)</li>
                      <li>• Northwest: Travel and communication (Vayavya)</li>
                    </ul>
                  </div>
                </div>
              </motion.section>
            )}
            {activeTab === 'Remedies' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Vastu Remedies and Solutions</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="font-bold text-green-900 text-lg mb-3">Structural Remedies</h3>
                    <ul className="text-green-800 space-y-2">
                      <li>• Installing mirrors to redirect negative energy</li>
                      <li>• Using crystals and gemstones for energy balance</li>
                      <li>• Placing wind chimes for positive vibrations</li>
                      <li>• Using salt lamps for purification</li>
                      <li>• Installing proper lighting in dark corners</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 text-lg mb-3">Color and Material Remedies</h3>
                    <ul className="text-blue-800 space-y-2">
                      <li>• Using specific colors for different directions</li>
                      <li>• Choosing appropriate materials for construction</li>
                      <li>• Placing plants and natural elements</li>
                      <li>• Using sacred symbols and yantras</li>
                      <li>• Maintaining cleanliness and organization</li>
                    </ul>
                  </div>
                </div>
              </motion.section>
            )}
            {activeTab === 'FAQs' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {[
                    ['What is the best direction for the main entrance?', 'The main entrance should ideally face North, East, or Northeast as these directions bring positive energy, prosperity, and good health to the family.'],
                    ['How can I improve the energy of my bedroom?', 'Place your bed with the head towards South or East, avoid sleeping under beams, use calming colors, and ensure proper ventilation for positive energy flow.'],
                    ['Which direction is best for the kitchen?', 'The kitchen should face Southeast (Agneya direction) as it represents fire element and brings prosperity, health, and harmony to family relationships.'],
                    ['Can Vastu remedies work in rented apartments?', 'Yes, many Vastu remedies like using crystals, mirrors, plants, and proper furniture placement can be implemented in rented spaces without structural changes.'],
                  ].map(([q, a]) => (
                    <div key={q} className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center"><HelpCircle className="w-5 h-5 mr-2 text-indigo-400" />{q}</h3>
                      <p className="text-gray-700">{a}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
            <CTASection />
            
            {/* Next Blog Section */}
            <section className="mt-16 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-black mb-6">Continue Your Astrological Journey</h2>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 xs:p-6 border border-indigo-100 hover:shadow-lg transition-all cursor-pointer"
              >
                <Link href="/blog/gemstones-and-their-powers" className="block">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-4">
                    <div className="relative w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden bg-indigo-100 mx-auto sm:mx-0">
                      <Image src={nextInSeries.imageUrl} alt="Gemstones" fill className="object-cover" />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-xs xs:text-sm text-indigo-600 font-medium mb-1">Next in Series</p>
                      <h3 className="text-lg xs:text-xl font-bold text-black mb-2">Gemstones and Their Powers</h3>
                      <p className="text-gray-700 text-xs xs:text-sm mb-3">Discover the mystical properties of gemstones and how they can enhance your life through their planetary connections.</p>
                      <div className="flex flex-row items-center gap-2 xs:gap-4 text-xs xs:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>12 April, 2024</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>6 min read</span>
                        </span>
                        <span className="flex items-center ml-auto text-indigo-600 sm:hidden">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex text-indigo-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Info */}
            <Link href="/about" className="block bg-indigo-50 rounded-lg p-6 mb-8 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="text-indigo-700 font-medium">Astrological Review by</span> <br />
                    <span className="font-semibold text-indigo-900">Dr. Narendra Kumar Sharma</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Updated on 15 April, 2024</span>
                  </p>
                </div>
              </div>
            </Link>
            {/* Newsletter */}
            <div className="bg-orange-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-orange-900 mb-4">Get Weekly Astrology Insights</h3>
              <p className="text-gray-700 mb-4">Sign up for our newsletter and receive cosmic tips, remedies, and predictions every week.</p>
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Subscribe Now
                </button>
              </form>
            </div>
            {/* Common Myths */}
            <div className="bg-yellow-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">Common Vastu Myths</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Vastu requires major structural changes (simple adjustments work too)</li>
                <li>All Vastu rules apply to everyone (personalization is key)</li>
                <li>Vastu is just superstition (it&apos;s based on energy principles)</li>
                <li>Vastu effects are instant (changes happen gradually)</li>
              </ul>
            </div>
            {/* Resources */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">Recommended Resources</h3>
              <ul className="space-y-3">
                {[
                  ['Understanding Vedic Astrology', '/blog/understanding-vedic-astrology'],
                  ['Gemstones and Their Powers', '/blog/gemstones-and-their-powers'],
                  ['Astrology Remedies for Life', '/blog/astrology-remedies-for-life'],
                  ['Numerology Basics', '/blog/numerology-basics'],
                ].map(([title, link]) => (
                  <li key={title}>
                    <Link href={link} className="text-indigo-700 hover:underline flex items-start">
                      <span className="text-indigo-500 mr-2">→</span>
                      <span>{title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
