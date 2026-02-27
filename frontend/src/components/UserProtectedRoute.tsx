import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UserProtectedRouteProps {
    children: React.ReactNode;
}

const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                {/* Skeleton Sidebar (Desktop) */}
                <div className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 h-full">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse"></div>
                        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex-1 px-4 py-6 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2">
                                <div className="w-5 h-5 rounded bg-slate-200 animate-pulse"></div>
                                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skeleton Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile Header Skeleton */}
                    <header className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
                        <div className="w-6 h-6 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse"></div>
                    </header>

                    {/* Page Content Area */}
                    <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {/* structural loading space for page content */}
                    </main>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/user/login" replace />;
    }

    // Allow both users and admins to access user panel
    // Admins can view user panel if needed
    return <>{children}</>;
};

export default UserProtectedRoute;
