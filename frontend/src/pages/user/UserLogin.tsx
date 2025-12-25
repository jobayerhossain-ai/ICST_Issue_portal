import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const UserLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('লগইন সফল! (Login successful!)');
            navigate('/user/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'লগইন ব্যর্থ (Login failed)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="inline-block p-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full mb-4"
                    >
                        <LogIn className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2"
                    >
                        ইউজার লগইন
                    </motion.h1>
                    <p className="text-gray-600">User Login Portal</p>
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-sky-100"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ইমেইল <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="example@email.com"
                                    className="w-full pl-11 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                পাসওয়ার্ড <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="আপনার পাসওয়ার্ড"
                                    className="w-full pl-11 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            নতুন ইউজার?{' '}
                            <Link to="/user/register" className="text-sky-600 hover:text-sky-700 font-semibold">
                                রেজিস্টার করুন
                            </Link>
                        </p>
                    </div>

                    {/* Admin Login Link */}
                    <div className="mt-4 text-center pt-4 border-t border-gray-200">
                        <Link to="/admin/login" className="text-sm text-gray-500 hover:text-gray-700">
                            এডমিন লগইন →
                        </Link>
                    </div>

                    {/* Home Link */}
                    <div className="mt-4 text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                            ← হোম পেজে ফিরে যান
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default UserLogin;
