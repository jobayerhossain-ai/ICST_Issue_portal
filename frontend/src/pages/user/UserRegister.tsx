import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, BookOpen, Hash } from 'lucide-react';
import { toast } from 'sonner';

const UserRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        roll: '',
        name: '',
        department: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('পাসওয়ার্ড মিলছে না (Passwords do not match)');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)');
            return;
        }

        setLoading(true);
        try {
            await register(formData.roll, formData.name, formData.department, formData.email, formData.password);
            toast.success('রেজিস্ট্রেশন সফল! (Registration successful!)');
            navigate('/user/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ (Registration failed)');
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
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2"
                    >
                        নতুন একাউন্ট
                    </motion.h1>
                    <p className="text-gray-600">User Registration</p>
                </div>

                {/* Registration Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-sky-100"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Roll Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                রোল নম্বর <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                                <input
                                    type="text"
                                    name="roll"
                                    value={formData.roll}
                                    onChange={handleChange}
                                    required
                                    placeholder="2021-1-60-001"
                                    className="w-full pl-11 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                পূর্ণ নাম <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="আপনার পূর্ণ নাম"
                                    className="w-full pl-11 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                বিভাগ <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    required
                                    placeholder="CSE, EEE, BBA etc."
                                    className="w-full pl-11 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

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
                                    placeholder="কমপক্ষে ৬ অক্ষর"
                                    className="w-full pl-11 pr-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="পাসওয়ার্ড আবার লিখুন"
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
                            {loading ? 'রেজিস্টার হচ্ছে...' : 'রেজিস্টার করুন'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            ইতিমধ্যে একাউন্ট আছে?{' '}
                            <Link to="/user/login" className="text-sky-600 hover:text-sky-700 font-semibold">
                                লগইন করুন
                            </Link>
                        </p>
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

export default UserRegister;
