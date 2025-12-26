import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
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

const Dashboard = () => {
    const [stats, setStats] = useState<Stats>({
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        todayCount: 0,
        weekCount: 0,
        avgResolutionTime: 0,
        criticalCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<any[]>([]);

    const [activities, setActivities] = useState<any[]>([]); // Using any for flexibility with backend response
    const [healthStatus, setHealthStatus] = useState('healthy');

    useEffect(() => {
        fetchStats();
        fetchActivities();
        checkHealth();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats', error);
            toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const { data } = await api.get('/admin/activity');
            setActivities(data);
        } catch (error) {
            console.error('Failed to load activity', error);
        }
    };

    const checkHealth = async () => {
        try {
            await api.get('/health');
            setHealthStatus('healthy');
        } catch (error) {
            setHealthStatus('degraded');
        }
    };

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
            subtitle: `গড় সময়: ${stats.avgResolutionTime || 0}h`,
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
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800">📊 Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">সিস্টেম ওভারভিউ এবং দ্রুত কাজ</p>
            </motion.div>

            {/* System Health */}
            <div className="mb-6">
                <HealthIndicator
                    status={healthStatus === 'healthy' ? 'healthy' : healthStatus === 'degraded' ? 'warning' : 'error'}
                    message={healthStatus === 'healthy' ? "সব সার্ভিস স্বাভাবিক অবস্থায় চলছে" : "সার্ভারে সমস্যা দেখা দিচ্ছে"}
                />
            </div>

            {/* Alerts */}
            <AlertBanner alerts={alerts} onDismiss={dismissAlert} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Stats Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((card, index) => (
                        <StatsCard
                            key={index}
                            {...card}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            )}

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ActivityFeed activities={activities} />
                </div>

                {/* Additional Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                        <Users className="w-5 h-5 text-sky-600" />
                        <span>সিস্টেম তথ্য</span>
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">মোট ইউজার</span>
                            <span className="text-lg font-bold text-sky-600">{stats.totalUsers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">সক্রিয় ইউজার</span>
                            <span className="text-lg font-bold text-purple-600">{stats.activeUsers || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">সমাধান হার</span>
                            <span className="text-lg font-bold text-green-600">
                                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">গড় Response</span>
                            <span className="text-lg font-bold text-orange-600">
                                {stats.avgResolutionTime > 0 ? `${stats.avgResolutionTime}h` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
