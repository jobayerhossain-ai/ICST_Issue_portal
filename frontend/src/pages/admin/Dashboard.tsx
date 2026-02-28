import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { FileText, Clock, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import StatsCard from '@/components/admin/StatsCard';
import AlertBanner from '@/components/admin/AlertBanner';
import QuickActions from '@/components/admin/QuickActions';
import ActivityFeed from '@/components/admin/ActivityFeed';
import HealthIndicator from '@/components/admin/HealthIndicator';

interface Stats {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    todayCount: number;
    weekCount: number;
    avgResolutionTime: number;
    criticalCount: number;
    totalUsers?: number;
    activeUsers?: number;
}

const defaultStats: Stats = { total: 0, pending: 0, inProgress: 0, resolved: 0, todayCount: 0, weekCount: 0, avgResolutionTime: 0, criticalCount: 0, totalUsers: 0, activeUsers: 0 };

const Dashboard = () => {
    const [alerts, setAlerts] = useState<any[]>([]);

    const { data: stats = defaultStats } = useQuery<Stats>({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data;
        },
        staleTime: 30000,
        gcTime: 600000,
        refetchInterval: 10000,
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? defaultStats,
    });

    const { data: activities = [] } = useQuery<any[]>({
        queryKey: ['adminActivities'],
        queryFn: async () => {
            const { data } = await api.get('/admin/activity');
            return data;
        },
        staleTime: 15000,
        gcTime: 600000,
        refetchInterval: 10000,
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? [],
    });

    const { isError: isHealthError } = useQuery({
        queryKey: ['healthCheck'],
        queryFn: async () => {
            const { data } = await api.get('/health');
            return data;
        },
        retry: 1,
        staleTime: 60000,
        refetchInterval: 120000,
        placeholderData: (prev) => prev ?? { status: 'ok' },
    });

    const healthStatus = isHealthError ? 'degraded' : 'healthy';

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring' as const, stiffness: 100, damping: 20 }
        }
    };

    const statsCards = [
        {
            title: 'মোট ইস্যু',
            value: stats.total,
            subtitle: `আজ: ${stats.todayCount} | সপ্তাহ: ${stats.weekCount}`,
            icon: FileText,
            color: 'from-blue-600 to-blue-700',
            trend: 'up' as const,
            trendValue: '+12%'
        },
        {
            title: 'পেন্ডিং',
            value: stats.pending,
            subtitle: `${stats.criticalCount} টি Critical`,
            icon: Clock,
            color: 'from-amber-500 to-orange-600',
            trend: 'down' as const,
            trendValue: '-5%'
        },
        {
            title: 'প্রসেসিং',
            value: stats.inProgress,
            subtitle: 'चलমান সমাধান',
            icon: TrendingUp,
            color: 'from-violet-500 to-purple-700',
            trend: 'up' as const,
            trendValue: '+8%'
        },
        {
            title: 'সমাধান',
            value: stats.resolved,
            subtitle: `গড় সময়: ${stats.avgResolutionTime}h`,
            icon: CheckCircle,
            color: 'from-emerald-500 to-green-700',
            trend: 'up' as const,
            trendValue: '+18%'
        },
    ];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full pb-10"
        >
            {/* Header */}
            <motion.div variants={sectionVariants} className="mb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    📊 Admin <span className="text-primary italic">Dashboard</span>
                </h1>
                <p className="text-slate-500 mt-2 font-medium flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>সিস্টেম ওভারভিউ এবং দ্রুত নিয়ন্ত্রণ</span>
                </p>
            </motion.div>

            {/* System Health */}
            <motion.div variants={sectionVariants} className="mb-10">
                <div className="bg-white/40 backdrop-blur-md border border-white/60 p-1 rounded-2xl">
                    <HealthIndicator
                        status={healthStatus === 'healthy' ? 'healthy' : 'warning'}
                        message={healthStatus === 'healthy' ? "সব সার্ভিস স্বাভাবিক অবস্থায় চলছে" : "সার্ভারে সমস্যা দেখা দিচ্ছে"}
                    />
                </div>
            </motion.div>

            {/* Alerts */}
            <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

            {/* Quick Actions */}
            <motion.div variants={sectionVariants} className="mb-10">
                <QuickActions />
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statsCards.map((card, index) => (
                    <StatsCard
                        key={index}
                        {...card}
                        delay={0.1 * index}
                    />
                ))}
            </motion.div>

            {/* Activity Feed & Info */}
            <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} />
                </div>

                {/* System Info Card */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-xl shadow-slate-200/50"
                >
                    <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="tracking-tight">সিস্টেম তথ্য</span>
                    </h3>

                    <div className="space-y-4">
                        {[
                            { label: 'মোট ইউজার', value: stats.totalUsers || 0, color: 'text-primary', bg: 'bg-primary/5' },
                            { label: 'সক্রিয় ইউজার', value: stats.activeUsers || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'সমাধান হার', value: `${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'গড় Response', value: stats.avgResolutionTime ? `${stats.avgResolutionTime}h` : 'N/A', color: 'text-orange-600', bg: 'bg-orange-50' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className={`flex items-center justify-between p-4 ${stat.bg} rounded-xl border border-white/20`}
                            >
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
