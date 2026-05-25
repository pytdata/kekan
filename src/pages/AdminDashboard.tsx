import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { motion } from 'motion/react';
import {
  LayoutDashboard, BookOpen, Play, FolderTree, Users, CreditCard, BarChart3,
  Upload, X, ChevronLeft, Trash2, Edit2, Save, Search, Crown, LogOut,
  PieChart, TrendingUp, DollarSign, BookOpenCheck, Clapperboard
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';

const ANALYTICS_QUERY = gql`
  query Analytics {
    analytics {
      summary {
        totalUsers
        totalRevenue
        activeSubscriptions
        totalBooks
        totalVideos
      }
      subscriptionDistribution { label value }
      categoryDistribution { label value }
      monthlyRevenue { label value }
      monthlyUsers { label value }
      userGrowth { label value }
      revenueGrowth { label value }
    }
  }
`;

const USERS_QUERY = gql`
  query Users {
    users { id email name avatar authProvider role subscriptionStatus createdAt }
  }
`;

const SUBSCRIPTIONS_QUERY = gql`
  query Subscriptions {
    subscriptions { id userId plan status amount paystackReference startDate endDate createdAt }
  }
`;

const PAYMENTS_QUERY = gql`
  query Payments {
    payments { id userId subscriptionId amount status paystackReference createdAt }
  }
`;

const CATEGORIES_QUERY = gql`
  query Categories {
    categories { id name slug description icon color }
  }
`;

const BOOKS_QUERY = gql`
  query Books {
    books { id title description coverUrl epubUrl categoryId price isPremium author createdAt }
  }
`;

const VIDEOS_QUERY = gql`
  query Videos {
    videos { id title description thumbnailUrl videoUrl categoryId price isPremium duration relatedBookId createdAt }
  }
`;

const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) { id title }
  }
`;

const CREATE_VIDEO = gql`
  mutation CreateVideo($input: VideoInput!) {
    createVideo(input: $input) { id title }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) { id name }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id) { success message }
  }
`;

const DELETE_VIDEO = gql`
  mutation DeleteVideo($id: ID!) {
    deleteVideo(id: $id) { success message }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id) { success message }
  }
`;

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`} style={{ backgroundColor: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-2xl font-black text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
    </motion.div>
  );
}

