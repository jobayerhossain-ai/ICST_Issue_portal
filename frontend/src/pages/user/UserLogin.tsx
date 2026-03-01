import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import api from '@/services/api';

const UserLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(formData.email, formData.password);

            // Check for pending issue submission
            if (sessionStorage.getItem('pendingSubmit') === 'true') {
                try {
                    const pendingData = sessionStorage.getItem('pendingIssueData');
                    if (pendingData) {
                        const issueData = JSON.parse(pendingData);
                        await api.post('/issues', issueData);
                        sessionStorage.removeItem('pendingSubmit');
                        sessionStorage.removeItem('pendingIssueData');
                        toast.success('লগইন সফল এবং আপনার সমস্যাটি স্বয়ংক্রিয়ভাবে প্রকাশ করা হয়েছে!');
                        navigate('/issues');
                        return;
                    }
                } catch (e) {
                    console.error("Failed to auto-submit issue:", e);
                    toast.error('অটো-সাবমিশন ব্যর্থ হয়েছে। দয়া করে আবার সমস্যাটি জানান।');
                }
            }

            toast.success('লগইন সফল! (Login successful!)');
            navigate('/user/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'লগইন ব্যর্থ (Login failed)');
        } finally {
            setLoading(false);
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
                <Card className="glass-card border-slate-200 shadow-xl bg-white/80">
                    <CardHeader className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-primary/20"
                        >
                            <LogIn className="w-8 h-8 text-primary" />
                        </motion.div>
                        <CardTitle className="text-3xl font-bold text-slate-800">
                            ইউজার লগইন
                        </CardTitle>
                        <CardDescription className="text-slate-600 font-medium">
                            User Login Portal
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    ইমেইল <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                    <Input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="example@email.com"
                                        className="pl-11 focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    পাসওয়ার্ড <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                    <Input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className="pl-11 focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                            >
                                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-0">
                        <div className="text-center text-sm text-slate-600">
                            নতুন ইউজার?{' '}
                            <Link to="/user/register" className="text-primary hover:text-primary/80 font-semibold hover:underline">
                                রেজিস্টার করুন
                            </Link>
                        </div>
                        <div className="flex justify-between w-full text-xs pt-4 border-t border-slate-200">
                            <Link to="/" className="text-slate-600 hover:text-slate-800 transition-colors">
                                ← হোম পেজে ফেরত যান
                            </Link>
                            <Link to="/admin/login" className="text-slate-600 hover:text-slate-800 transition-colors">
                                এডমিন লগইন →
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default UserLogin;
