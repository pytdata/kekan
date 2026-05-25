import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dbPath = process.env.DATABASE_URL ? process.env.DATABASE_URL.replace('sqlite://', '') : join(__dirname, '..', 'db', 'kenkan.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar TEXT,
      auth_provider TEXT DEFAULT 'email',
      role TEXT DEFAULT 'user',
      password_hash TEXT,
      is_verified INTEGER DEFAULT 0,
      subscription_status TEXT DEFAULT 'free',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS otp_verifications (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp TEXT NOT NULL,
      purpose TEXT DEFAULT 'register',
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      color TEXT DEFAULT '#FF6B6B',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      epub_url TEXT,
      category_id TEXT,
      price REAL DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      author TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail_url TEXT,
      video_url TEXT,
      category_id TEXT,
      price REAL DEFAULT 0,
      is_premium INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      related_book_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reading_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      chapter_index INTEGER DEFAULT 0,
      scroll_position REAL DEFAULT 0,
      percent_complete REAL DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, book_id)
    );

    CREATE TABLE IF NOT EXISTS watch_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      current_time REAL DEFAULT 0,
      percent_complete REAL DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, video_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      amount REAL NOT NULL,
      paystack_reference TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subscription_id TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'success',
      paystack_reference TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Seed default categories if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare('INSERT INTO categories (id, name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?, ?)');
    const categories = [
      ['cat-1', 'Adventure', 'adventure', 'Exciting adventure stories', 'compass', '#FF6B6B'],
      ['cat-2', 'Fairy Tales', 'fairy-tales', 'Magical fairy tales', 'sparkles', '#9B59B6'],
      ['cat-3', 'Educational', 'educational', 'Fun learning stories', 'book-open', '#3498DB'],
      ['cat-4', 'Animals', 'animals', 'Stories about animals', 'cat', '#2ECC71'],
      ['cat-5', 'Bedtime', 'bedtime', 'Calming bedtime stories', 'moon', '#F39C12'],
    ];
    for (const c of categories) insert.run(c);
  }

  // Seed demo books if empty
  const bookCount = db.prepare('SELECT COUNT(*) as c FROM books').get() as { c: number };
  if (bookCount.c === 0) {
    db.prepare('INSERT INTO books (id, title, description, cover_url, epub_url, category_id, price, is_premium, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('book-1', 'The Jungle Quest', 'Join Leo the lion on an exciting adventure through the magical jungle.', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400', '', 'cat-1', 0, 0, 'Kenkan Author', '2024-01-15');
    db.prepare('INSERT INTO books (id, title, description, cover_url, epub_url, category_id, price, is_premium, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('book-2', 'Princess Luna', 'A brave princess discovers her magical powers under the moonlight.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', '', 'cat-2', 0, 1, 'Kenkan Author', '2024-02-10');
    db.prepare('INSERT INTO books (id, title, description, cover_url, epub_url, category_id, price, is_premium, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('book-3', 'ABC Safari', 'Learn the alphabet with friendly animals from around the world.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', '', 'cat-3', 0, 0, 'Kenkan Author', '2024-03-05');
    db.prepare('INSERT INTO books (id, title, description, cover_url, epub_url, category_id, price, is_premium, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('book-4', 'Sleepy Bear', 'A cozy bedtime story about a bear preparing for winter sleep.', 'https://images.unsplash.com/photo-1535068484706-1d2b60f2538e?w=400', '', 'cat-5', 0, 0, 'Kenkan Author', '2024-04-20');
  }

  // Seed demo videos if empty
  const videoCount = db.prepare('SELECT COUNT(*) as c FROM videos').get() as { c: number };
  if (videoCount.c === 0) {
    db.prepare('INSERT INTO videos (id, title, description, thumbnail_url, video_url, category_id, price, is_premium, duration, related_book_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('vid-1', 'The Jungle Quest - Animated', 'Watch Leo come to life in this animated adventure!', 'https://images.unsplash.com/photo-1535083783855-9e2b9de1f5de?w=400', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'cat-1', 0, 0, 596, 'book-1');
    db.prepare('INSERT INTO videos (id, title, description, thumbnail_url, video_url, category_id, price, is_premium, duration, related_book_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('vid-2', 'Princess Luna - Trailer', 'A sneak peek into the magical world of Princess Luna.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'cat-2', 0, 1, 653, 'book-2');
  }

  // Seed demo user
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (userCount.c === 0) {
    db.prepare('INSERT INTO users (id, email, name, avatar, auth_provider, role, is_verified, subscription_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run('user-1', 'demo@kenkan.com', 'Demo Kid', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', 'email', 'user', 1, 'premium');
    db.prepare('INSERT INTO users (id, email, name, avatar, auth_provider, role, is_verified, subscription_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run('admin-1', 'admin@kenkan.com', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'email', 'admin', 1, 'premium');
    db.prepare('INSERT INTO subscriptions (id, user_id, plan, status, amount, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('sub-1', 'user-1', 'Monthly', 'active', 9.99, '2024-01-01', '2025-01-01');
    db.prepare('INSERT INTO payments (id, user_id, subscription_id, amount, status, paystack_reference) VALUES (?, ?, ?, ?, ?, ?)')
      .run('pay-1', 'user-1', 'sub-1', 9.99, 'success', 'REF123');
  }
}
