import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UserSidebar from './UserSidebar';
import { Menu, X, Globe, ExternalLink } from 'lucide-react';
import NotificationBell from './NotificationBell';

const UserLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // ─── CLOSE ON ROUTE CHANGE ───
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // ─── BODY SCROLL LOCK ───
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [sidebarOpen]);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar — always visible on lg+ */}
            <div className="hidden lg:block">
                <UserSidebar isOpen={true} onClose={() => { }} />
            </div>

            {/* Mobile Slide-out Sidebar — framer-motion animated */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.div
                        key="mobile-sidebar-wrapper"
                        className="fixed inset-0 z-[90] lg:hidden"
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        {/* Backdrop overlay — click to close */}
                        <motion.div
                            className="absolute inset-0 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeSidebar}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                closeSidebar();
                            }}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        />

                        {/* Sidebar Panel */}
                        <motion.div
                            className="absolute top-0 left-0 h-full w-4/5 max-w-[300px]"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300,
                                mass: 0.8,
                            }}
                            style={{
                                WebkitTapHighlightColor: 'transparent',
                                overscrollBehavior: 'contain',
                            }}
                        >
                            <UserSidebar isOpen={true} onClose={closeSidebar} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Visible on all screens now for parity) */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(prev => !prev)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors active:scale-90 border border-slate-200 shadow-sm"
                            aria-label="Toggle sidebar"
                        >
                            {sidebarOpen ? (
                                <X className="w-6 h-6 text-slate-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-slate-700" />
                            )}
                        </button>
                        <h1 className="text-xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            {location.pathname.includes('dashboard') ? 'ইউজার ড্যাশবোর্ড' : 'ইউজার প্যানেল'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={window.location.origin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full hover:bg-primary hover:text-white transition-all active:scale-95 text-xs font-bold border border-slate-200 shadow-sm group"
                        >
                            <Globe className="w-3.5 h-3.5 group-hover:animate-pulse" />
                            <span className="hidden sm:inline">Visit Site</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
