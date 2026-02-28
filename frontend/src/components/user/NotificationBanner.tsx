import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ShieldCheck, ArrowRight } from 'lucide-react';
import { registerPushNotifications, getPushSupportStatus } from '@/services/pushNotifications';
import { toast } from 'sonner';

const NotificationBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            // Only show if supported
            const support = getPushSupportStatus();
            if (!support.supported) {
                setIsChecking(false);
                return;
            }

            // Check permission status
            if (Notification.permission === 'default') {
                // Delay showing to not overwhelm
                const timer = setTimeout(() => setIsVisible(true), 2000);
                return () => clearTimeout(timer);
            }
            setIsChecking(false);
        };

        checkStatus();
    }, []);

    const handleEnable = async () => {
        const success = await registerPushNotifications();
        if (success) {
            toast.success('নোটিফিকেশন সফলভাবে চালু হয়েছে! ✅');
            setIsVisible(false);
        } else {
            // If denied, we can't do much automatically, but we can't show banner anymore
            if (Notification.permission === 'denied') {
                toast.error('নোটিফিকেশন ব্লক করা হয়েছে। দয়া করে ব্রাউজার সেটিংস থেকে অনুমতি দিন।');
                setIsVisible(false);
            }
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="bg-gradient-to-r from-primary/10 via-indigo-500/10 to-primary/10 backdrop-blur-md border-b border-primary/20 p-3">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex p-2 bg-primary/20 rounded-full">
                                <Bell className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight text-center sm:text-left">
                                <span className="hidden lg:inline">গুরুত্বপূর্ণ আপডেট মিস করবেন না! </span>
                                রিয়েল-টাইম <span className="text-primary italic">পুশ নোটিফিকেশন</span> চালু করুন।
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleEnable}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border border-white/20"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                অনুমতি দিন
                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </motion.button>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationBanner;
