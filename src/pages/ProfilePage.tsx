import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Crown, CreditCard, LogOut, ChevronRight, Camera, Settings, Bell, MapPin, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useSound } from '@/hooks/use-sound';
import { useLocation } from '@/hooks/use-location';
import { toast } from 'sonner';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
    }
  }
`;

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const { playTap, playSuccess } = useSound();
  const { lat, lng, city, loading: locLoading, getLocation } = useLocation();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="text-xl font-bold text-slate-700 mb-4">Please log in</h1>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')} className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">
          Go to Login
        </motion.button>
      </div>
    );
  }

  const handleSaveName = async () => {
    try {
      await updateProfile({ variables: { name: editName } });
      playSuccess();
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0, 300, 300);
      const dataUrl = canvas.toDataURL('image/png');
      stream.getTracks().forEach((t) => t.stop());
      await updateProfile({ variables: { avatar: dataUrl } });
      playSuccess();
      toast.success('Avatar updated!');
    } catch {
      toast.error('Camera access denied or unavailable');
    }
  };

  const menuItems = [
    { icon: Crown, label: 'Subscription', action: () => { playTap(); navigate('/subscription'); }, color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: CreditCard, label: 'Payment History', action: () => { playTap(); navigate('/subscription'); }, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: MapPin, label: 'Location', action: () => { playTap(); getLocation(); }, color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: Volume2, label: 'Sound FX', action: () => { playTap(); playSuccess(); toast('Sound test!'); }, color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: Bell, label: 'Notifications', action: () => { playTap(); toast('Coming soon!'); }, color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Settings, label: 'Settings', action: () => { playTap(); toast('Coming soon!'); }, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-black text-slate-800 mb-6">Profile</h1>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-100 shadow-lg bg-slate-100">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-rose-50">
                <User size={36} className="text-rose-300" />
              </div>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCamera}
            className="absolute bottom-0 right-0 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md"
          >
            <Camera size={14} />
          </motion.button>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mt-3">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSaveName} className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold">
              Save
            </motion.button>
          </div>
        ) : (
          <div className="mt-3 text-center">
            <h2 className="text-lg font-extrabold text-slate-800">{user.name || 'Reader'}</h2>
            <p className="text-xs text-slate-400">{user.email}</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)} className="mt-1 text-xs text-rose-500 font-bold">
              Edit Name
            </motion.button>
          </div>
        )}

        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
          user.subscriptionStatus === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
        }`}>
          <Crown size={12} />
          {user.subscriptionStatus === 'premium' ? 'Premium Member' : 'Free Member'}
        </div>
        {city && (
          <div className="mt-1 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-blue-50 text-blue-500">
            <MapPin size={10} />
            {city}
          </div>
        )}
        {locLoading && (
          <div className="mt-1 text-xs text-slate-400">Finding location...</div>
        )}
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
              <item.icon size={18} className={item.color} />
            </div>
            <span className="flex-grow text-left text-sm font-bold text-slate-700">{item.label}</span>
            <ChevronRight size={16} className="text-slate-300" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="w-full flex items-center justify-center gap-2 mt-6 p-4 bg-rose-50 text-rose-500 rounded-2xl font-bold text-sm border border-rose-100"
      >
        <LogOut size={18} />
        Sign Out
      </motion.button>
    </div>
  );
};

export default ProfilePage;
