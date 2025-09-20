'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TodayPanchangPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "What exactly is Panchang?",
      answer: "Panchang is a comprehensive Hindu astrological calendar that contains five essential elements: Tithi (lunar day), Vara (weekday), Nakshatra (star constellation), Yoga (auspicious combination), and Karana (half lunar day). It serves as a guide for determining auspicious and inauspicious times for various activities.",
      borderColor: "border-orange-400"
    },
    {
      question: "How can Panchang help in daily life planning?",
      answer: "Panchang helps you align your activities with cosmic energies by identifying favorable times for important work, avoiding inauspicious periods like Rahu Kaal, and choosing optimal timing for ceremonies, business ventures, and personal milestones.",
      borderColor: "border-purple-400"
    },
    {
      question: "What information does a daily Panchang contain?",
      answer: "A daily Panchang includes the current Tithi, Nakshatra, Yoga, Karana, sunrise/sunset times, moonrise/moonset times, auspicious muhurtas, inauspicious periods like Rahu Kaal, and specific guidance for the day's activities.",
      borderColor: "border-blue-400"
    },
    {
      question: "How does Tithi influence daily activities?",
      answer: "Tithi represents the lunar day and significantly influences the energy of the day. Different Tithis are favorable for different activities - some are excellent for new beginnings, others for completion of projects, and some are best avoided for important work.",
      borderColor: "border-green-400"
    },
    {
      question: "Can Panchang be used for selecting wedding dates?",
      answer: "Yes, Panchang is essential for selecting auspicious wedding dates. It helps identify favorable Tithis, Nakshatras, and muhurtas while avoiding inauspicious combinations. However, for weddings, detailed kundali matching and consultation with an astrologer is also recommended.",
      borderColor: "border-red-400"
    },
    {
      question: "Do different regions have different Panchang calculations?",
      answer: "Yes, Panchang calculations can vary slightly based on geographical location and the specific school of astrology followed. Regional variations account for local sunrise/sunset times and may use different computational methods, but the core principles remain consistent.",
      borderColor: "border-indigo-400"
    }
  ];
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20 font-sans">
      <div className="max-w-6xl mx-auto pt-8 px-6 md:px-8 lg:px-12 pb-16 relative z-10">
        
        {/* Banner Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full rounded-3xl py-12 px-4 md:px-16 mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]"
          style={{ backgroundColor: "#FEFBF2" }}
        >
          <h1
            className="text-5xl md:text-6xl font-extrabold text-black mb-4 text-center drop-shadow-lg font-serif"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Today&apos;s Panchang
          </h1>
          <p
            className="text-xl md:text-2xl text-center max-w-3xl font-sans"
            style={{
              fontFamily: "Open Sans, Arial, sans-serif",
              color: "#166534",
            }}
          >
            Discover the most auspicious and inauspicious times for your daily activities using traditional Vedic astrology
          </p>
        </motion.div>

        {/* Introduction Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Is Panchang?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Panchang is the Hindu calendar that comprises 5 essential elements, serving as an astrological calendar aligned with ancient Vedic traditions. It is one of the most prominent tools in astrology that indicates auspicious and inauspicious times based on celestial movements.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                This comprehensive system helps determine the most favorable times for important activities like business ventures, festivals, ceremonies, and personal milestones. Panchang includes detailed astrological calculations covering festival dates, fasting periods, Nakshatra positions, and optimal timing for various endeavors.
              </p>
              <div className="text-center">
                <button className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Get Your Personalized Kundli →
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Panchang For Today Table */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-[#e6c77e]">
            <div className="p-6 text-center" style={{ backgroundColor: '#FEFBF2' }}>
              <h2 className="text-3xl font-bold flex items-center justify-center text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                <span className="mr-3">🕉️</span>
                Today&apos;s Panchang Details
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Current Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a] w-1/4" style={{ backgroundColor: '#FEFBF2' }}>Ravi/Sun (Date)</td>
                      <td className="p-4 text-gray-700 w-1/4">26/12/2023</td>
                      <td className="p-4 font-semibold text-[#23244a] w-1/4" style={{ backgroundColor: '#FEFBF2' }}>Soma Var (Day)</td>
                      <td className="p-4 text-gray-700 w-1/4">Monday</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Paksha</td>
                      <td className="p-4 text-gray-700">Krishna Paksha</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Tithi</td>
                      <td className="p-4 text-gray-700">15</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Karna</td>
                      <td className="p-4 text-gray-700">Naga - 13:46</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Yoga</td>
                      <td className="p-4 text-gray-700">Brahmendra Chaturashi</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Yogi</td>
                      <td className="p-4 text-gray-700">Rudra - 03:43:43</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Nakshatra</td>
                      <td className="p-4 text-gray-700">Jyeshta - Scorpio/Vrischik - 12:48</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Gana</td>
                      <td className="p-4 text-gray-700">Rakshasa</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Gulika</td>
                      <td className="p-4 text-gray-700">07:43 - 09:13</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Yamghant</td>
                      <td className="p-4 text-gray-700">9:13 - 10:43</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Abhijit Muhrat</td>
                      <td className="p-4 text-gray-700">11:49 - 12:38</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Golden Muhurta</td>
                      <td className="p-4 text-gray-700">5:56:14 - 17:42:14</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Inauspicious</td>
                      <td className="p-4 text-red-600 font-medium">Bhadra</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Rahu Kaal</td>
                      <td className="p-4 text-red-600 font-medium">7:30 - 9:00</td>
                      <td className="p-4 font-semibold text-[#23244a]" style={{ backgroundColor: '#FEFBF2' }}>Hora Kaal</td>
                      <td className="p-4 text-gray-700">10:43 - 12:13</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How Does Panchang Help Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>How Does Panchang Help In Planning Your Day?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                Panchang serves as your daily spiritual guide, helping you align your activities with cosmic energies for maximum success and harmony. By understanding the celestial influences of each day, you can make informed decisions about when to start important ventures, conduct ceremonies, or avoid certain activities.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">✨ Auspicious Activities</h3>
                  <p className="text-gray-700">Choose favorable times for new beginnings, business launches, weddings, and important decisions.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">⚠️ Times to Avoid</h3>
                  <p className="text-gray-700">Identify inauspicious periods like Rahu Kaal to avoid starting important work.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">🏠 Daily Routines</h3>
                  <p className="text-gray-700">Plan your daily activities including prayers, meditation, and personal tasks.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">💰 Financial Decisions</h3>
                  <p className="text-gray-700">Make investments and financial commitments during favorable planetary positions.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How To Understand Panchang Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Understanding Panchang Elements</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                Panchang consists of five essential elements that form the foundation of Vedic timekeeping. Understanding these elements helps you make informed decisions about timing your activities.
              </p>
              
              {/* The Five Elements */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">1. Tithi (Lunar Day)</h3>
                  <p className="text-gray-700 text-sm">The lunar day based on the moon&apos;s position relative to the sun, crucial for determining auspicious timing.</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">2. Vara (Weekday)</h3>
                  <p className="text-gray-700 text-sm">The day of the week, each ruled by a specific planet influencing the day&apos;s energy and activities.</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">3. Nakshatra (Star)</h3>
                  <p className="text-gray-700 text-sm">The lunar mansion where the moon is positioned, affecting personality traits and favorable activities.</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">4. Yoga (Union)</h3>
                  <p className="text-gray-700 text-sm">The angular relationship between the sun and moon, indicating the quality of time for different activities.</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">5. Karana (Half-Day)</h3>
                  <p className="text-gray-700 text-sm">Half of a Tithi, providing more precise timing for activities and spiritual practices.</p>
                </div>
              </div>

              {/* Key Nakshatras Overview */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                <h3 className="text-2xl font-semibold text-[#23244a] mb-4 text-center">Key Nakshatras & Their Influences</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div><strong>Ashwini (Aries):</strong> New beginnings, healing, swift action</div>
                    <div><strong>Rohini (Taurus):</strong> Growth, beauty, material prosperity</div>
                    <div><strong>Punarvasu (Gemini/Cancer):</strong> Renewal, return, spiritual growth</div>
                    <div><strong>Pushya (Cancer):</strong> Nourishment, protection, spiritual practices</div>
                    <div><strong>Magha (Leo):</strong> Authority, tradition, ancestral honors</div>
                    <div><strong>Hasta (Virgo):</strong> Skillful work, craftsmanship, healing</div>
                    <div><strong>Swati (Libra):</strong> Independence, trade, movement</div>
                    <div><strong>Anuradha (Scorpio):</strong> Friendship, cooperation, success</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>Jyestha (Scorpio):</strong> Protection, seniority, responsibility</div>
                    <div><strong>Mula (Sagittarius):</strong> Research, investigation, roots</div>
                    <div><strong>Uttara Ashadha (Sagittarius/Capricorn):</strong> Victory, leadership</div>
                    <div><strong>Shravana (Capricorn):</strong> Learning, listening, fame</div>
                    <div><strong>Dhanishta (Capricorn/Aquarius):</strong> Wealth, music, prosperity</div>
                    <div><strong>Shatbhisha (Aquarius):</strong> Healing, mystical knowledge</div>
                    <div><strong>Uttara Bhadrapada (Pisces):</strong> Wisdom, spiritual insight</div>
                    <div><strong>Revati (Pisces):</strong> Completion, wealth, safe travel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Frequently Asked Questions</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className={`border-l-4 ${faq.borderColor} bg-white rounded-r-lg shadow-sm transition-all duration-300 hover:shadow-md`}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none rounded-r-lg"
                  >
                    <h3 className="text-lg font-semibold text-[#23244a] pr-4">
                      Q: {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFAQ === index ? "auto" : 0,
                      opacity: openFAQ === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

export default TodayPanchangPage;
