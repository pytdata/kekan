import React from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, PlayCircle, ChevronRight, Crown } from 'lucide-react';
import BookCard from '@/components/BookCard';
import VideoCard from '@/components/VideoCard';
import SectionHeader from '@/components/SectionHeader';
import { useAuth } from '@/contexts/AuthContext';

const HOME_QUERY = gql`
  query HomeData {
    books {
      id
      title
      coverUrl
      isPremium
      author
      categoryId
    }
    videos {
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
      icon
    }
    myReadingProgress {
      bookId
      percentComplete
    }
    myWatchProgress {
      videoId
      percentComplete
    }
  }
`;

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading } = useQuery(HOME_QUERY, { skip: !user });

  const books = data?.books || [];
  const videos = data?.videos || [];
  const categories = data?.categories || [];
  const readingProgress = data?.myReadingProgress || [];
  const watchProgress = data?.myWatchProgress || [];

  const inProgressBooks = books.filter((b: any) => readingProgress.some((p: any) => p.bookId === b.id && p.percentComplete > 0 && p.percentComplete < 100));
  const inProgressVideos = videos.filter((v: any) => watchProgress.some((p: any) => p.videoId === v.id && p.percentComplete > 0 && p.percentComplete < 100));

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-rose-50 to-amber-50">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
          <div className="w-24 h-24 bg-rose-500 rounded-3xl flex items-center justify-center shadow-xl mb-6">
            <BookOpen size={48} className="text-white" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 text-center">Kenkan Books</h1>
        <p className="text-slate-500 text-center mb-8">Read, Watch & Explore Amazing Stories!</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="w-full max-w-xs bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-rose-200"
        >
          Get Started
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/register')}
          className="w-full max-w-xs mt-3 bg-white text-rose-500 border-2 border-rose-200 py-4 rounded-2xl font-bold text-lg"
        >
          Create Account
        </motion.button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Sparkles className="text-rose-400" size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Hello, {user.name || 'Reader'}!</h1>
          <p className="text-sm text-slate-400">What story today?</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/subscription')} className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.subscriptionStatus === 'premium' ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
            <Crown size={20} />
          </div>
          {user.subscriptionStatus !== 'premium' && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </motion.button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat: any) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/browse', { state: { categoryId: cat.id } })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-md flex-shrink-0"
            style={{ backgroundColor: cat.color }}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Continue Reading/Watching */}
      {(inProgressBooks.length > 0 || inProgressVideos.length > 0) && (
        <section>
          <SectionHeader title="Continue" action={<button onClick={() => navigate('/browse')} className="text-rose-500 text-xs font-bold flex items-center">See all <ChevronRight size={14} /></button>} />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {inProgressBooks.map((book: any) => (
              <BookCard key={book.id} book={book} size="sm" />
            ))}
            {inProgressVideos.map((video: any) => (
              <VideoCard key={video.id} video={video} size="sm" />
            ))}
          </div>
        </section>
      )}

      {/* Featured Books */}
      <section>
        <SectionHeader title="Popular Books" action={<button onClick={() => navigate('/browse')} className="text-rose-500 text-xs font-bold flex items-center">See all <ChevronRight size={14} /></button>} />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {books.slice(0, 6).map((book: any) => (
            <BookCard key={book.id} book={book} size="md" />
          ))}
        </div>
      </section>

      {/* Animated Stories */}
      <section>
        <SectionHeader title="Animated Stories" action={<button onClick={() => navigate('/browse')} className="text-rose-500 text-xs font-bold flex items-center">See all <ChevronRight size={14} /></button>} />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {videos.map((video: any) => (
            <VideoCard key={video.id} video={video} size="md" />
          ))}
        </div>
      </section>

      {/* New Books */}
      <section>
        <SectionHeader title="New Arrivals" action={<button onClick={() => navigate('/browse')} className="text-rose-500 text-xs font-bold flex items-center">See all <ChevronRight size={14} /></button>} />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
          {books.slice(0, 4).map((book: any) => (
            <BookCard key={book.id} book={book} size="sm" />
          ))}
        </div>
      </section>

      {/* Quick Action */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/browse')}
        className="bg-gradient-to-r from-rose-500 to-amber-500 rounded-3xl p-5 text-white shadow-lg flex items-center gap-4 cursor-pointer"
      >
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <PlayCircle size={28} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Discover More</h3>
          <p className="text-white/80 text-sm">Explore hundreds of stories</p>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
