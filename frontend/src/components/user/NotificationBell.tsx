import { useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import NotificationDropdown from './NotificationDropdown';

export interface Notification {
    id: string;
    type: 'issue_update' | 'comment' | 'vote' | 'resolution' | 'announcement';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date | string;
    issueId?: string | null;
}

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Track read/deleted notifications in localStorage
    const [readIds, setReadIds] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('notif_read_ids');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });
    const [deletedIds, setDeletedIds] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('notif_deleted_ids');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });

    // ★ REAL NOTIFICATIONS — fetched from backend API with real-time polling
    const { data: rawNotifications = [] } = useQuery<Notification[]>({
        queryKey: ['user-notifications'],
        queryFn: async () => {
            const { data } = await api.get('/user/notifications');
            return data;
        },
        staleTime: 0,              // Always check for new updates
        gcTime: 600000,            // Cache 10 min
        refetchInterval: 3000,    // High frequency sync: 3s
        refetchIntervalInBackground: false,
        placeholderData: (prev) => prev ?? [],
    });

    // Apply local read/deleted state to API data
    const notifications = rawNotifications
        .filter(n => !deletedIds.has(n.id))
        .map(n => ({
            ...n,
            read: n.read || readIds.has(n.id),
        }));

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = useCallback((id: string) => {
        setReadIds(prev => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem('notif_read_ids', JSON.stringify([...next]));
            return next;
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        setReadIds(prev => {
            const next = new Set(prev);
            notifications.forEach(n => next.add(n.id));
            localStorage.setItem('notif_read_ids', JSON.stringify([...next]));
            return next;
        });
    }, [notifications]);

    const deleteNotification = useCallback((id: string) => {
        setDeletedIds(prev => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem('notif_deleted_ids', JSON.stringify([...next]));
            return next;
        });
    }, []);

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
