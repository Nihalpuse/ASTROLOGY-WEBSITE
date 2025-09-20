'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Shield, CreditCard, Truck } from 'lucide-react'

import type { FC } from 'react'

const defaultFaqs = [
  {
    question: "Is prior expertise required to embark on these studies?",
    answer: "Absolutely not. Our curriculum is meticulously crafted to accommodate both novices and seasoned enthusiasts, ensuring a seamless and enriching learning journey for all backgrounds. You will find foundational as well as advanced resources tailored to your needs.",
    icon: HelpCircle
  },
  {
    question: "Are the educational materials accessible in multiple languages?",
    answer: "Yes, the majority of our comprehensive study resources are available in both English and Hindi, empowering a diverse community of learners to engage deeply with the content in their preferred language.",
    icon: Shield
  },
  {
    question: "Will I receive formal recognition upon completion?",
    answer: "Certainly. Upon successful completion of each course, you will be awarded a certificate, signifying your dedication and mastery of the subject matter. This credential can enhance your academic or professional pursuits.",
    icon: CreditCard
  },
  {
    question: "Are there any associated costs or hidden fees?",
    answer: "Many of our resources are freely accessible, while select advanced modules may require a nominal fee. We maintain full transparency regarding any costs, ensuring you can make informed decisions about your educational investment.",
    icon: Truck
  },
  {
    question: "How can I seek guidance or resolve queries during my studies?",
    answer: "You are encouraged to participate in our vibrant community forums or connect directly with our expert mentors. Our support channels are designed to provide timely, insightful assistance throughout your learning experience.",
    icon: HelpCircle
  }
]

type FAQ = {
  question: string;
  answer: string;
  icon?: React.ComponentType<{ className?: string }>;
};

interface FAQSectionProps {
  faqs?: { q?: string; a?: string; question?: string; answer?: string; icon?: React.ComponentType<{ className?: string }> }[];
}

export const FAQSection: FC<FAQSectionProps> = ({ faqs }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const usedFaqs: FAQ[] = (faqs && faqs.length > 0)
    ? faqs.map(faq => ({
        question: faq.question || faq.q || '',
        answer: faq.answer || faq.a || '',
        icon: faq.icon || HelpCircle
      }))
    : defaultFaqs;

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  }

  return (
    <section className="mb-16 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fe7b57]/10 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-[#fe7b57]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our study resources. Can&apos;t find what you&apos;re looking for?{' '}
            <span className="text-[#fe7b57] font-semibold">Contact our support team.</span>
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-6">
          {usedFaqs.map((item, index) => {
            const IconComponent = item.icon || HelpCircle;
            const isActive = activeIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-8 py-6 text-left focus:outline-none focus:ring-4 focus:ring-[#fe7b57]/20 transition-colors duration-200"
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <motion.div 
                        className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl transition-colors duration-300 ${
                          isActive ? 'bg-[#fe7b57] text-white' : 'bg-[#fe7b57]/10 text-[#fe7b57]'
                        }`}
                        animate={{ 
                          scale: isActive ? 1.1 : 1,
                          rotate: isActive ? 5 : 0 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
                      </motion.div>
                      <h3 className={`text-base md:text-lg font-semibold pr-2 md:pr-4 ${isActive ? 'text-[#fe7b57]' : 'text-gray-900'}`}>
                        <span className="text-base md:text-xl md:text-2xl">{item.question}</span>
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: isActive ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className={`w-6 h-6 transition-colors duration-300 ${
                        isActive ? 'text-[#fe7b57]' : 'text-gray-400'
                      }`} />
                    </motion.div>
                  </div>
                </motion.button>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="px-8 pb-6"
                      >
                        <div className="flex">
                          <div className="w-6 md:w-12 flex-shrink-0" />
                          <div className="pl-2 md:pl-4 pr-1">
                            <p className="py-4 text-gray-700 leading-relaxed text-sm md:text-base">
                              <span className="text-base md:text-lg md:text-xl">{item.answer}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  )
}

