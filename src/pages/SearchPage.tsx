import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useDebounce } from '@/hooks/use-debounce';
import { motion } from 'motion/react';
import { Search, X, BookOpen, Play } from 'lucide-react';
import BookCard from '@/components/BookCard';
import VideoCard from '@/components/VideoCard';

const SEARCH_QUERY = gql`
  query Search($search: String) {
    books(search: $search) {
      id
      title
      coverUrl
      isPremium
      author
    }
    videos(search: $search) {
      id
      title
      thumbnailUrl
      isPremium
      duration
    }
  }
`;

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data, loading } = useQuery(SEARCH_QUERY, { variables: { search: debouncedQuery || undefined }, skip: debouncedQuery.length < 2 });

  const books = data?.books || [];
  const videos = data?.videos || [];

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-black text-slate-800 mb-4">Search</h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find books and videos..."
          className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Search className="text-rose-300" size={28} />
          </motion.div>
        </div>
      )}

      {!loading && debouncedQuery.length >= 2 && (
        <>
          {books.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-rose-500" />
                <h2 className="text-lg font-extrabold text-slate-800">Books</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {books.map((book: any) => (
                  <BookCard key={book.id} book={book} size="sm" />
                ))}
              </div>
            </section>
          )}

          {videos.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Play size={18} className="text-rose-500" />
                <h2 className="text-lg font-extrabold text-slate-800">Videos</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {videos.map((video: any) => (
                  <VideoCard key={video.id} video={video} size="full" />
                ))}
              </div>
            </section>
          )}

          {books.length === 0 && videos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <Search size={40} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">No results found</p>
            </div>
          )}
        </>
      )}

      {debouncedQuery.length < 2 && (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <Search size={48} className="mb-3 opacity-20" />
          <p className="text-sm font-medium">Type to search stories</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
