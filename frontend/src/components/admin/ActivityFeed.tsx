import { motion } from 'framer-motion';
import { Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface Activity {
    id: string;
    type: 'new_issue' | 'status_change' | 'user_signup' | 'issue_resolved';
    title: string;
    description: string;
    user?: string;
    timestamp: Date;
}

interface ActivityFeedProps {
    activities: Activity[];
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'new_issue': return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'status_change': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'user_signup': return <User className="w-5 h-5 text-purple-500" />;
            case 'issue_resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
        }
    };

    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'এইমাত্র';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} মিনিট আগে`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ঘন্টা আগে`;
        return `${Math.floor(seconds / 86400)} দিন আগে`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-sky-600" />
                <span>সাম্প্রতিক কার্যকলাপ</span>
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">কোন কার্যকলাপ নেই</p>
                ) : (
                    activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getIcon(activity.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800">{activity.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                {activity.user && (
                                    <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.timestamp)}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
