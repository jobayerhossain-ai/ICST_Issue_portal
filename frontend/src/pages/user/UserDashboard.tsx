import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Clock, CheckCircle, PlusCircle, TrendingUp,
    AlertTriangle, Bell, Calendar, Activity, Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import { toast } from 'sonner';

interface Stats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    criticalCount: number;
    avgResolutionTime: number;
}

interface Activity {
    id: string;
    type: string;
    message: string;
    timestamp: string;
}

interface Announcement {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    createdAt: string;
}

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        total: 0, pending: 0, inProgress: 0, resolved: 0, criticalCount: 0, avgResolutionTime: 0
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchStats(), fetchActivities(), fetchAnnouncements()])
            .finally(() => setLoading(false));
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/user/stats');
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchActivities = async () => {
        try {
            const { data } = await api.get('/user/activities');
            setActivities(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const { data } = await api.get('/user/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
        }
    };

    const statCards = [
        {
            label: 'মোট ইস্যু',
            engLabel: 'Total Issues',
            value: stats.total,
            icon: FileText,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: 'পেন্ডিং',
            engLabel: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'from-yellow-500 to-orange-600',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        },
        {
            label: 'প্রসেসিং',
            engLabel: 'In Progress',
            value: stats.inProgress,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            label: 'সমাধান',
            engLabel: 'Resolved',
            value: stats.resolved,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
    ];

    const getAnnouncementIcon = (type: string) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    };

    const getAnnouncementColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'success': return 'bg-green-50 border-green-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="w-full">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">
                            স্বাগতম, {user?.name}! 👋
                        </h1>
                        <p className="text-gray-600">
                            Roll: <span className="font-medium">{user?.roll}</span> |
                            Department: <span className="font-medium">{user?.department}</span>
                        </p>
                    </div>
                    <Link
                        to="/user/submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <PlusCircle className="w-5 h-5" />
                        নতুন ইস্যু
                    </Link>
                </div>
            </motion.div>

            {/* Announcements Banner */}
            {announcements.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    {announcements.slice(0, 2).map((announcement) => (
                        <Card key={announcement._id} className={`mb-3 border ${getAnnouncementColor(announcement.type)}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{getAnnouncementIcon(announcement.type)}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{announcement.title}</p>
                                        <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}

            {/* Critical Alert */}
            {stats.criticalCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                <div>
                                    <p className="font-semibold text-red-900">
                                        {stats.criticalCount} টি জরুরি ইস্যু রয়েছে
                                    </p>
                                    <p className="text-sm text-red-700">অনুগ্রহ করে দ্রুত ব্যবস্থা নিন</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Stats Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {statCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 3) }}
                            >
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-lg ${card.bgColor}`}>
                                                <Icon className={`w-6 h-6 ${card.textColor}`} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-700">{card.label}</h3>
                                        <p className="text-sm text-gray-500">{card.engLabel}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Timeline */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-sky-600" />
                                সাম্প্রতিক কার্যকলাপ
                            </h3>
                            {activities.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">কোন কার্যকলাপ নেই</p>
                            ) : (
                                <div className="space-y-3">
                                    {activities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                                            <div className="w-2 h-2 rounded-full bg-sky-500 mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800">{activity.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(activity.timestamp).toLocaleString('bn-BD')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Info & Links */}
                <div className="space-y-6">
                    {/* Performance Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-sky-600" />
                                আপনার পারফরম্যান্স
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">গড় সমাধান সময়</span>
                                    <span className="text-lg font-bold text-sky-600">
                                        {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime}h` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">সমাধান হার</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">দ্রুত লিংক</h3>
                            <div className="space-y-2">
                                <Link
                                    to="/user/my-issues"
                                    className="block p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                                >
                                    <p className="font-semibold text-sky-700">আমার ইস্যু</p>
                                </Link>
                                <Link
                                    to="/user/profile"
                                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <p className="font-semibold text-blue-700">প্রোফাইল</p>
                                </Link>
                                <Link
                                    to="/user/settings"
                                    className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                >
                                    <p className="font-semibold text-purple-700">সেটিংস</p>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
