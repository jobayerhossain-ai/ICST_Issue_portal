import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link');
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('পাসওয়ার্ড মিলছে না', {
                description: 'দুটি পাসওয়ার্ড একই হতে হবে',
            });
            return;
        }

        if (newPassword.length < 6) {
            toast.error('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword,
            });

            setResetSuccess(true);
            toast.success('✅ পাসওয়ার্ড রিসেট সফল!', {
                description: 'এখন নতুন পাসওয়ার্ড দিয়ে login করুন',
            });

            setTimeout(() => {
                navigate('/user/login');
            }, 2000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error('Reset Failed', {
                description: error.response?.data?.message || 'Token expired or invalid',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (resetSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-sky-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">✅ সফল!</h2>
                    <p className="text-gray-600 mb-4">
                        আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।
                    </p>
                    <p className="text-sm text-gray-500">
                        Login page এ redirect করা হচ্ছে...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-purple-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">নতুন পাসওয়ার্ড সেট করুন</h1>
                    <p className="text-gray-600">
                        আপনার একাউন্টের জন্য একটি শক্তিশালী পাসওয়ার্ড choose করুন
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">নতুন পাসওয়ার্ড</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="অন্তত ৬ অক্ষরের পাসওয়ার্ড"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">পাসওয়ার্ড Confirm করুন</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="আবার পাসওয়ার্ড লিখুন"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-sm text-red-600">❌ পাসওয়ার্ড match করছে না</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                        className="w-full py-3 bg-gradient-to-r from-orange-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Resetting...' : 'পাসওয়ার্ড রিসেট করুন →'}
                    </button>
                </form>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-xs text-yellow-800">
                        ⚠️ পাসওয়ার্ড reset link শুধুমাত্র <strong>1 ঘন্টার</strong> জন্য valid থাকবে।
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
