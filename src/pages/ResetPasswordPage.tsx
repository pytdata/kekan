import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
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

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestOtp] = useMutation(REQUEST_OTP);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOtp({ variables: { email, purpose: 'reset' } });
      toast.success('OTP sent! Check server logs.');
      navigate('/otp', { state: { email, password: '', mode: 'reset' } });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 px-6 py-8 flex flex-col">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/login')} className="self-start mb-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <ArrowLeft size={20} className="text-slate-600" />
      </motion.button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <KeyRound size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Reset Password</h1>
        <p className="text-sm text-slate-500 mt-1 text-center">Enter your email to receive a reset code</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
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

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Code'}
        </motion.button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
