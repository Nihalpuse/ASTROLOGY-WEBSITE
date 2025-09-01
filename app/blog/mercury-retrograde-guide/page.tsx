'use client'

import { useState, useEffect } from 'react';
import { User, Calendar, BookOpen, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CTASection } from '../../components/CTASection';
import { blogPosts } from '../../data/blogPosts';

const nextInSeries = blogPosts['understanding-vedic-astrology'];
const tabs = ['Overview', 'What is Mercury Retrograde?', 'Effects', 'FAQs'];

export default function MercuryRetrogradeGuidePage() {
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
                Mercury Retrograde Guide
              </h1>
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-6 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> Dr. Narendra Kumar Sharma</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 15 April, 2024</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Astrology</span>
              </div>
            </div>
            {/* Hero Image */}
            <div className="w-full h-64 md:h-96 relative mb-8 rounded-lg overflow-hidden shadow-lg">
              <img src="https://res.cloudinary.com/dxwspucxw/image/upload/v1754641601/astrology_remedy_jsighf.jpg" alt="Mercury Retrograde" className="w-full h-full object-cover" />
            </div>
            
            {/* Intro */}
            <div className="mb-8 text-lg leading-relaxed text-gray-700 space-y-6 text-justify">
              <p>
                Mercury retrograde is one of the most talked-about astrological phenomena, occurring when the planet Mercury appears to move backward in its orbit from Earth&apos;s perspective. This optical illusion happens three to four times a year and typically lasts for about three weeks.
              </p>
              <p>
                <span className="font-semibold text-indigo-700">Understanding the Phenomenon:</span> During these periods, Mercury&apos;s energy becomes more introspective and reflective, affecting areas of life that Mercury governs: communication, travel, technology, contracts, and daily routines. While often feared, Mercury retrograde periods can actually be beneficial for review, reflection, and revision.
              </p>
              <p>
                <span className="font-semibold text-indigo-700">Navigating with Wisdom:</span> Understanding how to navigate Mercury retrograde can help you minimize challenges and maximize the opportunities for growth and improvement that these periods offer. With proper preparation and awareness, you can turn potential obstacles into valuable learning experiences.
              </p>
              <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-lg">
                <span className="text-indigo-600 font-medium">Important:</span> Mercury retrograde is not about fear, but about conscious awareness. Use these periods for reflection, review, and reconnection rather than rushing into new ventures.
              </div>
            </div>

            {/* Key Takeaway */}
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded-lg">
              <p className="text-gray-700">
                <span className="text-indigo-600 font-medium">Key Takeaway:</span> Mercury retrograde is not a time to fear, but an opportunity to slow down, reflect, and realign with your true path.
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
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Understanding Mercury Retrograde</h2>
                <p className="text-black text-justify mb-5" style={{ fontFamily: 'Inter, Lato, Open Sans, sans-serif' }}>
                  Mercury retrograde is one of the most talked-about astrological phenomena, occurring when the planet Mercury appears to move backward in its orbit from Earth&apos;s perspective. This optical illusion happens three to four times a year and typically lasts for about three weeks.
                </p>
                <p className="text-black text-justify mb-5" style={{ fontFamily: 'Inter, Lato, Open Sans, sans-serif' }}>
                  During these periods, Mercury&apos;s energy becomes more introspective and reflective, affecting areas of life that Mercury governs: communication, travel, technology, contracts, and daily routines. While often feared, Mercury retrograde periods can actually be beneficial for review, reflection, and revision.
                </p>
                <p className="text-black text-justify mb-5" style={{ fontFamily: 'Inter, Lato, Open Sans, sans-serif' }}>
                  Understanding how to navigate Mercury retrograde can help you minimize challenges and maximize the opportunities for growth and improvement that these periods offer. With proper preparation and awareness, you can turn potential obstacles into valuable learning experiences.
                </p>
              </motion.section>
            )}
            {activeTab === 'What is Mercury Retrograde?' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">The Science and Astrology Behind Mercury Retrograde</h2>
                <p className="text-black text-justify mb-5" style={{ fontFamily: 'Inter, Lato, Open Sans, sans-serif' }}>
                  From an astronomical perspective, Mercury retrograde occurs when Earth overtakes Mercury in its orbit around the Sun. As Earth moves faster in its orbit, Mercury appears to slow down, stop, and then move backward relative to the background stars. This creates the illusion of retrograde motion.
                </p>
                <p className="text-black text-justify mb-5" style={{ fontFamily: 'Inter, Lato, Open Sans, sans-serif' }}>
                  In astrology, Mercury rules communication, thinking, learning, and the exchange of information. When Mercury goes retrograde, these areas of life are said to be affected, often leading to miscommunications, technological glitches, travel delays, and the need to revisit or revise plans and projects.
                </p>
                <p className="text-black text-justify mb-5" style={{ fontFamily: 'Inter, Lato, Open Sans, sans-serif' }}>
                  The retrograde period is divided into three phases: the pre-shadow phase (when Mercury approaches the retrograde point), the retrograde phase itself, and the post-shadow phase (when Mercury returns to its original position). Each phase has its own unique energy and lessons to offer.
                </p>
              </motion.section>
            )}
            {activeTab === 'Effects' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">How Mercury Retrograde Affects Different Areas of Life</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    {
                      title: "Communication Challenges",
                      description: "Expect miscommunications, misunderstandings, and delays in conversations. Double-check emails, texts, and important messages. Be extra clear in your communication and avoid making assumptions."
                    },
                    {
                      title: "Technology Issues",
                      description: "Computers, phones, and other devices may act up or malfunction. Back up important data regularly and avoid purchasing new technology during retrograde periods."
                    },
                    {
                      title: "Travel Disruptions",
                      description: "Travel plans may face delays, cancellations, or unexpected changes. Allow extra time for journeys and have backup plans ready. Double-check reservations and itineraries."
                    },
                    {
                      title: "Contract and Agreement Review",
                      description: "Avoid signing important contracts or making major commitments during retrograde. Use this time to review existing agreements and make necessary revisions."
                    },
                    {
                      title: "Past Connections Return",
                      description: "Old friends, ex-partners, or unresolved situations may resurface. This is an opportunity to heal past wounds and complete unfinished business."
                    },
                    {
                      title: "Inner Reflection and Review",
                      description: "Mercury retrograde is excellent for introspection, meditation, and reviewing your goals and plans. Use this time to reassess your direction and make necessary adjustments."
                    }
                  ].map((effect, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 40 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.6 + (index * 0.1) }} 
                      viewport={{ once: true }} 
                      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <h3 className="font-bold text-indigo-900 text-lg mb-2">{effect.title}</h3>
                      <p className="text-gray-700 text-sm">
                        {effect.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
            {activeTab === 'FAQs' && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
                <h2 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-2">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {[
                    ['How often does Mercury go retrograde?', 'Mercury goes retrograde three to four times per year, typically lasting about three weeks each time. The exact frequency and duration can vary slightly from year to year.'],
                    ['Should I avoid making important decisions during Mercury retrograde?', 'While it&apos;s wise to be extra careful with major decisions, you don&apos;t need to put your life on hold. Focus on reviewing, revising, and reflecting rather than starting completely new projects or relationships.'],
                    ['Can Mercury retrograde affect relationships?', 'Yes, communication issues can strain relationships during retrograde periods. This is also a time when past relationships may resurface, offering opportunities for closure or reconciliation.'],
                    ['What are the best activities during Mercury retrograde?', 'Focus on activities that involve review, reflection, and revision. This is an excellent time for meditation, journaling, organizing, completing unfinished projects, and reconnecting with old friends.'],
                    ['How can I protect myself during Mercury retrograde?', 'Practice patience, double-check all communications, back up important data, allow extra time for travel, and use this period for introspection and personal growth rather than rushing into new ventures.']
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
                <Link href="/blog/understanding-vedic-astrology" className="block">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-4">
                    <div className="relative w-16 h-16 xs:w-20 xs:h-20 rounded-lg overflow-hidden bg-indigo-100 mx-auto sm:mx-0">
                      <Image src={nextInSeries.imageUrl} alt="Vedic Astrology" fill className="object-cover" />
                    </div>
                    <div className="flex-1 w-full">
                      <p className="text-xs xs:text-sm text-indigo-600 font-medium mb-1">Next in Series</p>
                      <h3 className="text-lg xs:text-xl font-bold text-black mb-2">Understanding Vedic Astrology</h3>
                      <p className="text-gray-700 text-xs xs:text-sm mb-3">Learn the fundamentals of Vedic astrology and its impact on life decisions. Discover how ancient wisdom can guide your modern choices.</p>
                      <div className="flex flex-row items-center gap-2 xs:gap-4 text-xs xs:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>15 April, 2024</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>8 min read</span>
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
              <h3 className="text-lg font-bold text-yellow-900 mb-4">Mercury Retrograde Myths</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Mercury retrograde causes all technology to break (it&apos;s about awareness, not panic)</li>
                <li>You can&apos;t make any decisions during retrograde (just be more careful and thoughtful)</li>
                <li>All communication will fail (clear, patient communication works better)</li>
                <li>Retrograde is purely negative (it&apos;s excellent for reflection and review)</li>
              </ul>
            </div>
            {/* Resources */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4">Recommended Resources</h3>
              <ul className="space-y-3">
                {[
                  ['Understanding Your Birth Chart', '/blog/understanding-your-birth-chart'],
                  ['The Influence of Planets', '/blog/the-influence-of-planets'],
                  ['Numerology Basics', '/blog/numerology-basics'],
                  ['Understanding Vedic Astrology', '/blog/understanding-vedic-astrology'],
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

