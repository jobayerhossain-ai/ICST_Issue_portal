import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
    FileText, Clock, CheckCircle, PlusCircle, TrendingUp,
    AlertTriangle, Activity, Award, ArrowRight
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

    const { data: stats = defaultStats } = useQuery<Stats>({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const { data } = await api.get('/user/stats');
            return data;
        },
        staleTime: 30000,
        gcTime: 600000,
        refetchInterval: 10000,
        placeholderData: (prev) => prev ?? defaultStats,
    });

    const { data: activities = [] } = useQuery<ActivityItem[]>({
        queryKey: ['user-activities'],
        queryFn: async () => {
            const { data } = await api.get('/user/activities');
            return data;
        },
        staleTime: 15000,
        refetchInterval: 10000,
        placeholderData: (prev) => prev ?? [],
    });

    const { data: announcements = [] } = useQuery<Announcement[]>({
        queryKey: ['user-announcements'],
        queryFn: async () => {
            const { data } = await api.get('/user/announcements');
            return data;
        },
        staleTime: 60000,
        placeholderData: (prev) => prev ?? [],
    });

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 20 }
        }
    };

    const statCards = [
        {
            label: 'মোট ইস্যু',
            engLabel: 'Total Issues',
            value: stats.total,
            icon: FileText,
            color: 'from-blue-500 to-indigo-600',
            iconColor: 'text-blue-600'
        },
        {
            label: 'পেন্ডিং',
            engLabel: 'Pending',
            value: stats.pending,
            icon: Clock,
            color: 'from-amber-400 to-orange-500',
            iconColor: 'text-amber-600'
        },
        {
            label: 'প্রসেসিং',
            engLabel: 'In Progress',
            value: stats.inProgress,
            icon: TrendingUp,
            color: 'from-purple-500 to-fuchsia-600',
            iconColor: 'text-purple-600'
        },
        {
            label: 'সমাধান',
            engLabel: 'Resolved',
            value: stats.resolved,
            icon: CheckCircle,
            color: 'from-emerald-400 to-teal-500',
            iconColor: 'text-emerald-600'
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full pb-10"
        >
            {/* Welcome Header - Premium Look */}
            <motion.div variants={sectionVariants} className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            স্বাগতম, <span className="text-primary italic">{user?.name}</span>! 👋
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/60 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                Roll: {user?.roll}
                            </span>
                            <span className="px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/60 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
                                Dept: {user?.department}
                            </span>
                        </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                            to="/user/submit"
                            className="flex items-center gap-3 bg-gradient-to-r from-primary to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/25 transition-all text-sm uppercase tracking-widest"
                        >
                            <PlusCircle className="w-5 h-5" />
                            নতুন ইস্যু জমা দিন
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Announcements - Glassmorphism */}
            {announcements.length > 0 && (
                <motion.div variants={sectionVariants} className="mb-10">
                    <div className="bg-amber-50/50 backdrop-blur-xl border border-amber-100 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <AlertTriangle className="w-24 h-24 text-amber-600" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-amber-800 font-black uppercase tracking-[0.2em] text-[10px] mb-4">গুরুত্বপূর্ণ নোটিশ</h3>
                            <div className="space-y-4">
                                {announcements.slice(0, 1).map((ann) => (
                                    <div key={ann._id} className="flex items-start gap-4">
                                        <div className="p-2 bg-amber-200/50 rounded-lg">
                                            <AlertTriangle className="w-5 h-5 text-amber-700" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{ann.title}</p>
                                            <p className="text-sm text-slate-700 mt-1 leading-relaxed">{ann.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid - Premium Cards */}
            <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.label}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl -z-10 bg-slate-200/50" />
                        <Card className="h-full bg-white/70 backdrop-blur-xl border-white/60 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden border-2">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{card.value}</p>
                                    </div>
                                </div>
                                <h3 className="font-black text-slate-800 tracking-tight">{card.label}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{card.engLabel}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity - Premium List */}
                <div className="lg:col-span-2">
                    <Card className="h-full bg-white/70 backdrop-blur-xl border-white/60 shadow-xl shadow-slate-200/40 rounded-3xl border-2">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <span className="tracking-tight">সাম্প্রতিক কার্যকলাপ</span>
                            </h3>
                            {activities.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Activity className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">কোন কার্যকলাপ পাওয়া যায়নি</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {activities.slice(0, 5).map((activity, i) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + (i * 0.1) }}
                                            className="flex items-start gap-4 group"
                                        >
                                            <div className="relative mt-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 group-hover:ring-primary/30 group-hover:scale-125 transition-all" />
                                                {i !== activities.slice(0, 5).length - 1 && (
                                                    <div className="absolute top-2.5 left-1 w-px h-16 bg-slate-100 group-hover:bg-primary/20 transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">{activity.message}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-slate-50 inline-block px-2 py-0.5 rounded">
                                                    {new Date(activity.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Performance - Column */}
                <div className="space-y-8">
                    {/* Performance Premium Card */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl rounded-3xl border-0 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 opacity-10 bg-white/20 blur-3xl rounded-full" />
                        <CardContent className="p-8 relative z-10">
                            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg">
                                    <Award className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="tracking-tight uppercase tracking-widest text-xs">আপনার পারফরম্যান্স</span>
                            </h3>
                            <div className="space-y-4">
                                <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">সমাধান হার</span>
                                    <span className="text-2xl font-black text-emerald-400">
                                        {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">গড় সমাধান সময়</span>
                                    <span className="text-2xl font-black text-amber-400">
                                        {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime}h` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Link List - Premium */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">দ্রুত নিয়ন্ত্রণ</h4>
                        {[
                            { label: 'আমার ইস্যু', to: '/user/my-issues', icon: FileText, color: 'text-blue-500' },
                            { label: 'প্রোফাইল সেটিংস', to: '/user/profile', icon: Award, color: 'text-purple-500' }
                        ].map((link) => (
                            <Link
                                key={link.label}
                                to={link.to}
                                className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-md hover:bg-white rounded-2xl border border-white/40 shadow-xl shadow-slate-200/20 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-primary/10 transition-colors ${link.color}`}>
                                        <link.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 tracking-tight group-hover:text-primary transition-colors">{link.label}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserDashboard;
