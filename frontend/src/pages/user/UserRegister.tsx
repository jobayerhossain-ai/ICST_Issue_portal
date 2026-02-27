import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, BookOpen, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const UserRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        roll: '',
        name: '',
        department: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('পাসওয়ার্ড মিলছে না (Passwords do not match)');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (Password must be at least 6 characters)');
            return;
        }

        setLoading(true);
        try {
            await register(formData.roll, formData.name, formData.department, formData.email, formData.password);
            toast.success('রেজিস্ট্রেশন সফল! (Registration successful!)');
            navigate('/user/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'রেজিস্ট্রেশন ব্যর্থ (Registration failed)');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center p-4 py-8 relative">
            {/* Background elements to ensure light-theme depth */}
            <div className="absolute inset-0 bg-white/40 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <Card className="glass-card border-slate-200 shadow-xl bg-white/80">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold text-slate-800">
                            নতুন একাউন্ট খুলুন
                        </CardTitle>
                        <CardDescription className="text-slate-600 font-medium">
                            User Registration Form
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        রোল নম্বর <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                        <Input
                                            type="text"
                                            name="roll"
                                            value={formData.roll}
                                            onChange={handleChange}
                                            required
                                            placeholder="2021-1-60-001"
                                            className="pl-10 bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        বিভাগ <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                        <Input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            required
                                            placeholder="CSE"
                                            className="pl-10 bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    পূর্ণ নাম <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                    <Input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="আপনার পূর্ণ নাম"
                                        className="pl-11 bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

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
                                        className="pl-11 bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-800 placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        পাসওয়ার্ড <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                        <Input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="******"
                                            className="pl-10 bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        নিশ্চিত করুন <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                                        <Input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="******"
                                            className="pl-10 bg-slate-50 border-slate-200 focus:border-primary/50 text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all mt-4"
                            >
                                {loading ? 'রেজিস্টার হচ্ছে...' : 'রেজিস্টার করুন'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-0">
                        <div className="text-center text-sm text-slate-600">
                            ইতিমধ্যে একাউন্ট আছে?{' '}
                            <Link to="/user/login" className="text-primary hover:text-primary/80 font-semibold hover:underline">
                                লগইন করুন
                            </Link>
                        </div>
                        <div className="text-center w-full text-xs text-slate-600 pt-2">
                            <Link to="/" className="hover:text-slate-800 transition-colors">
                                ← হোম পেজে ফেরত যান
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default UserRegister;
