import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Lock, Clock } from 'lucide-react';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    isPremium: boolean;
    duration?: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, size = 'md' }) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'w-40 h-24',
    md: 'w-52 h-32',
    lg: 'w-64 h-40',
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(`/video/${video.id}`)}
      className="flex-shrink-0 cursor-pointer"
    >
      <div className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden shadow-md bg-slate-800`}>
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-700">
            <Play className="text-white opacity-50" size={32} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
            <Play size={18} className="text-rose-500 ml-0.5" fill="currentColor" />
          </div>
        </div>
        {video.duration !== undefined && video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Clock size={10} />
            {formatDuration(video.duration)}
          </div>
        )}
        {video.isPremium && (
          <div className="absolute top-2 right-2 bg-amber-400 text-white p-1 rounded-full shadow-sm">
            <Lock size={12} />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs font-bold text-slate-700 truncate w-52">{video.title}</p>
    </motion.div>
  );
};

export default VideoCard;
