import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Play, BookOpenText } from 'lucide-react';
import BookCard from '@/components/BookCard';
import VideoCard from '@/components/VideoCard';
import SectionHeader from '@/components/SectionHeader';

const BROWSE_QUERY = gql`
  query BrowseData($categoryId: ID) {
    books(categoryId: $categoryId) {
      id
      title
      coverUrl
      isPremium
      author
      categoryId
    }
    videos(categoryId: $categoryId) {
      id
      title
      thumbnailUrl
      isPremium
      duration
    }
    categories {
      id
      name
      color
    }
  }
`;

type Tab = 'all' | 'books' | 'videos';

const BrowsePage: React.FC = () => {
  const location = useLocation();
  const initialCategory = (location.state as any)?.categoryId;
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);

  const { data, loading } = useQuery(BROWSE_QUERY, { variables: { categoryId: selectedCategory } });

  const books = data?.books || [];
  const videos = data?.videos || [];
  const categories = data?.categories || [];

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'All', icon: BookOpen },
    { key: 'books', label: 'Books', icon: BookOpenText },
    { key: 'videos', label: 'Videos', icon: Play },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-black text-slate-800 mb-4">Browse</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              activeTab === tab.key ? 'bg-rose-500 text-white shadow-md shadow-rose-200' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 ${
            !selectedCategory ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          All
        </motion.button>
        {categories.map((cat: any) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-colors ${
              selectedCategory === cat.id ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
            style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <BookOpen className="text-rose-300" size={32} />
          </motion.div>
        </div>
      )}

      {/* Content */}
      {(activeTab === 'all' || activeTab === 'books') && books.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Books" />
          <div className="grid grid-cols-3 gap-3">
            {books.map((book: any) => (
              <BookCard key={book.id} book={book} size="sm" />
            ))}
          </div>
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
        <section>
          <SectionHeader title="Videos" />
          <div className="grid grid-cols-2 gap-3">
            {videos.map((video: any) => (
              <VideoCard key={video.id} video={video} size="full" />
            ))}
          </div>
        </section>
      )}

      {!loading && books.length === 0 && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
          <BookOpen size={40} className="mb-2 opacity-30" />
          <p className="text-sm font-medium">No stories found</p>
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
