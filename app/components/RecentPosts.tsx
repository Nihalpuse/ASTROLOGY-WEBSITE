'use client'

import { blogPosts } from '../data/blogPosts';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/useLanguage';

const posts = Object.values(blogPosts).slice(0, 4); // 1 featured + 3 side

type PostLanguages = {
  en: string;
  hi: string;
};

type AdditionalPost = {
  title: PostLanguages;
  author: PostLanguages;
  date: string;
  category: string;
  imageUrl: string;
  themeColor: string;
};

// Additional mock posts for the new blocks
const additionalPosts: AdditionalPost[] = [
  {
    title: { en: "Mercury Retrograde Guide", hi: "बुध वक्री गाइड" },
    author: { en: "Acharya Raj Kumar", hi: "आचार्य राज कुमार" },
    date: "2024-04-14",
    category: "Naksh",
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1753079351/Mercury_Retrograde_ngktou.jpg",
    themeColor: "#4F46E5"
  },
  {
    title: { en: "Vastu Shastra Tips", hi: "वास्तु शास्त्र टिप्स" },
    author: { en: "Pandit Suresh Sharma", hi: "पंडित सुरेश शर्मा" },
    date: "2024-04-13",
    category: "Vastu",
    imageUrl: "https://res.cloudinary.com/dxwspucxw/image/upload/v1753079524/Vastu_Shastra_f0haqy.jpg",
    themeColor: "#059669"
  }
];

function getSafe(obj: Record<string, string>, lang: string) {
  return obj[lang] || obj['en'];
}

function getSafePost(obj: PostLanguages, lang: string): string {
  if (lang === 'en' || lang === 'hi') {
    return obj[lang as keyof PostLanguages];
  }
  return obj.en;
}

export default function RecentPosts() {
  const { lang, t } = useLanguage();

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">{t('blog.recent.heading')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: Two Featured Blogs */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* First Featured Blog - Height matches 2 right blocks */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[470px] md:h-[428px]">
            <div className="relative w-full h-64 md:h-64 flex items-center justify-center" style={{ background: posts[0].themeColor, transition: 'background 0.3s' }}>
              <Image src={posts[0].imageUrl} alt={posts[0].title.en} fill className="object-cover rounded-2xl" />
            </div>
            <div className="p-6 flex flex-col justify-between h-[164px]">
              {(() => {
                return (
                  <>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{getSafe(posts[0].title, lang)}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-4 gap-4 flex-wrap">
                        <span>👤 {getSafe(posts[0].author, lang)}</span>
                        <span>📅 {posts[0].date}</span>
                        <span>⏱ 2 {t('blog.featured.minRead')}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${posts[0].title.en.replace(/\s+/g, '-').toLowerCase()}`}
                      className="inline-block px-6 py-2 rounded-lg bg-black text-white text-base font-semibold shadow hover:bg-gray-800 transition-all w-max">
                      {t('blog.featured.readMore')} →
                    </Link>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Second Featured Blog - Height matches 2 right blocks */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[470px] md:h-[428px]">
            <div className="relative w-full h-64 md:h-64 flex items-center justify-center" style={{ background: additionalPosts[0].themeColor, transition: 'background 0.3s' }}>
              <Image src={additionalPosts[0].imageUrl} alt={additionalPosts[0].title.en} fill className="object-cover rounded-2xl" />
              
            </div>
            <div className="p-6 flex flex-col justify-between h-[164px]">
              {(() => {
                return (
                  <>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{getSafePost(additionalPosts[0].title, lang)}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-4 gap-4 flex-wrap">
                        <span>👤 {getSafePost(additionalPosts[0].author, lang)}</span>
                        <span>📅 {additionalPosts[0].date}</span>
                        <span>⏱ 3 {t('blog.featured.minRead')}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${additionalPosts[0].title.en.replace(/\s+/g, '-').toLowerCase()}`}
                      className="inline-block px-6 py-2 rounded-lg bg-black text-white text-base font-semibold shadow hover:bg-gray-800 transition-all w-max">
                      {t('blog.featured.readMore')} →
                    </Link>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Right Column: Four Stacked Blogs */}
        <div className="flex flex-col gap-6">
          {posts.slice(1).map((post, i) => {
            return (
              <div key={post.title.en} className="flex flex-row bg-white rounded-2xl shadow-lg overflow-hidden h-[230px] md:h-[200px] w-full md:w-[420px] mx-auto">
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 flex items-center justify-center my-auto mx-4" style={{ background: post.themeColor, transition: 'background 0.3s' }}>
                  <Image src={post.imageUrl} alt={post.title.en} fill className="object-cover rounded-2xl" />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{getSafe(post.title, lang)}</h4>
                  <div className="flex items-center text-sm text-gray-500 mb-3 gap-3 flex-wrap">
                    <span>📅 {post.date}</span>
                    <span>⏱ {4 + i} {t('blog.featured.minRead')}</span>
                  </div>
                  <Link href={`/blog/${post.title.en.replace(/\s+/g, '-').toLowerCase()}`}
                    className="inline-block px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold shadow hover:bg-gray-800 transition-all w-max">
                    {t('blog.featured.readMore')} →
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Fourth Blog (Additional) */}
          <div className="flex flex-row bg-white rounded-2xl shadow-lg overflow-hidden h-[230px] md:h-[200px] w-full md:w-[420px] mx-auto">
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 flex items-center justify-center my-auto mx-4" style={{ background: additionalPosts[1].themeColor, transition: 'background 0.3s' }}>
              <Image src={additionalPosts[1].imageUrl} alt={additionalPosts[1].title.en} fill className="object-cover rounded-2xl" />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-center">
              <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{getSafePost(additionalPosts[1].title, lang)}</h4>
              <div className="flex items-center text-sm text-gray-500 mb-3 gap-3 flex-wrap">
                <span>📅 {additionalPosts[1].date}</span>
                <span>⏱ 7 {t('blog.featured.minRead')}</span>
              </div>
              <Link href={`/blog/${additionalPosts[1].title.en.replace(/\s+/g, '-').toLowerCase()}`}
                className="inline-block px-4 py-2 rounded-lg bg-black text-white text-sm font-semibold shadow hover:bg-gray-800 transition-all w-max">
                {t('blog.featured.readMore')} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}