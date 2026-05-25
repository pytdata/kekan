import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import BottomNav from '@/components/BottomNav';
import { routes } from './routes';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register', '/otp', '/reset-password'].includes(location.pathname);
  const isContentPage = location.pathname.startsWith('/book/') || location.pathname.startsWith('/video/');
  const showNav = !isAdmin && !isAuthPage && !isContentPage;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-grow pb-20 max-w-md mx-auto w-full">
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
      <Toaster position="top-center" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
