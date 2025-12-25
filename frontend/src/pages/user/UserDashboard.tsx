import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, PlusCircle, TrendingUp } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Stats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
}

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/user/stats');
            setStats(data);
        } catch (error) {
            toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'মোট ইস্যু', engLabel: 'Total Issues', value: stats.total, icon: FileText, color: 'from-blue-500 to-blue-600' },
        { label: 'পেন্ডিং', engLabel: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-orange-600' },
        { label: 'প্রসেসিং', engLabel: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
        { label: 'সমাধান', engLabel: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    ];

    return (
        <div className="w-full">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    স্বাগতম, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                    Roll: {user?.roll} | Department: {user?.department}
                </p>
            </motion.div>

            {/* Quick Action */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <Link
                    to="/user/submit"
                    className="inline-flex items-center space-x-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                    <PlusCircle className="w-6 h-6" />
                    <span>নতুন ইস্যু সাবমিট করুন</span>
                </Link>
            </motion.div>

            {/* Stats Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 2) }}
                                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} text-white`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-700">{card.label}</h3>
                                <p className="text-sm text-gray-500">{card.engLabel}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Information Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* How to Submit */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📝 কিভাবে ইস্যু সাবমিট করবেন?</h2>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start space-x-2">
                            <span className="text-sky-600 font-bold">1.</span>
                            <span>"নতুন ইস্যু সাবমিট করুন" বাটনে ক্লিক করুন</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-sky-600 font-bold">2.</span>
                            <span>ইস্যুর বিস্তারিত তথ্য দিন (শিরোনাম, বর্ণনা, ক্যাটেগরি)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-sky-600 font-bold">3.</span>
                            <span>প্রয়োজনে ছবি আপলোড করুন</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="text-sky-600 font-bold">4.</span>
                            <span>সাবমিট করুন এবং অপেক্ষা করুন</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">🔗 দ্রুত লিংক</h2>
                    <div className="space-y-3">
                        <Link
                            to="/user/my-issues"
                            className="block p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                        >
                            <p className="font-semibold text-sky-700">আমার ইস্যু দেখুন</p>
                            <p className="text-sm text-gray-600">আপনার সাবমিট করা সব ইস্যু</p>
                        </Link>
                        <Link
                            to="/user/profile"
                            className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <p className="font-semibold text-blue-700">প্রোফাইল দেখুন</p>
                            <p className="text-sm text-gray-600">আপনার প্রোফাইল তথ্য</p>
                        </Link>
                        <Link
                            to="/"
                            className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            <p className="font-semibold text-purple-700">হোম পেজ</p>
                            <p className="text-sm text-gray-600">মূল পেজে ফিরে যান</p>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserDashboard;
