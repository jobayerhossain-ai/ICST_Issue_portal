import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import UserSidebar from './UserSidebar';
import { Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

const UserLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 overflow-hidden">
            {/* Sidebar */}
            <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 lg:hidden z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 backdrop-blur-sm shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        ইউজার প্যানেল
                    </h1>
                    {/* Notification Bell on Mobile */}
                    <NotificationBell />
                </header>

                {/* Page Content - FIXED: Properly centered with max-width */}
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
