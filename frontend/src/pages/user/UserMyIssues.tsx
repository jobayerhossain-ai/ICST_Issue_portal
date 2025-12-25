import { useEffect, useState, ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, TrendingUp, CheckCircle, Eye } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Issue {
    _id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    priority: string;
    votes: number;
    createdAt: string;
    imageUrl?: string;
}

const UserMyIssues = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const { data } = await api.get<Issue[]>('/user/issues');
            setIssues(data);
        } catch (error) {
            toast.error('ইস্যু লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const filteredIssues = filter === 'all'
        ? issues
        : issues.filter(issue => issue.status === filter);

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string; icon: ElementType }> = {
            'pending': { label: 'পেন্ডিং', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'in-progress': { label: 'প্রসেসিং', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
            'resolved': { label: 'সমাধান', color: 'bg-green-100 text-green-800', icon: CheckCircle }
        };

        const statusInfo = statusMap[status] || statusMap['pending'];
        const Icon = statusInfo.icon;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                <Icon className="w-4 h-4" />
                <span>{statusInfo.label}</span>
            </span>
        );
    };

    const getPriorityColor = (priority: string) => {
        const colorMap: Record<string, string> = {
            'low': 'text-green-600',
            'medium': 'text-yellow-600',
            'high': 'text-red-600'
        };
        return colorMap[priority] || 'text-gray-600';
    };

    return (
        <div className="max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">আমার ইস্যু</h1>
                <p className="text-gray-600">My Submitted Issues</p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex flex-wrap gap-3"
            >
                {[
                    { value: 'all', label: 'সব', engLabel: 'All' },
                    { value: 'pending', label: 'পেন্ডিং', engLabel: 'Pending' },
                    { value: 'in-progress', label: 'প্রসেসিং', engLabel: 'In Progress' },
                    { value: 'resolved', label: 'সমাধান', engLabel: 'Resolved' }
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === tab.value
                            ? 'bg-sky-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label} ({tab.engLabel})
                    </button>
                ))}
            </motion.div>

            {/* Issues List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
                </div>
            ) : filteredIssues.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100"
                >
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">কোন ইস্যু নেই</h3>
                    <p className="text-gray-500 mb-6">এই ফিল্টারে কোন ইস্যু পাওয়া যায়নি</p>
                    <Link
                        to="/user/submit"
                        className="inline-block bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        নতুন ইস্যু সাবমিট করুন
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {filteredIssues.map((issue, index) => (
                        <motion.div
                            key={issue._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{issue.title}</h3>
                                    <p className="text-gray-600 line-clamp-2">{issue.description}</p>
                                </div>
                                {issue.imageUrl && (
                                    <img
                                        src={issue.imageUrl}
                                        alt={issue.title}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                {getStatusBadge(issue.status)}
                                <span className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                                    প্রাধান্য: {issue.priority}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {new Date(issue.createdAt).toLocaleDateString('bn-BD')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>👍 {issue.votes} ভোট</span>
                                    <span className="px-3 py-1 bg-gray-100 rounded-full">{issue.category}</span>
                                </div>
                                <Link
                                    to={`/issues/${issue._id}`}
                                    className="flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>বিস্তারিত দেখুন</span>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserMyIssues;
