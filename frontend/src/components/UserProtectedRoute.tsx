import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface UserProtectedRouteProps {
    children: React.ReactNode;
}

const UserProtectedRoute = ({ children }: UserProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">লোড হচ্ছে...</p>
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
