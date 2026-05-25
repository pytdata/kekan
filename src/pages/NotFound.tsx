import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 px-6">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
        <BookOpen size={36} className="text-slate-300" />
      </div>
      <h1 className="text-4xl font-black text-slate-800 mb-2">Lost?</h1>
      <p className="text-slate-500 mb-8 text-center">This page doesn't exist in our storybook.</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
      >
        Go Home
      </motion.button>
    </div>
  );
};

export default NotFound;
