import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { motion } from 'motion/react';
import { ArrowLeft, Sun, Moon, Type, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const BOOK_QUERY = gql`
  query Book($id: ID!) {
    book(id: $id) {
      id
      title
      description
      coverUrl
      epubUrl
      author
    }
    readingProgress(bookId: $id) {
      chapterIndex
      scrollPosition
      percentComplete
    }
  }
`;

const SAVE_PROGRESS = gql`
  mutation SaveReadingProgress($input: ProgressInput!) {
    saveReadingProgress(input: $input) {
      id
      percentComplete
    }
  }
`;

const demoChapters = [
  { title: 'Chapter 1: The Beginning', content: 'Once upon a time, in a land far, far away, there lived a brave young hero named Leo. The sun shone brightly over the golden meadows, and birds sang melodies that filled the air with joy. Leo loved to explore the enchanted forest near his home, where every tree had a story to tell and every flower whispered secrets of magic. One sunny morning, as Leo wandered deeper into the woods than ever before, he stumbled upon a glowing path that seemed to shimmer with stardust...' },
  { title: 'Chapter 2: The Magic Forest', content: 'The trees grew taller and the air felt cooler as Leo stepped onto the glowing path. Fireflies danced around him like tiny lanterns, lighting his way through the thick canopy of emerald leaves. Suddenly, a friendly fox with silver fur appeared from behind a mushroom house. "Welcome, traveler," said the fox with a warm smile. "I am Finn, the guardian of the Magic Forest. I have been waiting for someone brave enough to follow the stardust path." Leo felt a surge of excitement and wonder...' },
  { title: 'Chapter 3: The First Challenge', content: 'Finn led Leo to a crystal-clear lake where the water reflected the stars even during the day. "Your first challenge," explained Finn, "is to find the courage to cross the Whispering Bridge. It is said that only those with pure hearts can hear its song and safely reach the other side." Leo approached the bridge made of ancient wood and silver vines. As he placed his first step, the bridge began to hum a melody so beautiful that tears filled his eyes...' },
  { title: 'Chapter 4: New Friends', content: 'On the other side of the bridge, Leo discovered a village of tiny creatures called Lumlings. They were no bigger than acorns, with wings like dragonflies and hearts full of kindness. The Lumlings celebrated Leo\'s arrival with a feast of honey cakes and starlight juice. Their leader, a wise Lumling named Twinkle, presented Leo with a glowing pendant. "This will guide you through the darkest nights and remind you that courage lives within your heart," she said with a gentle voice...' },
];

const ReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading } = useQuery(BOOK_QUERY, { variables: { id } });
  const [saveProgress] = useMutation(SAVE_PROGRESS);

  const [chapter, setChapter] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showControls, setShowControls] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.readingProgress) {
      setChapter(data.readingProgress.chapterIndex || 0);
    }
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const handleSave = async () => {
    try {
      await saveProgress({ variables: { input: { bookId: id, chapterIndex: chapter, scrollPosition: 0, percentComplete: ((chapter + 1) / demoChapters.length) * 100 } } });
      toast.success('Progress saved!');
    } catch {
      toast.error('Failed to save progress');
    }
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
    <div className={`relative h-screen overflow-hidden ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-800'}`}>
      {/* Top Bar */}
      <motion.div
        initial={false}
        animate={{ y: showControls ? 0 : -80 }}
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 ${darkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}
      >
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { handleSave(); navigate(-1); }} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
            <ArrowLeft size={18} />
          </motion.button>
          <div className="ml-1">
            <p className="text-xs font-bold truncate max-w-[180px]">{book?.title || 'Reading'}</p>
            <p className="text-[10px] text-slate-400">{currentChapter.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setBookmarked(!bookmarked)} className={`w-9 h-9 rounded-full flex items-center justify-center ${bookmarked ? 'bg-amber-100 text-amber-500' : 'bg-slate-100'}`}>
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div
        ref={contentRef}
        onClick={() => setShowControls(!showControls)}
        className="h-full overflow-y-auto px-6 pt-20 pb-24"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
      >
        <h2 className="text-xl font-black mb-6">{currentChapter.title}</h2>
        <p className="font-medium leading-relaxed">{currentChapter.content}</p>
        <p className="font-medium leading-relaxed mt-4">{currentChapter.content}</p>
        <p className="font-medium leading-relaxed mt-4">{currentChapter.content}</p>
      </div>

      {/* Bottom Bar */}
      <motion.div
        initial={false}
        animate={{ y: showControls ? 0 : 80 }}
        className={`absolute bottom-0 left-0 right-0 z-30 px-4 py-3 ${darkMode ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDarkMode(!darkMode)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFontSize((s) => Math.min(s + 2, 24))} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
              <Type size={16} />
              <span className="text-[8px] absolute -top-0.5">+</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setFontSize((s) => Math.max(s - 2, 12))} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
              <Type size={16} />
              <span className="text-[8px] absolute -top-0.5">-</span>
            </motion.button>
          </div>
          <span className="text-xs font-bold text-slate-400">{chapter + 1} / {demoChapters.length}</span>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={chapter === 0}
            onClick={() => setChapter(chapter - 1)}
            className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Prev
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-4 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm shadow-md"
          >
            Save
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={chapter >= demoChapters.length - 1}
            onClick={() => setChapter(chapter + 1)}
            className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReaderPage;
