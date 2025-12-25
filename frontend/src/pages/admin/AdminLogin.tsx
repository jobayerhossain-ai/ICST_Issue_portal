import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
      navigate('/admin/dashboard');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 border-2 border-primary">
              <Shield className="h-12 w-12 text-primary neon-glow" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Admin Login
          </h1>

          <p className="text-muted-foreground">
            Access the administrative dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••"
                className="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg"
          >
            {isLoading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
