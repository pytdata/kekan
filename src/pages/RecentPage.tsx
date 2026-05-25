import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Play, Clock, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ─── Activity store (localStorage) ────────────────────────────────────────────

export interface ActivityItem {
  id: string;           // book-X or vid-X
  type: 'book' | 'video';
  title: string;
  coverUrl?: string;
  thumbnailUrl?: string;
  author?: string;
  duration?: number;
  percentComplete: number;
  lastOpenedAt: string; // ISO
}

const STORAGE_KEY = 'kenkan_recent_activity';

export function recordActivity(item: Omit<ActivityItem, 'lastOpenedAt'>): void {
  try {
    const existing = getActivities();
    const filtered = existing.filter((a) => a.id !== item.id);
    const next: ActivityItem[] = [
      { ...item, lastOpenedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 30); // keep last 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function updateActivityProgress(id: string, percentComplete: number): void {
  try {
    const existing = getActivities();
    const next = existing.map((a) =>
      a.id === id ? { ...a, percentComplete, lastOpenedAt: new Date().toISOString() } : a,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function getActivities(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ActivityItem[];
  } catch { /* ignore */ }
  return [];
}

function clearActivities(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

type Filter = 'all' | 'books' | 'videos';

const RecentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const filtered = activities.filter((a) => filter === 'all' || a.type === (filter === 'books' ? 'book' : 'video'));

  const inProgress = filtered.filter((a) => a.percentComplete > 0 && a.percentComplete < 100);
  const notStarted = filtered.filter((a) => a.percentComplete === 0);
  const completed = filtered.filter((a) => a.percentComplete >= 100);

  const handleOpen = (item: ActivityItem) => {
    if (item.type === 'book') navigate(`/book/${item.id}`);
    else navigate(`/video/${item.id}`);
  };

  const handleRemove = (id: string) => {
    const next = activities.filter((a) => a.id !== id);
    setActivities(next);
    localStorage.setItem('kenkan_recent_activity', JSON.stringify(next));
  };

  const handleClearAll = () => {
    clearActivities();
    setActivities([]);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mb-4">
          <Clock size={32} className="text-rose-400" />
        </div>
        <h2 className="text-xl font-black text-slate-700 mb-2">Your Reading History</h2>
        <p className="text-sm text-slate-400 mb-6">Sign in to track your books and videos</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/login')}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-md"
        >
          Sign In
        </motion.button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Recent</h1>
          <p className="text-xs text-slate-400 mt-0.5">Pick up where you left off</p>
        </div>
        {activities.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClearAll}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100"
          >
            <Trash2 size={12} /> Clear all
          </motion.button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all', 'books', 'videos'] as Filter[]).map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.93 }}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              filter === f
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
                : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            {f}
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center h-52 text-slate-300">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
          >
            <Sparkles size={48} className="mb-3" />
          </motion.div>
          <p className="text-sm font-bold text-slate-400">No recent activity yet</p>
          <p className="text-xs text-slate-300 mt-1">Start reading or watching a story!</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/browse')}
            className="mt-4 bg-rose-500 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md"
          >
            Explore Stories
          </motion.button>
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <Section title="Continue" emoji="▶️">
          {inProgress.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              onOpen={handleOpen}
              onRemove={handleRemove}
            />
          ))}
        </Section>
      )}

      {/* Not Started */}
      {notStarted.length > 0 && (
        <Section title="Not Started" emoji="📌">
          {notStarted.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              onOpen={handleOpen}
              onRemove={handleRemove}
            />
          ))}
        </Section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Section title="Finished" emoji="🏆">
          {completed.map((item) => (
            <ActivityCard
              key={item.id}
              item={item}
              onOpen={handleOpen}
              onRemove={handleRemove}
            />
          ))}
        </Section>
      )}
    </div>
  );
};

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{emoji}</span>
        <h2 className="text-sm font-black text-slate-600 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// ─── Activity card ─────────────────────────────────────────────────────────────

function ActivityCard({
  item,
  onOpen,
  onRemove,
}: {
  item: ActivityItem;
  onOpen: (item: ActivityItem) => void;
  onRemove: (id: string) => void;
}) {
  const thumbUrl = item.type === 'book' ? item.coverUrl : item.thumbnailUrl;
  const isComplete = item.percentComplete >= 100;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -40 }}
        className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-slate-100"
      >
        {/* Thumbnail */}
        <motion.div
          whileTap={{ scale: 0.92 }}
          onClick={() => onOpen(item)}
          className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-rose-100 to-amber-100 shrink-0 cursor-pointer"
        >
          {thumbUrl ? (
            <img src={thumbUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.type === 'book' ? (
                <BookOpen size={22} className="text-rose-300" />
              ) : (
                <Play size={22} className="text-rose-300" />
              )}
            </div>
          )}
          {/* Type badge */}
          <div className="absolute bottom-1 left-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
            {item.type === 'book' ? (
              <BookOpen size={10} className="text-rose-500" />
            ) : (
              <Play size={10} className="text-rose-500" fill="currentColor" />
            )}
          </div>
        </motion.div>

        {/* Info */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpen(item)}
        >
          <p className="text-sm font-bold text-slate-700 truncate">{item.title}</p>
          {item.author && (
            <p className="text-[11px] text-slate-400 truncate">{item.author}</p>
          )}
          {item.duration && item.duration > 0 && (
            <p className="text-[11px] text-slate-400">{formatDuration(item.duration)}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            {/* Progress bar */}
            {!isComplete && (
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentComplete}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-rose-400 rounded-full"
                />
              </div>
            )}
            {isComplete && (
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                ✓ Done
              </span>
            )}
            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
              <Clock size={9} />
              {timeAgo(item.lastOpenedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onOpen(item)}
            className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronRight size={14} className="text-white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onRemove(item.id)}
            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"
          >
            <Trash2 size={12} className="text-slate-400" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default RecentPage;
