/**
 * In-memory mock Apollo link — runs entirely in the browser with no backend.
 * All queries and mutations are resolved against a local mock store.
 */
import { ApolloLink, Observable } from '@apollo/client/core';
import { DEMO_ACCOUNTS } from './seedAccounts';

// ─── Mock store ────────────────────────────────────────────────────────────────

const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Adventure', color: '#EF4444', icon: '🗺️', createdAt: '2024-01-01' },
  { id: 'cat-2', name: 'Fantasy',   color: '#8B5CF6', icon: '🦄', createdAt: '2024-01-01' },
  { id: 'cat-3', name: 'Animals',   color: '#10B981', icon: '🐾', createdAt: '2024-01-01' },
  { id: 'cat-4', name: 'Science',   color: '#3B82F6', icon: '🔭', createdAt: '2024-01-01' },
  { id: 'cat-5', name: 'Fairy Tale',color: '#F59E0B', icon: '⭐', createdAt: '2024-01-01' },
];

const MOCK_BOOKS = [
  { id: 'book-1', title: 'The Dragon\'s Quest', author: 'Emily Stone', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80', isPremium: false, categoryId: 'cat-1', description: 'A brave dragon sets off on an epic adventure.', epubUrl: '', createdAt: '2024-01-10' },
  { id: 'book-2', title: 'Magic Forest Tales', author: 'Leo Park', coverUrl: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&q=80', isPremium: false, categoryId: 'cat-2', description: 'Explore enchanted forests filled with wonder.', epubUrl: '', createdAt: '2024-01-15' },
  { id: 'book-3', title: 'Under the Ocean', author: 'Mia Chen', coverUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&q=80', isPremium: true, categoryId: 'cat-3', description: 'Dive deep into an underwater world.', epubUrl: '', createdAt: '2024-02-01' },
  { id: 'book-4', title: 'Star Explorer', author: 'Sam Rivers', coverUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&q=80', isPremium: true, categoryId: 'cat-4', description: 'Journey through the cosmos.', epubUrl: '', createdAt: '2024-02-10' },
  { id: 'book-5', title: 'Little Red & The Wolf', author: 'Ada Grimm', coverUrl: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=300&q=80', isPremium: false, categoryId: 'cat-5', description: 'A modern twist on a classic tale.', epubUrl: '', createdAt: '2024-03-01' },
  { id: 'book-6', title: 'Robot Friends', author: 'Tom Wells', coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=80', isPremium: false, categoryId: 'cat-4', description: 'When robots learn to feel emotions.', epubUrl: '', createdAt: '2024-03-15' },
];

const MOCK_VIDEOS = [
  { id: 'vid-1', title: 'The Brave Little Turtle', thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isPremium: false, duration: 185, categoryId: 'cat-3', description: 'A turtle conquers its fears.', createdAt: '2024-01-20' },
  { id: 'vid-2', title: 'Space Adventure Kids', thumbnailUrl: 'https://images.unsplash.com/photo-1446776858070-70c3d5ed6758?w=400&q=80', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isPremium: true, duration: 310, categoryId: 'cat-4', description: 'Kids blast off to explore the stars.', createdAt: '2024-02-05' },
  { id: 'vid-3', title: 'Princess of the Forest', thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isPremium: false, duration: 240, categoryId: 'cat-5', description: 'A princess befriends the forest animals.', createdAt: '2024-03-10' },
  { id: 'vid-4', title: 'Dinosaur Discovery', thumbnailUrl: 'https://images.unsplash.com/photo-1509215736183-9af3f5cd99da?w=400&q=80', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', isPremium: true, duration: 425, categoryId: 'cat-1', description: 'Travel back to when dinosaurs roamed the earth.', createdAt: '2024-04-01' },
];

const mockUsers: any[] = DEMO_ACCOUNTS.map((a, i) => ({
  id: `user-${i + 1}`,
  email: a.email,
  name: a.label,
  avatar: null,
  role: a.role,
  authProvider: 'email',
  subscriptionStatus: a.subscriptionStatus,
  createdAt: '2024-01-01',
}));

const MOCK_SUBSCRIPTIONS = [
  { id: 'sub-1', userId: 'user-2', plan: 'monthly', status: 'active', amount: 999, paystackReference: 'PSK_DEMO_001', startDate: '2024-01-01', endDate: '2025-01-01', createdAt: '2024-01-01' },
  { id: 'sub-2', userId: 'user-3', plan: 'yearly', status: 'active', amount: 9999, paystackReference: 'PSK_DEMO_002', startDate: '2024-01-01', endDate: '2025-01-01', createdAt: '2024-01-01' },
];

const MOCK_PAYMENTS = [
  { id: 'pay-1', userId: 'user-2', subscriptionId: 'sub-1', amount: 999, status: 'success', paystackReference: 'PSK_DEMO_001', createdAt: '2024-01-01' },
  { id: 'pay-2', userId: 'user-3', subscriptionId: 'sub-2', amount: 9999, status: 'success', paystackReference: 'PSK_DEMO_002', createdAt: '2024-01-01' },
];

const mockProgressMap: Record<string, number> = {};
const mockWatchProgressMap: Record<string, number> = {};

// ─── Token helpers ─────────────────────────────────────────────────────────────

const MOCK_TOKEN_PREFIX = 'MOCK_TOKEN::';
export function encodeMockToken(userId: string): string {
  return MOCK_TOKEN_PREFIX + userId;
}
function decodeMockToken(token: string): string | null {
  if (token?.startsWith(MOCK_TOKEN_PREFIX)) return token.slice(MOCK_TOKEN_PREFIX.length);
  return null;
}
function getCurrentUser(): any | null {
  const token = localStorage.getItem('kenkan_token');
  if (!token) return null;
  const uid = decodeMockToken(token);
  return uid ? mockUsers.find((u) => u.id === uid) ?? null : null;
}

// ─── Mock resolvers ────────────────────────────────────────────────────────────

function resolve(operationName: string, variables: any): any {
  switch (operationName) {

    // ── Auth ──────────────────────────────────────────────────────────────────

    case 'Login': {
      const acct = DEMO_ACCOUNTS.find((a) => a.email === variables.email && a.password === variables.password);
      if (!acct) throw new Error('Invalid email or password. Try a demo account below.');
      const user = mockUsers.find((u) => u.email === acct.email)!;
      return { login: { token: encodeMockToken(user.id), user } };
    }

    case 'SocialLogin': {
      let user = mockUsers.find((u) => u.email === variables.email);
      if (!user) {
        user = { id: `user-social-${Date.now()}`, email: variables.email, name: variables.name || 'Social User', avatar: null, role: 'user', authProvider: variables.provider, subscriptionStatus: 'free', createdAt: new Date().toISOString() };
        mockUsers.push(user);
      }
      return { socialLogin: { token: encodeMockToken(user.id), user } };
    }

    case 'Register': {
      const exists = mockUsers.find((u) => u.email === variables.email);
      if (exists) throw new Error('Email already registered. Use a demo account or a different email.');
      const user = { id: `user-${Date.now()}`, email: variables.email, name: variables.name || variables.email.split('@')[0], avatar: null, role: 'user', authProvider: 'email', subscriptionStatus: 'free', createdAt: new Date().toISOString() };
      mockUsers.push(user);
      return { register: { success: true, message: 'Account created! Check your email for OTP.' } };
    }

    case 'VerifyOtp': {
      const user = mockUsers.find((u) => u.email === variables.email);
      if (!user) throw new Error('User not found');
      return { verifyOtp: { token: encodeMockToken(user.id), user } };
    }

    case 'ResendOtp':
      return { resendOtp: { success: true, message: 'OTP resent (mock — check console).' } };

    case 'RequestPasswordReset':
      return { requestPasswordReset: { success: true, message: 'Password reset email sent (mock).' } };

    case 'ResetPassword':
      return { resetPassword: { success: true } };

    // ── User ─────────────────────────────────────────────────────────────────

    case 'Me': {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return { me: user };
    }

    case 'UpdateProfile': {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      if (variables.name) user.name = variables.name;
      if (variables.avatar) user.avatar = variables.avatar;
      return { updateProfile: { ...user } };
    }

    // ── Content ───────────────────────────────────────────────────────────────

    case 'HomeData':
    case 'BrowseData': {
      const user = getCurrentUser();
      const uid = user?.id;
      return {
        books: MOCK_BOOKS,
        videos: MOCK_VIDEOS,
        categories: MOCK_CATEGORIES,
        myReadingProgress: uid
          ? Object.entries(mockProgressMap)
              .filter(([k]) => k.startsWith(uid + '::'))
              .map(([k, v]) => ({ bookId: k.split('::')[1], percentComplete: v }))
          : [],
        myWatchProgress: uid
          ? Object.entries(mockWatchProgressMap)
              .filter(([k]) => k.startsWith(uid + '::'))
              .map(([k, v]) => ({ videoId: k.split('::')[1], percentComplete: v }))
          : [],
      };
    }

    case 'SearchContent': {
      const q = (variables.query || '').toLowerCase();
      return {
        books: MOCK_BOOKS.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)),
        videos: MOCK_VIDEOS.filter((v) => v.title.toLowerCase().includes(q)),
      };
    }

    case 'GetBook': {
      const book = MOCK_BOOKS.find((b) => b.id === variables.id);
      if (!book) throw new Error('Book not found');
      const user = getCurrentUser();
      const uid = user?.id || '';
      return {
        book,
        myReadingProgress: uid ? { bookId: book.id, percentComplete: mockProgressMap[`${uid}::${book.id}`] ?? 0, lastPosition: null } : null,
      };
    }

    case 'GetVideo': {
      const video = MOCK_VIDEOS.find((v) => v.id === variables.id);
      if (!video) throw new Error('Video not found');
      const user = getCurrentUser();
      const uid = user?.id || '';
      return {
        video,
        myWatchProgress: uid ? { videoId: video.id, percentComplete: mockWatchProgressMap[`${uid}::${video.id}`] ?? 0 } : null,
      };
    }

    case 'SaveReadingProgress': {
      const user = getCurrentUser();
      if (user) mockProgressMap[`${user.id}::${variables.bookId}`] = variables.percentComplete ?? 0;
      return { saveReadingProgress: { bookId: variables.bookId, percentComplete: variables.percentComplete ?? 0 } };
    }

    case 'SaveWatchProgress': {
      const user = getCurrentUser();
      if (user) mockWatchProgressMap[`${user.id}::${variables.videoId}`] = variables.percentComplete ?? 0;
      return { saveWatchProgress: { videoId: variables.videoId, percentComplete: variables.percentComplete ?? 0 } };
    }

    // ── Subscriptions ─────────────────────────────────────────────────────────

    case 'InitializeSubscription':
      return { initializeSubscription: { authorizationUrl: '#demo-payment', reference: 'MOCK_REF_' + Date.now() } };

    case 'VerifyPayment': {
      const user = getCurrentUser();
      if (user) user.subscriptionStatus = 'premium';
      return { verifyPayment: { success: true, subscription: { id: 'sub-new', plan: variables.plan || 'monthly', status: 'active', amount: 999 } } };
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    case 'Analytics':
      return {
        analytics: {
          summary: { totalUsers: mockUsers.length, totalRevenue: 18998, activeSubscriptions: 2, totalBooks: MOCK_BOOKS.length, totalVideos: MOCK_VIDEOS.length },
          subscriptionDistribution: [{ label: 'Free', value: 1 }, { label: 'Monthly', value: 1 }, { label: 'Yearly', value: 1 }],
          categoryDistribution: MOCK_CATEGORIES.map((c) => ({ label: c.name, value: Math.floor(Math.random() * 40) + 10 })),
          monthlyRevenue: ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({ label: m, value: 2000 + i * 800 })),
          monthlyUsers: ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({ label: m, value: 5 + i * 3 })),
          userGrowth: ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({ label: m, value: 5 + i * 3 })),
          revenueGrowth: ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({ label: m, value: 2000 + i * 800 })),
        },
      };

    case 'Users':
      return { users: mockUsers };

    case 'Subscriptions':
      return { subscriptions: MOCK_SUBSCRIPTIONS };

    case 'Payments':
      return { payments: MOCK_PAYMENTS };

    case 'Categories':
      return { categories: MOCK_CATEGORIES };

    case 'CreateCategory': {
      const cat = { id: `cat-${Date.now()}`, name: variables.name, color: variables.color || '#6366F1', icon: variables.icon || '📚', createdAt: new Date().toISOString() };
      MOCK_CATEGORIES.push(cat);
      return { createCategory: cat };
    }

    case 'DeleteCategory': {
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === variables.id);
      if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1);
      return { deleteCategory: { success: true } };
    }

    case 'UploadBook': {
      const book = { id: `book-${Date.now()}`, title: variables.title, author: variables.author || 'Unknown', coverUrl: variables.coverUrl || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80', isPremium: variables.isPremium ?? false, categoryId: variables.categoryId || 'cat-1', description: variables.description || '', epubUrl: variables.epubUrl || '', createdAt: new Date().toISOString() };
      MOCK_BOOKS.push(book);
      return { uploadBook: book };
    }

    case 'DeleteBook': {
      const idx = MOCK_BOOKS.findIndex((b) => b.id === variables.id);
      if (idx !== -1) MOCK_BOOKS.splice(idx, 1);
      return { deleteBook: { success: true } };
    }

    case 'UploadVideo': {
      const video = { id: `vid-${Date.now()}`, title: variables.title, thumbnailUrl: variables.thumbnailUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', videoUrl: variables.videoUrl || '', isPremium: variables.isPremium ?? false, duration: variables.duration || 0, categoryId: variables.categoryId || 'cat-1', description: variables.description || '', createdAt: new Date().toISOString() };
      MOCK_VIDEOS.push(video);
      return { uploadVideo: video };
    }

    case 'DeleteVideo': {
      const idx = MOCK_VIDEOS.findIndex((v) => v.id === variables.id);
      if (idx !== -1) MOCK_VIDEOS.splice(idx, 1);
      return { deleteVideo: { success: true } };
    }

    case 'UpdateUserRole': {
      const user = mockUsers.find((u) => u.id === variables.userId);
      if (user) user.role = variables.role;
      return { updateUserRole: user };
    }

    default:
      console.warn('[MockLink] Unhandled operation:', operationName);
      return {};
  }
}

// ─── Apollo Link ───────────────────────────────────────────────────────────────

export const mockLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const { operationName, variables } = operation;
    // Simulate slight async delay for realism
    setTimeout(() => {
      try {
        const data = resolve(operationName ?? '', variables ?? {});
        observer.next({ data });
        observer.complete();
      } catch (err: any) {
        observer.next({ data: null, errors: [{ message: err.message }] });
        observer.complete();
      }
    }, 150);
  });
});
