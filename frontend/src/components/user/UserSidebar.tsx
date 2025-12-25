import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, FileText, PlusCircle, User as UserIcon, LogOut, Menu, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface UserSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const UserSidebar = ({ isOpen, setIsOpen }: UserSidebarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const currentPath = window.location.pathname;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/user/dashboard', icon: Home, label: 'ড্যাশবোর্ড', engLabel: 'Dashboard' },
        { path: '/user/submit', icon: PlusCircle, label: 'ইস্যু সাবমিট', engLabel: 'Submit Issue' },
        { path: '/user/my-issues', icon: FileText, label: 'আমার ইস্যু', engLabel: 'My Issues' },
        { path: '/user/profile', icon: UserIcon, label: 'প্রোফাইল', engLabel: 'Profile' },
        { path: '/user/settings', icon: Settings, label: 'সেটিংস', engLabel: 'Settings' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-sky-600 to-blue-700 text-white shadow-2xl lg:translate-x-0 transition-transform"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-sky-500/30">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold">ইউজার প্যানেল</h2>
                        <p className="text-sky-100 text-sm">User Panel</p>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-sky-500/30">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user?.name}</p>
                                <p className="text-xs text-sky-100 truncate">{user?.roll}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPath === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-white text-sky-600 shadow-lg'
                                        : 'text-sky-50 hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <div>
                                        <p className="font-medium">{item.label}</p>
                                        <p className="text-xs opacity-75">{item.engLabel}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-sky-500/30">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>লগআউট (Logout)</span>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default UserSidebar;
