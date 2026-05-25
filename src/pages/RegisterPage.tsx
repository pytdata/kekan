import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, BookOpen } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { toast } from 'sonner';

const REQUEST_OTP = gql`
  mutation RequestOtp($email: String!, $purpose: String) {
    requestOtp(email: $email, purpose: $purpose) {
      success
      message
    }
  }
`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [requestOtp] = useMutation(REQUEST_OTP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp({ variables: { email, purpose: 'register' } });
      toast.success('OTP sent! Check server logs for demo code.');
      navigate('/otp', { state: { email, password, name, mode: 'register' } });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 px-6 py-8 flex flex-col">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')} className="self-start mb-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <ArrowLeft size={20} className="text-slate-600" />
      </motion.button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <BookOpen size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Join Kenkan!</h1>
        <p className="text-sm text-slate-500 mt-1">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create password"
            required
            minLength={6}
            className="w-full pl-11 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-amber-200 disabled:opacity-50"
        >
          {loading ? 'Sending OTP...' : 'Continue'}
        </motion.button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-rose-500 font-bold">Sign in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
