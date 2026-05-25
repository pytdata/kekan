import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useSound } from '@/hooks/use-sound';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/browse', icon: Compass, label: 'Browse' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { playTap } = useSound();

  const handleNav = (path: string) => {
    playTap();
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-colors ${
                isActive ? 'text-rose-500 bg-rose-50' : 'text-slate-400'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-0.5 font-semibold ${isActive ? 'text-rose-500' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomIndicator"
                  className="absolute bottom-1 w-6 h-1 bg-rose-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
