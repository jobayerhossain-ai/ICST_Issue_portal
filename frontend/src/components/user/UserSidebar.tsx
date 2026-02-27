import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, FileText, PlusCircle, User as UserIcon, LogOut, X, Settings } from 'lucide-react';

interface UserSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserSidebar = ({ isOpen, onClose }: UserSidebarProps) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        onClose();
        logout();
        navigate('/');
    };

    const handleNavigate = (path: string) => {
        onClose();
        // Small delay so the close animation starts before navigation
        requestAnimationFrame(() => {
            navigate(path);
        });
    };

    const menuItems = [
        { path: '/user/dashboard', icon: Home, label: 'ড্যাশবোর্ড', engLabel: 'Dashboard' },
        { path: '/user/submit', icon: PlusCircle, label: 'ইস্যু সাবমিট', engLabel: 'Submit Issue' },
        { path: '/user/my-issues', icon: FileText, label: 'আমার ইস্যু', engLabel: 'My Issues' },
        { path: '/user/profile', icon: UserIcon, label: 'প্রোফাইল', engLabel: 'Profile' },
        { path: '/user/settings', icon: Settings, label: 'সেটিংস', engLabel: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 text-slate-800 shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary leading-snug">ইউজার প্যানেল</h2>
                    <p className="text-slate-600 text-sm">User Panel</p>
                </div>
                {/* Close button — only visible on mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors active:scale-90"
                    aria-label="Close sidebar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 text-primary rounded-full flex items-center justify-center shadow-sm">
                        <UserIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-600 truncate">{user?.roll}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg transition-all active:scale-[0.97] ${isActive
                                ? 'bg-purple-50 text-primary font-semibold shadow-sm border border-purple-100'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-xs opacity-75">{item.engLabel}</p>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all border border-red-100 active:scale-[0.97]"
                >
                    <LogOut className="w-5 h-5" />
                    <span>লগআউট (Logout)</span>
                </button>
            </div>
        </aside>
    );
};

export default UserSidebar;
