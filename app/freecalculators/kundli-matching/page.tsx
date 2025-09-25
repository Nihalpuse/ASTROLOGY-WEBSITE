'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AstrologerProfile } from '@/app/components/AstrologerProfile';
import { ChevronDown, ChevronUp, Heart, Star, Users, Check, X } from 'lucide-react';

const KundliMatchingPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    boyName: '',
    boyEmail: '',
    boyPhone: '',
    boyDateOfBirth: '',
    boyTimeOfBirth: '',
    boyPlaceOfBirth: '',
    girlName: '',
    girlEmail: '',
    girlPhone: '',
    girlDateOfBirth: '',
    girlTimeOfBirth: '',
    girlPlaceOfBirth: ''
  });

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const faqData = [
    {
      question: "What is Kundli Matching?",
      answer: "Kundli Matching, also known as Gun Milan or Horoscope Matching, is an ancient Vedic practice to assess marriage compatibility between two individuals based on their birth charts and astrological factors.",
      borderColor: "border-orange-400"
    },
    {
      question: "How does Gun Milan work?",
      answer: "Gun Milan analyzes 36 Gunas (qualities) from both partners' birth charts. The compatibility is measured on a scale of 36 points, where higher scores indicate better compatibility for marriage.",
      borderColor: "border-purple-400"
    },
    {
      question: "What is the minimum score for marriage?",
      answer: "Generally, a score of 18 or above out of 36 is considered acceptable for marriage. However, scores above 24 are considered very good, and above 32 are excellent for matrimonial harmony.",
      borderColor: "border-blue-400"
    },
    {
      question: "Can Kundli Matching predict divorce?",
      answer: "While Kundli Matching can indicate potential areas of conflict and compatibility issues, it cannot definitively predict divorce. It's a tool for guidance and understanding, not absolute prediction.",
      borderColor: "border-green-400"
    },
    {
      question: "What if there are Doshas in the Kundli?",
      answer: "Doshas like Mangal Dosha can be addressed through specific remedies, rituals, or by matching with someone who has similar Doshas. Consultation with an experienced astrologer is recommended.",
      borderColor: "border-red-400"
    },
    {
      question: "Is Kundli Matching scientifically accurate?",
      answer: "Kundli Matching is based on ancient Vedic wisdom and astronomical calculations. While not scientifically proven, millions of people find value in this traditional practice for marital compatibility assessment.",
      borderColor: "border-indigo-400"
    }
  ];

  const matchingFeatures = [
    {
      icon: <Heart className="w-8 h-8 text-emerald-600" />,
      title: "Emotional Compatibility",
      description: "Analyze emotional bonding and understanding between partners."
    },
    {
      icon: <Star className="w-8 h-8 text-emerald-600" />,
      title: "Astrological Harmony",
      description: "Check planetary positions and their influence on married life."
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Family Compatibility",
      description: "Assess how well both families will get along and support the union."
    },
    {
      icon: <Check className="w-8 h-8 text-emerald-600" />,
      title: "Life Goals Alignment",
      description: "Determine if both partners share similar life objectives and values."
    }
  ];

  const gunaDetails = [
    { name: "Varna", points: 1, description: "Spiritual compatibility and ego" },
    { name: "Vashya", points: 2, description: "Mutual attraction and control" },
    { name: "Tara", points: 3, description: "Health and well-being" },
    { name: "Yoni", points: 4, description: "Sexual compatibility and intimacy" },
    { name: "Graha Maitri", points: 5, description: "Mental compatibility and friendship" },
    { name: "Gana", points: 6, description: "Temperament and behavior" },
    { name: "Bhakoot", points: 7, description: "Love and emotional compatibility" },
    { name: "Nadi", points: 8, description: "Health and progeny" }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/20 font-sans">
      <div className="max-w-6xl mx-auto pt-6 px-4 sm:px-6 md:px-8 lg:px-12 pb-12 relative z-10">
        
        {/* Banner Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full rounded-3xl py-8 sm:py-12 px-4 sm:px-8 md:px-16 mb-8 sm:mb-12 flex flex-col items-center justify-center shadow-md border border-[#e6c77e]"
          style={{ backgroundColor: "#FEFBF2" }}
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black mb-3 sm:mb-4 text-center drop-shadow-lg font-serif"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Kundli Matching
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl text-center max-w-3xl font-sans"
            style={{
              fontFamily: "Open Sans, Arial, sans-serif",
              color: "#166534",
            }}
          >
            Find your perfect life partner through ancient Vedic wisdom and comprehensive compatibility analysis
          </p>
        </motion.div>

        {/* Introduction Section */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>What Is Kundli Matching?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Kundli Matching, also known as Gun Milan or Horoscope Matching, is an ancient Vedic practice used to assess marriage compatibility between two individuals. This time-tested method analyzes the birth charts of prospective partners to determine their compatibility across various life aspects.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The process evaluates 36 Gunas (qualities) and provides a compatibility score that helps families make informed decisions about marriage alliances. It considers factors like emotional compatibility, physical attraction, mental harmony, and spiritual alignment.
              </p>
              <div className="text-center">
                <button className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Start Your Kundli Matching →
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Kundli Matching Form */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Match Your Kundlis</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Boy's Details */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                  <h3 className="text-2xl font-bold text-[#23244a] mb-6 text-center">Boy&apos;s Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="boyName"
                        value={formData.boyName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Enter boy's full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Email</label>
                      <input
                        type="email"
                        name="boyEmail"
                        value={formData.boyEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="boy@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Phone</label>
                      <input
                        type="tel"
                        name="boyPhone"
                        value={formData.boyPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="boyDateOfBirth"
                        value={formData.boyDateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Time of Birth</label>
                      <input
                        type="time"
                        name="boyTimeOfBirth"
                        value={formData.boyTimeOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Place of Birth *</label>
                      <input
                        type="text"
                        name="boyPlaceOfBirth"
                        value={formData.boyPlaceOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="City, State, Country"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Girl's Details */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 sm:p-6 rounded-lg border border-pink-200">
                  <h3 className="text-2xl font-bold text-[#23244a] mb-6 text-center">Girl&apos;s Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="girlName"
                        value={formData.girlName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Enter girl's full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Email</label>
                      <input
                        type="email"
                        name="girlEmail"
                        value={formData.girlEmail}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="girl@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Phone</label>
                      <input
                        type="tel"
                        name="girlPhone"
                        value={formData.girlPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="girlDateOfBirth"
                        value={formData.girlDateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Time of Birth</label>
                      <input
                        type="time"
                        name="girlTimeOfBirth"
                        value={formData.girlTimeOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#23244a] mb-2">Place of Birth *</label>
                      <input
                        type="text"
                        name="girlPlaceOfBirth"
                        value={formData.girlPlaceOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="City, State, Country"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white py-3 px-6 sm:py-4 sm:px-12 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-base sm:text-lg"
                >
                  Match Kundlis Now →
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* 36 Gunas Explanation */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="rounded-lg p-6 sm:p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Understanding the 36 Gunas</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                The 36 Gunas system evaluates compatibility across 8 different aspects of life. Each aspect carries different points, totaling 36 points for perfect compatibility.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gunaDetails.map((guna, index) => (
                  <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-green-200">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-[#23244a]">{guna.name}</h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {guna.points} {guna.points === 1 ? 'Point' : 'Points'}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{guna.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-lg border border-amber-200">
                <h3 className="text-xl font-semibold text-[#23244a] mb-4">Compatibility Score Guide</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600 mb-2">0-17</div>
                    <div className="text-sm text-gray-700">Not Recommended</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">18-24</div>
                    <div className="text-sm text-gray-700">Average Match</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600 mb-2">25-36</div>
                    <div className="text-sm text-gray-700">Excellent Match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Why Choose Kundli Matching?</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#23244a] mb-2">{feature.title}</h3>
                      <p className="text-gray-700">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-[#23244a] mb-4 text-center">What You&apos;ll Receive</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Detailed compatibility report</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">36 Gunas analysis breakdown</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Dosha identification and remedies</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Marriage timing recommendations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Frequently Asked Questions</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className={`border-l-4 ${faq.borderColor} bg-white rounded-r-lg shadow-sm transition-all duration-300 hover:shadow-md`}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center focus:outline-none rounded-r-lg"
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

        {/* Astrologer profile - appended to end of calculator content */}
        <div className="mt-12">
          <AstrologerProfile />
        </div>
      </div>
    </div>
  );
};

export default KundliMatchingPage;
