import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, BookOpen } from 'lucide-react';
import { recordActivity } from '@/pages/RecentPage';

interface BookCardProps {
  book: {
    id: string;
    title: string;
    coverUrl?: string;
    isPremium: boolean;
    author?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  percentComplete?: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, size = 'md', percentComplete = 0 }) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  };

  const handleClick = () => {
    recordActivity({
      id: book.id,
      type: 'book',
      title: book.title,
      coverUrl: book.coverUrl,
      author: book.author,
      percentComplete,
    });
    navigate(`/book/${book.id}`);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="flex-shrink-0 cursor-pointer"
    >
      <div className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-br from-rose-100 to-amber-100`}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="text-rose-300" size={32} />
          </div>
        )}
        {book.isPremium && (
          <div className="absolute top-2 right-2 bg-amber-400 text-white p-1 rounded-full shadow-sm">
            <Lock size={12} />
          </div>
        )}
        {percentComplete > 0 && percentComplete < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div className="h-full bg-rose-500" style={{ width: `${percentComplete}%` }} />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs font-bold text-slate-700 truncate w-full max-w-[8rem]">{book.title}</p>
      {book.author && <p className="text-[10px] text-slate-400 truncate w-full max-w-[8rem]">{book.author}</p>}
    </motion.div>
  );
};

export default BookCard;
