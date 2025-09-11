import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

const ICON_COLOR = '#F59E0B'; // amber-500
const ACCENT_COLOR = '#F59E0B';

const assurances = [
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke={ICON_COLOR} strokeWidth="2.5" fill="none"/>
        <path d="M16 26l6 6 10-14" stroke={ICON_COLOR} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24 10l3 6h-6l3-6z" stroke={ICON_COLOR} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'PURITY PROMISE',
    description: 'Guaranteed authentic quality'
  },
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke={ICON_COLOR} strokeWidth="2.5" fill="none"/>
        <path d="M24 12v16" stroke={ICON_COLOR} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="24" cy="34" r="3" fill={ICON_COLOR}/>
      </svg>
    ),
    label: 'CERTIFIED NATURAL',
    description: 'Lab-verified authenticity'
  },
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke={ICON_COLOR} strokeWidth="2.5" fill="none"/>
        <circle cx="24" cy="24" r="8" stroke={ICON_COLOR} strokeWidth="2" fill="none"/>
        <path d="M24 16v16M16 24h16" stroke={ICON_COLOR} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    label: 'ETHICAL SOURCING',
    description: 'Responsibly obtained'
  },
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke={ICON_COLOR} strokeWidth="2.5" fill="none"/>
        <rect x="16" y="16" width="16" height="16" stroke={ICON_COLOR} strokeWidth="2" fill="none" rx="2"/>
        <circle cx="24" cy="24" r="4" stroke={ICON_COLOR} strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    label: 'AURA TUNED',
    description: 'Energetically aligned'
  },
  {
    icon: (
      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" stroke={ICON_COLOR} strokeWidth="2.5" fill="none"/>
        <path d="M16 34h16M24 12v20" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 28l4 4 4-4" stroke={ICON_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'FREE DELIVERY',
    description: 'Complimentary shipping'
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.6
    }
  }
};

const iconHoverVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300
    }
  }
};

export default function ProductAssuranceBar() {
  return (
    <motion.section 
      className="w-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FEFBF2 0%, #FEF7E6 50%, #FEFBF2 100%)',
        marginLeft: 'calc(50% - 50vw)', 
        marginRight: 'calc(50% - 50vw)'
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-yellow-200/15 to-amber-200/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 mb-4" 
                style={{ fontFamily: 'Playfair Display, serif' }}>
              Our Sacred Promise
            </h2>
            <motion.div
              className="w-16 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>

          {/* Assurances Grid */}
          <motion.div variants={containerVariants}>
            
            {/* Mobile Layout: 2x3 Grid (hide first item on mobile) */}
            <div className="grid grid-cols-2 gap-6 sm:hidden">
              {assurances
                .filter((_, i) => i !== 0)
                .map((assurance, index) => (
                <motion.div
                  key={assurance.label}
                  variants={itemVariants}
                  whileHover="hover"
                  className="flex flex-col items-center text-center group"
                >
                  <motion.div
                    variants={iconHoverVariants}
                    className="relative mb-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-10 h-10 flex items-center justify-center relative z-20">
                      {assurance.icon}
                    </div>
                    {/* subtle hover tint but keep icon clearly visible */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-orange-50/20 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  </motion.div>
                  
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-1 leading-tight"
                      style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}>
                    {assurance.label}
                  </h3>
                  
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {assurance.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tablet Layout: 2x3 Grid (hide first item on tablet) */}
            <div className="hidden sm:grid lg:hidden grid-cols-2 gap-8">
              {assurances
                .filter((_, i) => i !== 0)
                .map((assurance, index) => (
                <motion.div
                  key={assurance.label}
                  variants={itemVariants}
                  whileHover="hover"
                  className="flex flex-col items-center text-center group"
                >
                  <motion.div
                    variants={iconHoverVariants}
                    className="relative mb-5 p-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 flex items-center justify-center relative z-20">
                      {assurance.icon}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-orange-50/20 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  </motion.div>
                  
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2"
                      style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}>
                    {assurance.label}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {assurance.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Desktop Layout: Single Row with Separators */}
            <div className="hidden lg:flex items-stretch justify-between">
              {assurances.map((assurance, index) => (
                <React.Fragment key={assurance.label}>
                  <motion.div
                    variants={itemVariants}
                    whileHover="hover"
                    className="flex flex-col items-center text-center group flex-1"
                  >
                    <motion.div
                      variants={iconHoverVariants}
                      className="relative mb-6 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg group-hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="w-14 h-14 flex items-center justify-center relative z-20">
                        {assurance.icon}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-orange-50/20 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 z-10 pointer-events-none"></div>
                    </motion.div>
                    
                    <h3 className="text-base font-bold text-gray-800 uppercase tracking-wider mb-3"
                        style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '0.05em' }}>
                      {assurance.label}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed max-w-32">
                      {assurance.description}
                    </p>
                  </motion.div>
                  
                  {/* Separator Line */}
                  {index < assurances.length - 1 && (
                    <motion.div
                      className="flex items-center mx-8"
                      initial={{ scaleY: 0, opacity: 0 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    >
                      <div className="h-24 w-px bg-gradient-to-b from-transparent via-amber-300/60 to-transparent"></div>
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
} 