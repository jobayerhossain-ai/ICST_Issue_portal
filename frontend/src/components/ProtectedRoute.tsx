import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Skeleton Sidebar */}
        <div className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col">
          <div className="h-16 border-b border-slate-200 flex items-center px-4">
            <div className="w-8 h-8 rounded bg-slate-200 animate-pulse mr-3"></div>
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-slate-200 animate-pulse"></div>
                <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-slate-200 bg-white flex items-center px-4 sticky top-0">
            <div className="w-6 h-6 rounded bg-slate-200 animate-pulse mr-4"></div>
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse"></div>
          </header>
          <main className="flex-1 p-6">
            {/* structural loading space for page content */}
          </main>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
