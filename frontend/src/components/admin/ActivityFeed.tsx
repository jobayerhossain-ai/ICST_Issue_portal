import { motion, Variants } from 'framer-motion';
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

    const getTimeAgo = (dateInput: Date | string) => {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '';
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'এইমাত্র';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} মিনিট আগে`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ঘন্টা আগে`;
        return `${Math.floor(seconds / 86400)} দিন আগে`;
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 25 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-white/40 overflow-hidden"
        >
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 text-primary" />
                </div>
                <span className="tracking-tight">সাম্প্রতিক কার্যকলাপ</span>
            </h3>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
            >
                {activities.length === 0 ? (
                    <motion.div variants={itemVariants} className="text-slate-400 text-center py-12 flex flex-col items-center">
                        <Clock className="w-12 h-12 opacity-10 mb-2" />
                        <p className="font-medium">কোন কার্যকলাপ নেই</p>
                    </motion.div>
                ) : (
                    activities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            variants={itemVariants}
                            whileHover={{ x: 4 }}
                            className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-white/40 border border-transparent hover:border-slate-100 transition-all duration-200"
                        >
                            <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                {getIcon(activity.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{activity.title}</p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{activity.description}</p>
                                <div className="flex items-center space-x-3 mt-2">
                                    {activity.user && (
                                        <div className="flex items-center space-x-1">
                                            <User className="w-3 h-3 text-slate-400" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activity.user}</p>
                                        </div>
                                    )}
                                    <p className="text-[10px] font-medium text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded-full">
                                        {getTimeAgo(activity.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
};

export default ActivityFeed;
