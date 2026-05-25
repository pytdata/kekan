import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sun, Moon, Type, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const BOOK_QUERY = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      description
      coverUrl
      epubUrl
      author
    }
  }
`;

const SAVE_PROGRESS = gql`
  mutation SaveReadingProgress($bookId: ID!, $percentComplete: Float!) {
    saveReadingProgress(bookId: $bookId, percentComplete: $percentComplete) {
      bookId
      percentComplete
    }
  }
`;

const demoChapters = [
  { title: 'Chapter 1: The Beginning', content: 'Once upon a time, in a land far, far away, there lived a brave young hero named Leo. The sun shone brightly over the golden meadows, and birds sang melodies that filled the air with joy. Leo loved to explore the enchanted forest near his home, where every tree had a story to tell and every flower whispered secrets of magic. One sunny morning, as Leo wandered deeper into the woods than ever before, he stumbled upon a glowing path that seemed to shimmer with stardust...' },
  { title: 'Chapter 2: The Magic Forest', content: 'The trees grew taller and the air felt cooler as Leo stepped onto the glowing path. Fireflies danced around him like tiny lanterns, lighting his way through the thick canopy of emerald leaves. Suddenly, a friendly fox with silver fur appeared from behind a mushroom house. "Welcome, traveler," said the fox with a warm smile. "I am Finn, the guardian of the Magic Forest. I have been waiting for someone brave enough to follow the stardust path." Leo felt a surge of excitement and wonder...' },
  { title: 'Chapter 3: The First Challenge', content: 'Finn led Leo to a crystal-clear lake where the water reflected the stars even during the day. "Your first challenge," explained Finn, "is to find the courage to cross the Whispering Bridge. It is said that only those with pure hearts can hear its song and safely reach the other side." Leo approached the bridge made of ancient wood and silver vines. As he placed his first step, the bridge began to hum a melody so beautiful that tears filled his eyes...' },
  { title: 'Chapter 4: New Friends', content: "On the other side of the bridge, Leo discovered a village of tiny creatures called Lumlings. They were no bigger than acorns, with wings like dragonflies and hearts full of kindness. The Lumlings celebrated Leo's arrival with a feast of honey cakes and starlight juice. Their leader, a wise Lumling named Twinkle, presented Leo with a glowing pendant. 'This will guide you through the darkest nights and remind you that courage lives within your heart,' she said with a gentle voice..." },
];

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading } = useQuery(BOOK_QUERY, { variables: { id } });
  const [saveProgress] = useMutation(SAVE_PROGRESS);

  const [chapter, setChapter] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  // Controls only toggle on tap — never auto-hide
  const [showControls, setShowControls] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    try {
      await saveProgress({
        variables: {
          bookId: id,
          percentComplete: ((chapter + 1) / demoChapters.length) * 100,
        },
      });
      toast.success('Progress saved!');
    } catch {
      toast.error('Failed to save progress');
    }
  };

  const handleBack = () => {
    handleSave();
    navigate(-1);
  };

  const book = data?.book;
  const currentChapter = demoChapters[chapter] || demoChapters[0];

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <ArrowLeft className="text-rose-400" size={32} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>

      {/* Always-visible back button (top-left, above the toggling bar) */}
      <div className="fixed top-0 left-0 z-50 p-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleBack}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
            darkMode ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-700'
          }`}
        >
          <ArrowLeft size={20} />
        </motion.button>
      </div>

      {/* Top toolbar — toggles on tap */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="topbar"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 pl-16 ${
              darkMode ? 'bg-slate-800/95' : 'bg-white/95'
            } backdrop-blur-sm border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'} shadow-sm`}
          >
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{book?.title || 'Reading'}</p>
              <p className="text-[10px] text-slate-400">{currentChapter.title}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setBookmarked(!bookmarked)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                bookmarked ? 'bg-amber-100 text-amber-500' : darkMode ? 'bg-slate-700' : 'bg-slate-100'
              }`}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable content — tap to toggle controls */}
      <div
        ref={contentRef}
        onClick={() => setShowControls((v) => !v)}
        className="px-6 pt-20 pb-40"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.9' }}
      >
        <h2 className="text-xl font-black mb-6">{currentChapter.title}</h2>
        <p className="font-medium leading-relaxed">{currentChapter.content}</p>
        <p className="font-medium leading-relaxed mt-4">{currentChapter.content}</p>
        <p className="font-medium leading-relaxed mt-4">{currentChapter.content}</p>
      </div>

      {/* Bottom controls — toggles on tap */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            key="bottombar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-0 left-0 right-0 z-40 px-4 pt-3 pb-4 ${
              darkMode ? 'bg-slate-800/95' : 'bg-white/95'
            } backdrop-blur-sm border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setFontSize((s) => Math.min(s + 2, 24)); }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                >
                  A+
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setFontSize((s) => Math.max(s - 2, 12)); }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                >
                  A-
                </motion.button>
              </div>
              <span className="text-xs font-bold text-slate-400">{chapter + 1} / {demoChapters.length}</span>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={chapter === 0}
                onClick={(e) => { e.stopPropagation(); setChapter(chapter - 1); }}
                className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Prev
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); handleSave(); }}
                className="px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm shadow-md"
              >
                Save
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={chapter >= demoChapters.length - 1}
                onClick={(e) => { e.stopPropagation(); setChapter(chapter + 1); }}
                className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReaderPage;
