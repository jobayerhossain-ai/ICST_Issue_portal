import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, FileText, Settings, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import { toast } from 'sonner';

interface AuditLog {
    _id: string;
    adminId: {
        _id: string;
        name: string;
        email: string;
    };
    targetId: string;
    targetType: string;
    action: string;
    details: string;
    ip: string;
    timestamp: string;
}

const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/audit-logs');
            setLogs(data);
        } catch (error) {
            console.error(error);
            toast.error('Audit logs লোড করা যায়নি');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (targetType: string) => {
        switch (targetType) {
            case 'user': return <User className="w-5 h-5 text-blue-600" />;
            case 'issue': return <FileText className="w-5 h-5 text-green-600" />;
            case 'system': return <Settings className="w-5 h-5 text-purple-600" />;
            default: return <Shield className="w-5 h-5 text-gray-600" />;
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('block')) return 'bg-red-50 border-red-200';
        if (action.includes('reset')) return 'bg-yellow-50 border-yellow-200';
        if (action.includes('create')) return 'bg-green-50 border-green-200';
        return 'bg-blue-50 border-blue-200';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.adminId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || log.targetType === typeFilter;
        return matchesSearch && matchesType;
    });

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800">🔒 Audit Logs</h1>
                <p className="text-gray-600 mt-1">সিস্টেম কার্যকলাপের সম্পূর্ণ রেকর্ড</p>
            </motion.div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by action, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        >
                            <option value="all">সব ধরনের লগ</option>
                            <option value="user">User Actions</option>
                            <option value="issue">Issue Actions</option>
                            <option value="system">System Actions</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        কোন audit log পাওয়া যায়নি
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log, index) => (
                        <motion.div
                            key={log._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`border ${getActionColor(log.action)}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getActionIcon(log.targetType)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{log.action}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                    {formatTimestamp(log.timestamp)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {log.adminId?.email || 'System'}
                                                </span>
                                                <span>IP: {log.ip || 'N/A'}</span>
                                                <span className="px-2 py-0.5 bg-gray-200 rounded-full">
                                                    {log.targetType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
