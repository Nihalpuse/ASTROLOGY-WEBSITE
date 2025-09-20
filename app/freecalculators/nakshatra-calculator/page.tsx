'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Star, Calendar, Clock, MapPin } from 'lucide-react';

const NakshatraCalculatorPage = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
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
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  const faqData = [
    {
      question: "What is a Nakshatra?",
      answer: "Nakshatras, also known as lunar mansions, are 27 unique divisions of the sky that the moon passes through on its journey. Each Nakshatra holds deep insights into your personality, life path, and potential in Vedic astrology.",
      borderColor: "border-orange-400"
    },
    {
      question: "How does the Nakshatra Calculator work?",
      answer: "Simply enter your birth details, and our advanced Nakshatra Calculator will instantly reveal your Nakshatra. Whether you're new to Vedic astrology or a seasoned enthusiast, this tool offers insights tailored to your unique cosmic configuration.",
      borderColor: "border-purple-400"
    },
    {
      question: "What can my Nakshatra reveal about me?",
      answer: "Your Nakshatra reveals your core strengths, challenges you're destined to face, compatible energies, and spiritual guidance. It acts as a celestial guide offering wisdom from the stars to help you navigate life's challenges and opportunities.",
      borderColor: "border-blue-400"
    },
    {
      question: "Why is knowing your Nakshatra important?",
      answer: "Your Nakshatra connects you to the ancient wisdom of Vedic astrology, helping you live in harmony with your true self and the universe around you. It provides insights into your personality, career potential, relationships, and spiritual path.",
      borderColor: "border-green-400"
    },
    {
      question: "How accurate are the Nakshatra calculations?",
      answer: "Our calculator is based on precise astronomical data ensuring reliable and insightful results. The calculations follow traditional Vedic astrology principles with modern computational accuracy.",
      borderColor: "border-red-400"
    },
    {
      question: "Can I use this calculator for other people?",
      answer: "Yes, you can calculate the Nakshatra for family members, friends, or anyone whose birth details you have. This is particularly useful for understanding compatibility and relationships.",
      borderColor: "border-indigo-400"
    }
  ];

  const nakshatraFeatures = [
    {
      icon: <Star className="w-8 h-8 text-emerald-600" />,
      title: "Your Core Strengths",
      description: "Identify the natural talents that make you unique and guide your life path."
    },
    {
      icon: <Calendar className="w-8 h-8 text-emerald-600" />,
      title: "Life Challenges",
      description: "Understand the obstacles you're destined to face and how to overcome them."
    },
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: "Compatible Energies",
      description: "Discover people and environments that align with your soul's vibration."
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-600" />,
      title: "Spiritual Guidance",
      description: "Gain clarity on your karmic path and life's deeper purpose."
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
            Discover Your Nakshatra
          </h1>
          <p
            className="text-xl md:text-2xl text-center max-w-3xl font-sans"
            style={{
              fontFamily: "Open Sans, Arial, sans-serif",
              color: "#166534",
            }}
          >
            Unlock the secrets of your cosmic blueprint through ancient Vedic wisdom and celestial guidance
          </p>
        </motion.div>

        {/* Main Content Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          
          {/* Left Side - Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Your Nakshatra Holds the Secrets Your Horoscope Can&apos;t Explain
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mb-6"></div>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                From career potential to emotional patterns and karmic lessons — your birth star speaks louder than you think. 
                Discover what your Nakshatra reveals about you.
              </p>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-8">
                Nakshatras, also known as lunar mansions, are 27 unique divisions of the sky that the moon passes through on its journey. 
                Each Nakshatra holds insights into your personality, life path, and potential, influencing 
                thoughts and relationships.
              </p>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-[#23244a] mb-4">What Does Your Nakshatra Reveal?</h3>
                <div className="space-y-3">
                  {nakshatraFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#23244a]">{feature.title}</h4>
                        <p className="text-gray-700 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e] sticky top-8">
              <h3 className="text-3xl font-bold text-[#23244a] mb-6 text-center" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Calculate Your Nakshatra
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-8"></div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Time of Birth</label>
                  <input
                    type="time"
                    name="timeOfBirth"
                    value={formData.timeOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="HH:MM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#23244a] mb-2">Place of Birth *</label>
                  <input
                    type="text"
                    name="placeOfBirth"
                    value={formData.placeOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="City, State, Country"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  Calculate My Nakshatra →
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* How Calculator Works Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-lg shadow-lg p-8 border border-[#e6c77e]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>How The Nakshatra Calculator Works</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto mb-6"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed mb-8 text-center">
                Simply enter your birth details, and our advanced Nakshatra Calculator will instantly reveal your Nakshatra. 
                Whether you&apos;re new to Vedic astrology or a seasoned enthusiast, this tool offers insights tailored to your unique cosmic configuration.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">Instant Results</h3>
                  <p className="text-gray-700 text-sm">Discover your Nakshatra in seconds with a simple, easy-to-use interface.</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">In-depth Analysis</h3>
                  <p className="text-gray-700 text-sm">Receive a detailed description of your Nakshatra&apos;s traits, strengths, and characteristics.</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[#23244a] mb-3">Free & Accurate</h3>
                  <p className="text-gray-700 text-sm">Our calculator is based on precise astronomical data ensuring reliable results.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Why Nakshatra Matters Section */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-lg p-8 border border-[#e6c77e]" style={{ backgroundColor: '#FEFBF2' }}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#23244a] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Why Knowing Your Nakshatra Matters</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 mx-auto"></div>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                Your Nakshatra acts as a celestial guide, offering wisdom from the stars to help you navigate life&apos;s challenges and opportunities. 
                It connects you to the ancient wisdom of Vedic astrology, helping you live in harmony with your true self and the universe around you.
              </p>
              
              <p className="text-gray-700 text-lg leading-relaxed">
                Are you ready to unlock the cosmic secrets written in the stars? Try our Nakshatra Calculator now and embark on a journey of self-discovery!
              </p>
              
              <div className="text-center mt-8">
                <button className="bg-gradient-to-r from-green-700 via-emerald-500 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-800 hover:via-emerald-600 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Learn More About Nakshatras →
                </button>
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
          transition={{ duration: 0.6, delay: 0.3 }}
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

export default NakshatraCalculatorPage;
