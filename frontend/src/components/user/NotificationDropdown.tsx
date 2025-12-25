import { motion } from 'framer-motion';
import { X, Check, Trash2, MessageSquare, TrendingUp, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { Notification } from './NotificationBell';
import { Link } from 'react-router-dom';

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllRead: () => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

const NotificationDropdown = ({
    notifications,
    onMarkAsRead,
    onMarkAllRead,
    onDelete,
    onClose
}: NotificationDropdownProps) => {

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'issue_update': return <AlertCircle className="w-5 h-5 text-blue-500" />;
            case 'comment': return <MessageSquare className="w-5 h-5 text-purple-500" />;
            case 'vote': return <TrendingUp className="w-5 h-5 text-orange-500" />;
            case 'resolution': return <CheckCircle className="w-5 h-5 text-green-500" />;
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
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[32rem] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
                <h3 className="font-bold text-lg text-gray-800">নোটিফিকেশন</h3>
                <div className="flex items-center space-x-2">
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={onMarkAllRead}
                            className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1"
                        >
                            <Check className="w-4 h-4" />
                            <span>সব পড়া হয়েছে</span>
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">কোন নোটিফিকেশন নেই</p>
                        <p className="text-sm text-gray-400 mt-1">নতুন আপডেট এখানে দেখা যাবে</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-sky-50/50' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 text-sm">
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {getTimeAgo(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center space-x-1 ml-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => onMarkAsRead(notification.id)}
                                                        className="p-1 hover:bg-white rounded transition-colors"
                                                        title="পড়া হয়েছে চিহ্নিত করুন"
                                                    >
                                                        <Check className="w-4 h-4 text-sky-600" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDelete(notification.id)}
                                                    className="p-1 hover:bg-white rounded transition-colors"
                                                    title="মুছে ফেলুন"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* View Issue Link */}
                                        {notification.issueId && (
                                            <Link
                                                to={`/issues/${notification.issueId}`}
                                                onClick={onClose}
                                                className="inline-block mt-2 text-xs text-sky-600 hover:text-sky-700 font-medium"
                                            >
                                                ইস্যু দেখুন →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <Link
                        to="/user/notifications"
                        onClick={onClose}
                        className="block text-center text-sm text-sky-600 hover:text-sky-700 font-medium"
                    >
                        সব নোটিফিকেশন দেখুন
                    </Link>
                </div>
            )}
        </motion.div>
    );
};

export default NotificationDropdown;
