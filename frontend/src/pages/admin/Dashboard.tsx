import { useState } from 'react';
import { motion } from 'framer-motion';
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

    const statsCards = [
        {
            title: 'মোট ইস্যু',
            value: stats.total,
            subtitle: `আজ: ${stats.todayCount} | সপ্তাহ: ${stats.weekCount}`,
            icon: FileText,
            color: 'from-blue-500 to-blue-600',
            trend: 'up' as const,
            trendValue: '+12%'
        },
        {
            title: 'পেন্ডিং',
            value: stats.pending,
            subtitle: `${stats.criticalCount} টি Critical`,
            icon: Clock,
            color: 'from-yellow-500 to-orange-600',
            trend: 'down' as const,
            trendValue: '-5%'
        },
        {
            title: 'প্রসেসিং',
            value: stats.inProgress,
            subtitle: 'চলমান সমাধান',
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            trend: 'up' as const,
            trendValue: '+8%'
        },
        {
            title: 'সমাধান',
            value: stats.resolved,
            subtitle: `গড় সময়: ${stats.avgResolutionTime}h`,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            trend: 'up' as const,
            trendValue: '+18%'
        },
    ];

    return (
        <div className="w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-slate-800">📊 Admin Dashboard</h1>
                <p className="text-slate-600 mt-1">সিস্টেম ওভারভিউ এবং দ্রুত কাজ</p>
            </motion.div>

            {/* System Health */}
            <div className="mb-8">
                <HealthIndicator
                    status={healthStatus === 'healthy' ? 'healthy' : 'warning'}
                    message={healthStatus === 'healthy' ? "সব সার্ভিস স্বাভাবিক অবস্থায় চলছে" : "সার্ভারে সমস্যা দেখা দিচ্ছে"}
                />
            </div>

            {/* Alerts */}
            <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

            {/* Quick Actions */}
            <div className="mb-8">
                <QuickActions />
            </div>

            {/* Stats Grid — NO SKELETON, instant render */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((card, index) => (
                    <StatsCard
                        key={index}
                        {...card}
                        delay={index * 0.1}
                    />
                ))}
            </div>

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} />
                </div>

                {/* Additional Info Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
                        <Users className="w-5 h-5 text-primary" />
                        <span>সিস্টেম তথ্য</span>
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-500">মোট ইউজার</span>
                            <span className="text-lg font-bold text-primary">{stats.totalUsers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-500">সক্রিয় ইউজার</span>
                            <span className="text-lg font-bold text-purple-600">{stats.activeUsers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-500">সমাধান হার</span>
                            <span className="text-lg font-bold text-green-600">
                                {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-500">গড় Response</span>
                            <span className="text-lg font-bold text-orange-600">
                                {stats.avgResolutionTime ? `${stats.avgResolutionTime}h` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
