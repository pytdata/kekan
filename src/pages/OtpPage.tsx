import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VERIFY_AND_REGISTER = gql`
  mutation VerifyOtpAndRegister($email: String!, $otp: String!, $password: String!, $name: String) {
    verifyOtpAndRegister(email: $email, otp: $otp, password: $password, name: $name) {
      token
      user {
        id
        email
        name
        avatar
        role
        subscriptionStatus
      }
    }
  }
`;

const VERIFY_AND_RESET = gql`
  mutation VerifyOtpAndReset($email: String!, $otp: String!, $newPassword: String!) {
    verifyOtpAndReset(email: $email, otp: $otp, newPassword: $newPassword) {
      success
      message
    }
  }
`;

const OtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { email, password, name, mode } = (location.state as any) || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyRegister] = useMutation(VERIFY_AND_REGISTER);
  const [verifyReset] = useMutation(VERIFY_AND_RESET);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        const { data } = await verifyRegister({ variables: { email, otp: code, password, name } });
        if (data?.verifyOtpAndRegister) {
          login(data.verifyOtpAndRegister.token, data.verifyOtpAndRegister.user);
          toast.success('Account created! Welcome!');
          navigate('/');
        }
      } else if (mode === 'reset') {
        const { data } = await verifyReset({ variables: { email, otp: code, newPassword: password } });
        if (data?.verifyOtpAndReset?.success) {
          toast.success('Password reset successfully!');
          navigate('/login');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 px-6 py-8 flex flex-col">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="self-start mb-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <ArrowLeft size={20} className="text-slate-600" />
      </motion.button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Verify OTP</h1>
        <p className="text-sm text-slate-500 mt-1 text-center">Enter the 6-digit code sent to <span className="font-bold">{email}</span></p>
        <p className="text-xs text-rose-500 mt-2 font-medium">(Check server logs for demo OTP)</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            maxLength={1}
            className="w-12 h-14 text-center text-xl font-black rounded-2xl border-2 border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all bg-white"
          />
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-rose-200 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </motion.button>
    </div>
  );
};

export default OtpPage;
