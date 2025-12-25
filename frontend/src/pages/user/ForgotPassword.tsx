import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setEmailSent(true);
            toast.success('Reset link পাঠানো হয়েছে!', {
                description: 'আপনার email check করুন',
            });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error('Error', {
                description: error.response?.data?.message || 'Failed to send reset link',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 to-purple-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-8 max-w-md w-full text-center"
                >
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">✉️ Email পাঠানো হয়েছে!</h2>
                        <p className="text-gray-600">
                            আপনার email এ password reset link পাঠানো হয়েছে।
                        </p>
                    </div>

                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-sky-800">
                            <strong>Email: </strong>{email}
                        </p>
                        <p className="text-xs text-sky-600 mt-2">
                            Spam folder check করতে ভুলবেন না!
                        </p>
                    </div>

                    <Link
                        to="/user/login"
                        className="inline-flex items-center text-sky-600 hover:text-sky-700 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 to-purple-50">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-sky-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">পাসওয়ার্ড ভুলে গেছেন?</h1>
                    <p className="text-gray-600">
                        আপনার email address দিন। আমরা reset link পাঠাব।
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your-email@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-sky-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'পাঠান Reset Link →'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/user/login"
                        className="inline-flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        পাসওয়ার্ড মনে আছে? Login করুন
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
