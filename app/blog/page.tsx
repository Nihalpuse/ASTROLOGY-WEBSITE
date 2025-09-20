'use client';
import { BlogPreview } from '../components/BlogPreview'
import FeaturedBlogs from '../components/FeaturedBlogs'
import RecentPosts from '../components/RecentPosts'
import { CTASection } from '../components/CTASection'
import { useLanguage } from '../contexts/useLanguage'
import { blogPosts } from '../data/blogPosts'
import { motion } from 'framer-motion'

export default function BlogPage() {
  const { t } = useLanguage();
  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      <div className="relative min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Banner Heading with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-5xl mx-auto rounded-3xl bg-[#FFFFF0] py-12 px-4 md:px-16 flex flex-col items-center justify-center shadow-lg"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-black mb-4 text-center drop-shadow-lg tracking-tight font-serif">{t('blog.banner.heading')}</h1>
            <p className="text-lg md:text-2xl text-gray-700 text-center max-w-2xl font-sans">{t('blog.banner.subheading')}</p>
          </motion.div>
          <FeaturedBlogs />
          <RecentPosts />
          <CTASection />
        </div>
      </div>
    </div>
  )
}

