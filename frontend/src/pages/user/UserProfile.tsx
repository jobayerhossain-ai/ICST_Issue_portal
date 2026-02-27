import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Hash, BookOpen, Calendar, MessageCircle, Phone } from 'lucide-react';

const UserProfile = () => {
    const { user } = useAuth();

    const profileFields = [
        { icon: Hash, label: 'রোল নম্বর', engLabel: 'Roll Number', value: user?.roll },
        { icon: User, label: 'নাম', engLabel: 'Name', value: user?.name },
        { icon: BookOpen, label: 'বিভাগ', engLabel: 'Department', value: user?.department },
        { icon: Mail, label: 'ইমেইল', engLabel: 'Email', value: user?.email }
    ];

    return (
        <div className="max-w-4xl mx-auto py-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-4xl font-bold text-slate-800 mb-2">আমার প্রোফাইল</h1>
                <p className="text-slate-600">আপনার একাউন্ট তথ্য</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-primary to-purple-600 p-8 text-white relative">
                    <div className="absolute inset-0 bg-noise opacity-10"></div>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg">
                            <User className="w-10 h-10 text-primary" />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-1">{user?.name}</h2>
                            <p className="text-purple-100 text-lg flex items-center justify-center md:justify-start gap-1">
                                <Hash className="w-4 h-4" /> {user?.roll}
                            </p>
                            <p className="text-purple-100/80 flex items-center justify-center md:justify-start gap-1">
                                <BookOpen className="w-4 h-4" /> {user?.department}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">প্রোফাইল তথ্য</h3>
                    <div className="space-y-4">
                        {profileFields.map((field, index) => {
                            const Icon = field.icon;
                            return (
                                <motion.div
                                    key={field.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-colors"
                                >
                                    <div className="p-3 bg-white shadow-sm rounded-lg border border-slate-200">
                                        <Icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-500">{field.label} ({field.engLabel})</p>
                                        <p className="text-lg font-semibold text-slate-800">{field.value || 'N/A'}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Account Info */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">একাউন্ট তথ্য</h3>
                        <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="p-3 bg-white shadow-sm rounded-lg border border-slate-200">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">একাউন্ট টাইপ (Account Type)</p>
                                <p className="text-lg font-semibold text-slate-800 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold text-blue-600">📝 নোট:</span> আপনার প্রোফাইল তথ্য পরিবর্তন করতে চাইলে অ্যাডমিনের সাথে যোগাযোগ করুন।
                        </p>
                    </div>

                    {/* Admin Contact Section */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">অ্যাডমিনের সাথে যোগাযোগ</h3>
                        <p className="text-sm text-slate-500 mb-5">প্রোফাইল পরিবর্তন বা যেকোনো সমস্যায় যোগাযোগ করুন</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="https://wa.me/8801619504428"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-3 px-5 py-4 bg-green-50 hover:bg-green-100 text-green-700 font-semibold rounded-xl border border-green-200 hover:border-green-300 transition-all active:scale-[0.97] shadow-sm hover:shadow-md"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="text-sm font-bold leading-tight">WhatsApp</p>
                                    <p className="text-xs text-green-600 font-normal">01619504428</p>
                                </div>
                            </a>
                            <a
                                href="mailto:jovayerhossain0@gmail.com"
                                className="flex-1 flex items-center justify-center gap-3 px-5 py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl border border-blue-200 hover:border-blue-300 transition-all active:scale-[0.97] shadow-sm hover:shadow-md"
                            >
                                <Mail className="w-5 h-5" />
                                <div className="text-left">
                                    <p className="text-sm font-bold leading-tight">ইমেইল</p>
                                    <p className="text-xs text-blue-600 font-normal">jovayerhossain0@gmail.com</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserProfile;
