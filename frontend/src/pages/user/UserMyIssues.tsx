import { useState, ElementType } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, TrendingUp, CheckCircle, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
    const [filter, setFilter] = useState('all');

    const { data: issues = [], isLoading: loading, isError } = useQuery<Issue[]>({
        queryKey: ['user-issues'],
        queryFn: async () => {
            const { data } = await api.get<Issue[]>('/user/issues');
            return data;
        },
        staleTime: 30000,           // Fresh for 30s — instant on re-mount
        gcTime: 600000,             // Keep in cache 10 min
        refetchInterval: 5000,      // Real-time sync every 5s
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? [],  // Show previous data — NEVER skeleton
    });

    if (isError) {
        toast.error('ইস্যু লোড করতে সমস্যা হয়েছে');
    }

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
        <div className="max-w-7xl mx-auto py-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-4xl font-bold text-slate-800 mb-2">আমার ইস্যু</h1>
                <p className="text-slate-600">আপনার সাবমিট করা সমস্যাগুলো</p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-wrap justify-center gap-3"
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
                        className={`px-6 py-2 rounded-full font-medium transition-all border ${filter === tab.value
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        {tab.label} ({tab.engLabel})
                    </button>
                ))}
            </motion.div>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm"
                >
                    <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">কোন ইস্যু নেই</h3>
                    <p className="text-slate-600 mb-6">এই ফিল্টারে কোন ইস্যু পাওয়া যায়নি</p>
                    <Link
                        to="/user/submit"
                        className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
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
                            className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md hover:border-primary/20 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{issue.title}</h3>
                                    <p className="text-slate-600 line-clamp-2">{issue.description}</p>
                                </div>
                                {issue.imageUrl && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                                        <img
                                            src={issue.imageUrl}
                                            alt={issue.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                {getStatusBadge(issue.status)}
                                <span className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                                    প্রাধান্য: {issue.priority}
                                </span>
                                <span className="text-sm text-slate-500">
                                    {new Date(issue.createdAt).toLocaleDateString('bn-BD')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><TrendingUp size={14} className="text-primary" /> {issue.votes} ভোট</span>
                                    <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-200 text-slate-600 font-medium">{issue.category}</span>
                                </div>
                                <Link
                                    to={`/issues/${issue._id}`}
                                    className="flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors"
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
