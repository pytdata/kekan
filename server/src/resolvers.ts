import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { hashPassword, comparePassword, generateToken, verifyToken, createOtp, verifyOtp as verifyOtpUtil } from './utils/auth.js';
import type { User, Context, AnalyticsSummary, ChartData } from './types.js';

function requireAuth(ctx: Context): User {
  if (!ctx.user) throw new Error('Authentication required');
  return ctx.user;
}

function requireAdmin(ctx: Context): User {
  const user = requireAuth(ctx);
  if (user.role !== 'admin') throw new Error('Admin access required');
  return user;
}

function mapUser(row: Record<string, any>): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar: row.avatar,
    auth_provider: row.auth_provider,
    role: row.role,
    subscription_status: row.subscription_status,
    is_verified: row.is_verified,
    created_at: row.created_at,
  };
}

export const resolvers = {
  Query: {
    me: (_: any, __: any, ctx: Context) => ctx.user ? mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.user.id) as Record<string, any>) : null,

    users: (_: any, __: any, ctx: Context) => {
      requireAdmin(ctx);
      return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all().map(mapUser);
    },

    categories: () => db.prepare('SELECT * FROM categories ORDER BY name').all(),
    category: (_: any, { id }: { id: string }) => db.prepare('SELECT * FROM categories WHERE id = ?').get(id),

    books: (_: any, { categoryId, search, isPremium }: any) => {
      let sql = 'SELECT * FROM books WHERE 1=1';
      const params: any[] = [];
      if (categoryId) { sql += ' AND category_id = ?'; params.push(categoryId); }
      if (search) { sql += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (isPremium !== undefined) { sql += ' AND is_premium = ?'; params.push(isPremium ? 1 : 0); }
      sql += ' ORDER BY created_at DESC';
      return db.prepare(sql).all(...params);
    },

    book: (_: any, { id }: { id: string }) => {
      const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
      if (!book) throw new Error('Book not found');
      return book;
    },

    videos: (_: any, { categoryId, search, isPremium }: any) => {
      let sql = 'SELECT * FROM videos WHERE 1=1';
      const params: any[] = [];
      if (categoryId) { sql += ' AND category_id = ?'; params.push(categoryId); }
      if (search) { sql += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
      if (isPremium !== undefined) { sql += ' AND is_premium = ?'; params.push(isPremium ? 1 : 0); }
      sql += ' ORDER BY created_at DESC';
      return db.prepare(sql).all(...params);
    },

    video: (_: any, { id }: { id: string }) => {
      const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
      if (!video) throw new Error('Video not found');
      return video;
    },

    myReadingProgress: (_: any, __: any, ctx: Context) => {
      const user = requireAuth(ctx);
      return db.prepare('SELECT * FROM reading_progress WHERE user_id = ? ORDER BY updated_at DESC').all(user.id);
    },

    myWatchProgress: (_: any, __: any, ctx: Context) => {
      const user = requireAuth(ctx);
      return db.prepare('SELECT * FROM watch_progress WHERE user_id = ? ORDER BY updated_at DESC').all(user.id);
    },

    readingProgress: (_: any, { bookId }: { bookId: string }, ctx: Context) => {
      const user = requireAuth(ctx);
      return db.prepare('SELECT * FROM reading_progress WHERE user_id = ? AND book_id = ?').get(user.id, bookId);
    },

    watchProgress: (_: any, { videoId }: { videoId: string }, ctx: Context) => {
      const user = requireAuth(ctx);
      return db.prepare('SELECT * FROM watch_progress WHERE user_id = ? AND video_id = ?').get(user.id, videoId);
    },

    subscriptions: (_: any, __: any, ctx: Context) => {
      requireAdmin(ctx);
      return db.prepare('SELECT * FROM subscriptions ORDER BY created_at DESC').all();
    },

    mySubscription: (_: any, __: any, ctx: Context) => {
      const user = requireAuth(ctx);
      return db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1').get(user.id, 'active');
    },

    payments: (_: any, __: any, ctx: Context) => {
      requireAdmin(ctx);
      return db.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
    },

    myPayments: (_: any, __: any, ctx: Context) => {
      const user = requireAuth(ctx);
      return db.prepare('SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    },

    analytics: (_: any, __: any, ctx: Context) => {
      requireAdmin(ctx);

      const summary = db.prepare(`
        SELECT
          (SELECT COUNT(*) FROM users) as totalUsers,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success') as totalRevenue,
          (SELECT COUNT(*) FROM subscriptions WHERE status = 'active') as activeSubscriptions,
          (SELECT COUNT(*) FROM books) as totalBooks,
          (SELECT COUNT(*) FROM videos) as totalVideos
      `).get() as AnalyticsSummary;

      const subscriptionDist = db.prepare(`
        SELECT plan as label, COUNT(*) as value FROM subscriptions GROUP BY plan
      `).all() as ChartData[];

      const categoryDist = db.prepare(`
        SELECT c.name as label, COUNT(b.id) as value
        FROM categories c LEFT JOIN books b ON c.id = b.category_id
        GROUP BY c.id
      `).all() as ChartData[];

      const monthlyRevenue = db.prepare(`
        SELECT strftime('%Y-%m', created_at) as label, SUM(amount) as value
        FROM payments WHERE status = 'success' GROUP BY label ORDER BY label
      `).all() as ChartData[];

      const monthlyUsers = db.prepare(`
        SELECT strftime('%Y-%m', created_at) as label, COUNT(*) as value
        FROM users GROUP BY label ORDER BY label
      `).all() as ChartData[];

      const userGrowth = monthlyUsers;
      const revenueGrowth = monthlyRevenue;

      return { summary, subscriptionDistribution: subscriptionDist, categoryDistribution: categoryDist, monthlyRevenue, monthlyUsers, userGrowth, revenueGrowth };
    },
  },

  Book: {
    category: (parent: any) => parent.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(parent.category_id) : null,
    isPremium: (parent: any) => parent.is_premium === 1,
    coverUrl: (parent: any) => parent.cover_url,
    epubUrl: (parent: any) => parent.epub_url,
    categoryId: (parent: any) => parent.category_id,
    publishedAt: (parent: any) => parent.published_at,
    createdAt: (parent: any) => parent.created_at,
  },

  Video: {
    category: (parent: any) => parent.category_id ? db.prepare('SELECT * FROM categories WHERE id = ?').get(parent.category_id) : null,
    isPremium: (parent: any) => parent.is_premium === 1,
    thumbnailUrl: (parent: any) => parent.thumbnail_url,
    videoUrl: (parent: any) => parent.video_url,
    categoryId: (parent: any) => parent.category_id,
    relatedBookId: (parent: any) => parent.related_book_id,
    createdAt: (parent: any) => parent.created_at,
  },

  User: {
    authProvider: (parent: any) => parent.auth_provider,
    subscriptionStatus: (parent: any) => parent.subscription_status,
    isVerified: (parent: any) => parent.is_verified === 1,
    createdAt: (parent: any) => parent.created_at,
  },

  Mutation: {
    register: (_: any, { email, password, name }: any) => {
      const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existing) throw new Error('User already exists');
      const id = uuidv4();
      const passwordHash = hashPassword(password);
      db.prepare('INSERT INTO users (id, email, name, password_hash, auth_provider, is_verified) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, email, name || null, passwordHash, 'email', 0);
      const user = mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, any>);
      const token = generateToken(user);
      return { token, user };
    },

    login: (_: any, { email, password }: any) => {
      const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, any> | undefined;
      if (!row || !row.password_hash) throw new Error('Invalid credentials');
      if (!comparePassword(password, row.password_hash)) throw new Error('Invalid credentials');
      const user = mapUser(row);
      const token = generateToken(user);
      return { token, user };
    },

    socialLogin: (_: any, { provider, name, email, avatar }: any) => {
      let row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, any> | undefined;
      if (!row) {
        const id = uuidv4();
        db.prepare('INSERT INTO users (id, email, name, avatar, auth_provider, is_verified, subscription_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(id, email, name || null, avatar || null, provider, 1, 'free');
        row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, any>;
      }
      const user = mapUser(row);
      const token = generateToken(user);
      return { token, user };
    },

    requestOtp: (_: any, { email, purpose }: any) => {
      const { otp } = createOtp(email, purpose || 'register');
      console.log(`[OTP] ${purpose || 'register'} OTP for ${email}: ${otp}`);
      return { success: true, message: 'OTP sent to email (check server logs for demo)' };
    },

    verifyOtpAndRegister: (_: any, { email, otp, password, name }: any) => {
      if (!verifyOtpUtil(email, otp, 'register')) throw new Error('Invalid or expired OTP');
      let row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, any> | undefined;
      if (!row) {
        const id = uuidv4();
        const passwordHash = hashPassword(password);
        db.prepare('INSERT INTO users (id, email, name, password_hash, auth_provider, is_verified, subscription_status) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(id, email, name || null, passwordHash, 'email', 1, 'free');
        row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, any>;
      } else {
        db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(row.id);
        row = db.prepare('SELECT * FROM users WHERE id = ?').get(row.id) as Record<string, any>;
      }
      const user = mapUser(row);
      const token = generateToken(user);
      return { token, user };
    },

    verifyOtpAndReset: (_: any, { email, otp, newPassword }: any) => {
      if (!verifyOtpUtil(email, otp, 'reset')) throw new Error('Invalid or expired OTP');
      const passwordHash = hashPassword(newPassword);
      db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email);
      return { success: true, message: 'Password reset successfully' };
    },

    updateProfile: (_: any, { name, avatar }: any, ctx: Context) => {
      const user = requireAuth(ctx);
      db.prepare('UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?').run(name, avatar, user.id);
      return mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as Record<string, any>);
    },

    createBook: (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const id = uuidv4();
      db.prepare(`INSERT INTO books (id, title, description, cover_url, epub_url, category_id, price, is_premium, author, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, input.title, input.description || null, input.coverUrl || null, input.epubUrl || null, input.categoryId || null, input.price || 0, input.isPremium ? 1 : 0, input.author || null, input.publishedAt || null);
      return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    },

    updateBook: (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      db.prepare(`UPDATE books SET title = COALESCE(?, title), description = COALESCE(?, description), cover_url = COALESCE(?, cover_url),
        epub_url = COALESCE(?, epub_url), category_id = COALESCE(?, category_id), price = COALESCE(?, price),
        is_premium = COALESCE(?, is_premium), author = COALESCE(?, author), published_at = COALESCE(?, published_at) WHERE id = ?`)
        .run(input.title, input.description, input.coverUrl, input.epubUrl, input.categoryId, input.price, input.isPremium !== undefined ? (input.isPremium ? 1 : 0) : undefined, input.author, input.publishedAt, id);
      return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    },

    deleteBook: (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      db.prepare('DELETE FROM books WHERE id = ?').run(id);
      return { success: true, message: 'Book deleted', id };
    },

    createVideo: (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const id = uuidv4();
      db.prepare(`INSERT INTO videos (id, title, description, thumbnail_url, video_url, category_id, price, is_premium, duration, related_book_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(id, input.title, input.description || null, input.thumbnailUrl || null, input.videoUrl || null, input.categoryId || null, input.price || 0, input.isPremium ? 1 : 0, input.duration || 0, input.relatedBookId || null);
      return db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    },

    updateVideo: (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      db.prepare(`UPDATE videos SET title = COALESCE(?, title), description = COALESCE(?, description), thumbnail_url = COALESCE(?, thumbnail_url),
        video_url = COALESCE(?, video_url), category_id = COALESCE(?, category_id), price = COALESCE(?, price),
        is_premium = COALESCE(?, is_premium), duration = COALESCE(?, duration), related_book_id = COALESCE(?, related_book_id) WHERE id = ?`)
        .run(input.title, input.description, input.thumbnailUrl, input.videoUrl, input.categoryId, input.price, input.isPremium !== undefined ? (input.isPremium ? 1 : 0) : undefined, input.duration, input.relatedBookId, id);
      return db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
    },

    deleteVideo: (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      db.prepare('DELETE FROM videos WHERE id = ?').run(id);
      return { success: true, message: 'Video deleted', id };
    },

    createCategory: (_: any, { input }: any, ctx: Context) => {
      requireAdmin(ctx);
      const id = uuidv4();
      db.prepare('INSERT INTO categories (id, name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, input.name, input.slug, input.description || null, input.icon || null, input.color || '#FF6B6B');
      return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    },

    updateCategory: (_: any, { id, input }: any, ctx: Context) => {
      requireAdmin(ctx);
      db.prepare('UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = COALESCE(?, description), icon = COALESCE(?, icon), color = COALESCE(?, color) WHERE id = ?')
        .run(input.name, input.slug, input.description, input.icon, input.color, id);
      return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    },

    deleteCategory: (_: any, { id }: any, ctx: Context) => {
      requireAdmin(ctx);
      const bookCount = db.prepare('SELECT COUNT(*) as c FROM books WHERE category_id = ?').get(id) as { c: number };
      const videoCount = db.prepare('SELECT COUNT(*) as c FROM videos WHERE category_id = ?').get(id) as { c: number };
      if (bookCount.c > 0 || videoCount.c > 0) {
        throw new Error('Cannot delete category with existing content');
      }
      db.prepare('DELETE FROM categories WHERE id = ?').run(id);
      return { success: true, message: 'Category deleted', id };
    },

    saveReadingProgress: (_: any, { input }: any, ctx: Context) => {
      const user = requireAuth(ctx);
      const id = uuidv4();
      db.prepare(`INSERT INTO reading_progress (id, user_id, book_id, chapter_index, scroll_position, percent_complete)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, book_id) DO UPDATE SET
        chapter_index = excluded.chapter_index,
        scroll_position = excluded.scroll_position,
        percent_complete = excluded.percent_complete,
        updated_at = datetime('now')`)
        .run(id, user.id, input.bookId, input.chapterIndex || 0, input.scrollPosition || 0, input.percentComplete || 0);
      return db.prepare('SELECT * FROM reading_progress WHERE user_id = ? AND book_id = ?').get(user.id, input.bookId);
    },

    saveWatchProgress: (_: any, { input }: any, ctx: Context) => {
      const user = requireAuth(ctx);
      const id = uuidv4();
      db.prepare(`INSERT INTO watch_progress (id, user_id, video_id, current_time, percent_complete)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, video_id) DO UPDATE SET
        current_time = excluded.current_time,
        percent_complete = excluded.percent_complete,
        updated_at = datetime('now')`)
        .run(id, user.id, input.videoId, input.currentTime || 0, input.percentComplete || 0);
      return db.prepare('SELECT * FROM watch_progress WHERE user_id = ? AND video_id = ?').get(user.id, input.videoId);
    },

    createSubscription: (_: any, { plan, amount, paystackReference }: any, ctx: Context) => {
      const user = requireAuth(ctx);
      const id = uuidv4();
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      db.prepare('INSERT INTO subscriptions (id, user_id, plan, status, amount, paystack_reference, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id, user.id, plan, 'active', amount, paystackReference, startDate, endDate);
      db.prepare("UPDATE users SET subscription_status = 'premium' WHERE id = ?").run(user.id);
      return db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(id);
    },

    createPayment: (_: any, { amount, paystackReference, subscriptionId }: any, ctx: Context) => {
      const user = requireAuth(ctx);
      const id = uuidv4();
      db.prepare('INSERT INTO payments (id, user_id, subscription_id, amount, status, paystack_reference) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, user.id, subscriptionId || null, amount, 'success', paystackReference);
      return db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    },
  },
};
