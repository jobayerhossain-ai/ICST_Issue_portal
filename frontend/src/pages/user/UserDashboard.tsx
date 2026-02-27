import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
    FileText, Clock, CheckCircle, PlusCircle, TrendingUp,
    AlertTriangle, Activity, Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface Stats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    criticalCount: number;
    avgResolutionTime: number;
}

interface ActivityItem {
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

const defaultStats: Stats = {
    total: 0, pending: 0, inProgress: 0, resolved: 0, criticalCount: 0, avgResolutionTime: 0
};

const UserDashboard = () => {
    const { user } = useAuth();

    // ★ INSTANT STATS — cached 30s, background refresh every 5s, never shows loading skeleton on re-visit
    const { data: stats = defaultStats } = useQuery<Stats>({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const { data } = await api.get('/user/stats');
            return data;
        },
        staleTime: 0,              // Never stale — always fetch fresh
        gcTime: 600000,            // Keep in cache 10 min
        refetchInterval: 3000,     // Tight 3s poll for real-time feel
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? defaultStats, // Show previous/default — NEVER skeleton
    });

    // ★ INSTANT ACTIVITIES — cached 30s, background refresh every 10s
    const { data: activities = [] } = useQuery<ActivityItem[]>({
        queryKey: ['user-activities'],
        queryFn: async () => {
            const { data } = await api.get('/user/activities');
            return data;
        },
        staleTime: 0,
        gcTime: 600000,
        refetchInterval: 3000,
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? [],
    });

    // ★ INSTANT ANNOUNCEMENTS — cached 60s, background refresh every 30s
    const { data: announcements = [] } = useQuery<Announcement[]>({
        queryKey: ['user-announcements'],
        queryFn: async () => {
            const { data } = await api.get('/user/announcements');
            return data;
        },
        staleTime: 0,
        gcTime: 600000,
        refetchInterval: 3000,
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? [],
    });

    const statCards = [
        {
            label: 'মোট ইস্যু',
            engLabel: 'Total Issues',
            value: stats.total,
            icon: FileText,
            bgColor: 'bg-blue-500/20',
            textColor: 'text-blue-400'
        },
        {
            label: 'পেন্ডিং',
            engLabel: 'Pending',
            value: stats.pending,
            icon: Clock,
            bgColor: 'bg-yellow-500/20',
            textColor: 'text-yellow-400'
        },
        {
            label: 'প্রসেসিং',
            engLabel: 'In Progress',
            value: stats.inProgress,
            icon: TrendingUp,
            bgColor: 'bg-purple-500/20',
            textColor: 'text-purple-400'
        },
        {
            label: 'সমাধান',
            engLabel: 'Resolved',
            value: stats.resolved,
            icon: CheckCircle,
            bgColor: 'bg-green-500/20',
            textColor: 'text-green-400'
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
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            স্বাগতম, {user?.name}! 👋
                        </h1>
                        <p className="text-slate-600 flex items-center gap-3 text-sm">
                            <span className="px-2 py-1 bg-slate-50 rounded border border-slate-200 font-medium tracking-wide">Roll: {user?.roll}</span>
                            <span className="px-2 py-1 bg-slate-50 rounded border border-slate-200 font-medium tracking-wide">Dept: {user?.department}</span>
                        </p>
                    </div>
                    <Link
                        to="/user/submit"
                        className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-primary/25 hover:scale-105 active:scale-95"
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
                    className="mb-8"
                >
                    {announcements.slice(0, 2).map((announcement) => (
                        <Card key={announcement._id} className={`mb-3 ${getAnnouncementColor(announcement.type)}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{getAnnouncementIcon(announcement.type)}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800">{announcement.title}</p>
                                        <p className="text-sm text-slate-600 mt-1">{announcement.message}</p>
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
                    className="mb-8"
                >
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <div>
                                    <p className="font-semibold text-red-700">
                                        {stats.criticalCount} টি জরুরি ইস্যু রয়েছে
                                    </p>
                                    <p className="text-sm text-red-600/80">অনুগ্রহ করে দ্রুত ব্যবস্থা নিন</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Stats Grid — ALWAYS renders instantly (no loading skeleton) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * (index + 1) }}
                        >
                            <Card className="bg-white hover:shadow-md transition-all duration-300 border-slate-200 hover:border-primary/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${card.bgColor}`}>
                                            <Icon className={`w-6 h-6 ${card.textColor}`} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-slate-600">{card.label}</h3>
                                    <p className="text-sm text-slate-500">{card.engLabel}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Timeline */}
                <div className="lg:col-span-2">
                    <Card className="h-full bg-white border-slate-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Activity className="w-5 h-5 text-primary" />
                                সাম্প্রতিক কার্যকলাপ
                            </h3>
                            {activities.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">কোন কার্যকলাপ নেই</p>
                            ) : (
                                <div className="space-y-4">
                                    {activities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 group">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-2 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all"></div>
                                            <div className="flex-1 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{activity.message}</p>
                                                <p className="text-xs text-slate-500 mt-1">
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
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                                <Award className="w-5 h-5 text-primary" />
                                আপনার পারফরম্যান্স
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">গড় সমাধান সময়</span>
                                    <span className="text-lg font-bold text-primary">
                                        {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime}h` : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">সমাধান হার</span>
                                    <span className="text-lg font-bold text-green-600">
                                        {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">দ্রুত লিংক</h3>
                            <div className="space-y-2">
                                <Link
                                    to="/user/my-issues"
                                    className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 hover:border-slate-200 shadow-sm group"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-slate-700 group-hover:text-primary">আমার ইস্যু</p>
                                        <span className="text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all">→</span>
                                    </div>
                                </Link>
                                <Link
                                    to="/user/profile"
                                    className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 hover:border-slate-200 shadow-sm group"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-slate-700 group-hover:text-primary">প্রোফাইল</p>
                                        <span className="text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all">→</span>
                                    </div>
                                </Link>
                                <Link
                                    to="/user/settings"
                                    className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 hover:border-slate-200 shadow-sm group"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-slate-700 group-hover:text-primary">সেটিংস</p>
                                        <span className="text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all">→</span>
                                    </div>
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
