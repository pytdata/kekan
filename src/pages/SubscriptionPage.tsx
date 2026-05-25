import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Crown, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    features: ['Unlimited Books', 'Unlimited Videos', 'New releases', 'HD video quality'],
    color: 'from-rose-400 to-rose-500',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 79.99,
    period: 'year',
    features: ['Unlimited Books', 'Unlimited Videos', 'New releases', 'HD video quality', 'Save 33%', 'Priority support'],
    color: 'from-amber-400 to-amber-500',
    popular: true,
  },
];

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    setProcessing(true);
    try {
      // Simulate Paystack inline JS integration
      toast.loading('Processing payment...');
      setTimeout(() => {
        toast.dismiss();
        toast.success(`Subscribed to ${plan.name} plan!`);
        navigate('/profile');
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 px-6 py-8 flex flex-col">
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} className="self-start mb-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <ArrowLeft size={20} className="text-slate-600" />
      </motion.button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Crown size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Go Premium</h1>
        <p className="text-sm text-slate-500 mt-1 text-center">Unlock all stories and animations</p>
      </div>

      {user?.subscriptionStatus === 'premium' && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-amber-100 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
        >
          <Sparkles className="text-amber-500" size={24} />
          <div>
            <p className="font-bold text-amber-800">You are Premium!</p>
            <p className="text-xs text-amber-700">Enjoy unlimited access to all content.</p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4 flex-grow">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileTap={{ scale: 0.98 }}
            className={`bg-white rounded-3xl p-5 border-2 ${plan.popular ? 'border-amber-300 shadow-lg shadow-amber-100' : 'border-slate-100 shadow-sm'}`}
          >
            {plan.popular && (
              <div className="bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                MOST POPULAR
              </div>
            )}
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-black text-slate-800">${plan.price}</span>
              <span className="text-sm text-slate-400 font-medium">/{plan.period}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-3">{plan.name}</h3>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={14} className="text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubscribe(plan)}
              disabled={processing || user?.subscriptionStatus === 'premium'}
              className={`w-full py-3.5 rounded-2xl font-bold text-white shadow-md bg-gradient-to-r ${plan.color} disabled:opacity-50`}
            >
              {user?.subscriptionStatus === 'premium' ? 'Already Premium' : processing ? 'Processing...' : `Subscribe ${plan.name}`}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-6">
        Payment powered by Paystack. Cancel anytime.
      </p>
    </div>
  );
};

export default SubscriptionPage;
