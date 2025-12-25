import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';

export interface Notification {
    id: string;
    type: 'issue_update' | 'comment' | 'vote' | 'resolution';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    issueId?: string;
}

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        // Demo notifications - Replace with real data from API
        {
            id: '1',
            type: 'issue_update',
            title: 'ইস্যু আপডেট',
            message: 'আপনার ইস্যু "Library AC Problem" এর স্ট্যাটাস আপডেট হয়েছে',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            issueId: '123'
        },
        {
            id: '2',
            type: 'vote',
            title: 'নতুন ভোট',
            message: '৫ জন আপনার ইস্যুতে ভোট দিয়েছেন',
            read: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            issueId: '123'
        },
        {
            id: '3',
            type: 'resolution',
            title: 'সমাধান সম্পন্ন',
            message: 'আপনার ইস্যু "Canteen Food Quality" সমাধান করা হয়েছে',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            issueId: '124'
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-6 h-6 text-gray-700" />

                {/* Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown Panel */}
                        <NotificationDropdown
                            notifications={notifications}
                            onMarkAsRead={markAsRead}
                            onMarkAllRead={markAllAsRead}
                            onDelete={deleteNotification}
                            onClose={() => setIsOpen(false)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
