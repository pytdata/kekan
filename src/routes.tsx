import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('@/pages/HomePage'));
const BrowsePage = lazy(() => import('@/pages/BrowsePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ReaderPage = lazy(() => import('@/pages/ReaderPage'));
const VideoPlayerPage = lazy(() => import('@/pages/VideoPlayerPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const OtpPage = lazy(() => import('@/pages/OtpPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const SubscriptionPage = lazy(() => import('@/pages/SubscriptionPage'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const wrap = (Component: React.FC) => (
  <Suspense fallback={<div className="flex items-center justify-center h-screen text-lg font-bold text-slate-600">Loading...</div>}>
    <Component />
  </Suspense>
);

export const routes: RouteObject[] = [
  { path: '/', element: wrap(HomePage) },
  { path: '/browse', element: wrap(BrowsePage) },
  { path: '/search', element: wrap(SearchPage) },
  { path: '/profile', element: wrap(ProfilePage) },
  { path: '/book/:id', element: wrap(ReaderPage) },
  { path: '/video/:id', element: wrap(VideoPlayerPage) },
  { path: '/login', element: wrap(LoginPage) },
  { path: '/register', element: wrap(RegisterPage) },
  { path: '/otp', element: wrap(OtpPage) },
  { path: '/reset-password', element: wrap(ResetPasswordPage) },
  { path: '/subscription', element: wrap(SubscriptionPage) },
  { path: '/admin/*', element: wrap(AdminDashboard) },
  { path: '*', element: wrap(NotFound) },
];
