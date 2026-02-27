import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 🔥 AUTO-REDIRECT if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Login Successful",
        description: "Welcome to Admin Panel",
      });

      // 🔥 DIRECT DASHBOARD REDIRECT
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-white/40 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-slate-200 shadow-xl overflow-hidden bg-white/80">
          {/* Decorative glow behind the card header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-primary/10 blur-[50px] pointer-events-none" />

          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </motion.div>

            <CardTitle className="text-3xl font-bold text-slate-800">
              Admin Login
            </CardTitle>

            <CardDescription className="text-slate-600 font-medium">
              Access the administrative dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="pl-10 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••"
                    className="pl-10 pr-12 focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg font-medium bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? 'Logging in...' : 'Login to Dashboard'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-200 pt-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-800 transition-colors">
              ← Back to Home
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
