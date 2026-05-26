import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-4"
        >
          <ShieldAlert size={36} className="text-amber-500" />
        </motion.div>
        <h2 className="text-xl font-black text-slate-700 mb-2">Access Denied</h2>
        <p className="text-sm text-slate-400 mb-6">You need admin privileges to view this page.</p>
        <motion.a
          href="/"
          whileTap={{ scale: 0.95 }}
          className="bg-rose-500 text-white px-6 py-3 rounded-2xl font-bold shadow-md"
        >
          Go Home
        </motion.a>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