function AdminSidebar({ active }: { active: string }) {
  const navigate = useNavigate();
  const links = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'books', label: 'Books', icon: BookOpen },
    { key: 'videos', label: 'Videos', icon: Play },
    { key: 'categories', label: 'Categories', icon: FolderTree },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { key: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center">
          <BookOpen size={18} className="text-white" />
        </div>
        <span className="font-black text-slate-800 text-lg">Kenkan Admin</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.key}
            to={`/admin/${link.key}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
              active === link.key ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-xl text-sm font-bold text-slate-600"
        >
          <ChevronLeft size={16} /> Back to App
        </motion.button>
      </div>
    </div>
  );
}

function DashboardView() {
  const { data, loading } = useQuery(ANALYTICS_QUERY);
  const analytics = data?.analytics;

  if (loading) return <div className="p-8 text-slate-400">Loading analytics...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-black text-slate-800">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={analytics?.summary?.totalUsers || 0} color="#6366F1" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${(analytics?.summary?.totalRevenue || 0).toFixed(2)}`} color="#10B981" />
        <StatCard icon={Crown} label="Active Subs" value={analytics?.summary?.activeSubscriptions || 0} color="#F59E0B" />
        <StatCard icon={BookOpenCheck} label="Books" value={analytics?.summary?.totalBooks || 0} color="#EF4444" />
        <StatCard icon={Clapperboard} label="Videos" value={analytics?.summary?.totalVideos || 0} color="#8B5CF6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Subscription Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie data={analytics?.subscriptionDistribution || []} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                {(analytics?.subscriptionDistribution || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie data={analytics?.categoryDistribution || []} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={80}>
                {(analytics?.categoryDistribution || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.monthlyRevenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BooksView() {
  const { data, refetch } = useQuery(BOOKS_QUERY);
  const { data: catData } = useQuery(CATEGORIES_QUERY);
  const [createBook] = useMutation(CREATE_BOOK);
  const [deleteBook] = useMutation(DELETE_BOOK);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', price: 0, isPremium: false, author: '' });
  const [fileUrl, setFileUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`http://localhost:4000/upload/${type}`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        if (type === 'epub') setFileUrl(json.url);
        else setCoverUrl(json.url);
        toast.success('Upload successful');
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await createBook({ variables: { input: { ...form, coverUrl, epubUrl: fileUrl } } });
      toast.success('Book created');
      setShowModal(false);
      setForm({ title: '', description: '', categoryId: '', price: 0, isPremium: false, author: '' });
      setFileUrl('');
      setCoverUrl('');
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    try {
      await deleteBook({ variables: { id } });
      toast.success('Deleted');
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-800">Books</h1>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)} className="bg-rose-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
          <Upload size={16} /> Upload Book
        </motion.button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Author</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Price</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Premium</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.books || []).map((book: any) => (
              <tr key={book.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">{book.title}</td>
                <td className="px-4 py-3 text-slate-500">{book.author || '-'}</td>
                <td className="px-4 py-3 text-slate-500">{book.categoryId || '-'}</td>
                <td className="px-4 py-3 text-slate-500">${book.price}</td>
                <td className="px-4 py-3">{book.isPremium ? <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">Yes</span> : <span className="text-slate-400 text-xs">No</span>}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(book.id)} className="text-rose-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800">Upload Book</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 h-20 resize-none" />
              <input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="">Select Category</option>
                {(catData?.categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="rounded" />
                Premium content
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} className="text-sm" />
                {coverUrl && <p className="text-xs text-emerald-500 mt-1">Uploaded!</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">EPUB File</label>
                <input type="file" accept=".epub" onChange={(e) => handleFileUpload(e, 'epub')} className="text-sm" />
                {fileUrl && <p className="text-xs text-emerald-500 mt-1">Uploaded!</p>}
                {uploading && <p className="text-xs text-slate-400">Uploading...</p>}
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold shadow-md">
                Create Book
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function VideosView() {
  const { data, refetch } = useQuery(VIDEOS_QUERY);
  const { data: catData } = useQuery(CATEGORIES_QUERY);
  const [createVideo] = useMutation(CREATE_VIDEO);
  const [deleteVideo] = useMutation(DELETE_VIDEO);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', price: 0, isPremium: false, duration: 0, relatedBookId: '' });
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbUrl, setThumbUrl] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`http://localhost:4000/upload/${type}`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        if (type === 'video') setVideoUrl(json.url);
        else setThumbUrl(json.url);
        toast.success('Upload successful');
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await createVideo({ variables: { input: { ...form, videoUrl, thumbnailUrl: thumbUrl } } });
      toast.success('Video created');
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      await deleteVideo({ variables: { id } });
      toast.success('Deleted');
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-800">Videos</h1>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)} className="bg-rose-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
          <Upload size={16} /> Upload Video
        </motion.button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Duration</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Price</th>
              <th className="text-left px-4 py-3 font-bold text-slate-600">Premium</th>
              <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.videos || []).map((video: any) => (
              <tr key={video.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">{video.title}</td>
                <td className="px-4 py-3 text-slate-500">{video.duration}s</td>
                <td className="px-4 py-3 text-slate-500">{video.categoryId || '-'}</td>
                <td className="px-4 py-3 text-slate-500">${video.price}</td>
                <td className="px-4 py-3">{video.isPremium ? <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">Yes</span> : <span className="text-slate-400 text-xs">No</span>}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(video.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800">Upload Video</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 h-20 resize-none" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white">
                <option value="">Select Category</option>
                {(catData?.categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="number" placeholder="Duration (seconds)" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm({ ...form, isPremium: e.target.checked })} className="rounded" />
                Premium content
              </label>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Thumbnail</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} className="text-sm" />
                {thumbUrl && <p className="text-xs text-emerald-500 mt-1">Uploaded!</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Video File (MP4/WEBM/WEBP)</label>
                <input type="file" accept=".mp4,.webm,.webp" onChange={(e) => handleFileUpload(e, 'video')} className="text-sm" />
                {videoUrl && <p className="text-xs text-emerald-500 mt-1">Uploaded!</p>}
                {uploading && <p className="text-xs text-slate-400">Uploading...</p>}
              </div>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold shadow-md">
                Create Video
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function CategoriesView() {
  const { data, refetch } = useQuery(CATEGORIES_QUERY);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', color: '#FF6B6B' });

  const handleSubmit = async () => {
    try {
      await createCategory({ variables: { input: form } });
      toast.success('Category created');
      setShowModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory({ variables: { id } });
      toast.success('Deleted');
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-800">Categories</h1>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)} className="bg-rose-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2">
          <FolderTree size={16} /> Add Category
        </motion.button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Name</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Slug</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Color</th>
            <th className="text-right px-4 py-3 font-bold text-slate-600">Actions</th>
          </tr></thead>
          <tbody>
            {(data?.categories || []).map((cat: any) => (
              <tr key={cat.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-slate-500">{cat.slug}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{cat.color}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(cat.id)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800">New Category</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 border border-slate-200 rounded-xl" />
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold shadow-md">Create Category</motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function UsersView() {
  const { data } = useQuery(USERS_QUERY);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-slate-800 mb-6">Users</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Name</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Email</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Provider</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Role</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
          </tr></thead>
          <tbody>
            {(data?.users || []).map((u: any) => (
              <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">{u.name || '-'}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-500 capitalize">{u.authProvider}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.subscriptionStatus === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{u.subscriptionStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubscriptionsView() {
  const { data } = useQuery(SUBSCRIPTIONS_QUERY);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-slate-800 mb-6">Subscriptions</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Plan</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Amount</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Reference</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">End Date</th>
          </tr></thead>
          <tbody>
            {(data?.subscriptions || []).map((s: any) => (
              <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">{s.plan}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span></td>
                <td className="px-4 py-3 text-slate-500">${s.amount}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.paystackReference || '-'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsView() {
  const { data } = useQuery(PAYMENTS_QUERY);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-slate-800 mb-6">Payments</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Amount</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Status</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Reference</th>
            <th className="text-left px-4 py-3 font-bold text-slate-600">Date</th>
          </tr></thead>
          <tbody>
            {(data?.payments || []).map((p: any) => (
              <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-700">${p.amount}</td>
                <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-slate-500 text-xs">{p.paystackReference || '-'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = window.location.pathname;
  const active = location.split('/').pop() || 'dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar active={active} />
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="font-black text-slate-800">Admin</span>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')} className="text-sm font-bold text-rose-500">
            Exit
          </motion.button>
        </div>
        <Routes>
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="books" element={<BooksView />} />
          <Route path="videos" element={<VideosView />} />
          <Route path="categories" element={<CategoriesView />} />
          <Route path="users" element={<UsersView />} />
          <Route path="subscriptions" element={<SubscriptionsView />} />
          <Route path="payments" element={<PaymentsView />} />
          <Route path="*" element={<DashboardView />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
