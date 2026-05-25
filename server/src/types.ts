export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  auth_provider: string;
  role: string;
  subscription_status: string;
  is_verified: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  epub_url: string | null;
  category_id: string | null;
  price: number;
  is_premium: number;
  author: string | null;
  published_at: string | null;
  created_at: string;
  category?: Category | null;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  category_id: string | null;
  price: number;
  is_premium: number;
  duration: number;
  related_book_id: string | null;
  created_at: string;
  category?: Category | null;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  chapter_index: number;
  scroll_position: number;
  percent_complete: number;
  updated_at: string;
}

export interface WatchProgress {
  id: string;
  user_id: string;
  video_id: string;
  current_time: number;
  percent_complete: number;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  amount: number;
  paystack_reference: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  status: string;
  paystack_reference: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalBooks: number;
  totalVideos: number;
}

export interface Context {
  user?: User | null;
}
