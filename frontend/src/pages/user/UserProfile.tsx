import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Hash, BookOpen, Calendar } from 'lucide-react';

const UserProfile = () => {
    const { user } = useAuth();

    const profileFields = [
        { icon: Hash, label: 'রোল নম্বর', engLabel: 'Roll Number', value: user?.roll },
        { icon: User, label: 'নাম', engLabel: 'Name', value: user?.name },
        { icon: BookOpen, label: 'বিভাগ', engLabel: 'Department', value: user?.department },
        { icon: Mail, label: 'ইমেইল', engLabel: 'Email', value: user?.email }
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">আমার প্রোফাইল</h1>
                <p className="text-gray-600">My Profile</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
                {/* Header Section */}
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/30">
                            <User className="w-12 h-12" />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-1">{user?.name}</h2>
                            <p className="text-sky-100 text-lg">{user?.roll}</p>
                            <p className="text-sky-100">{user?.department}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">প্রোফাইল তথ্য</h3>
                    <div className="space-y-4">
                        {profileFields.map((field, index) => {
                            const Icon = field.icon;
                            return (
                                <motion.div
                                    key={field.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="p-3 bg-sky-100 rounded-lg">
                                        <Icon className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">{field.label} ({field.engLabel})</p>
                                        <p className="text-lg font-semibold text-gray-800">{field.value || 'N/A'}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Account Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">একাউন্ট তথ্য</h3>
                        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">একাউন্ট টাইপ (Account Type)</p>
                                <p className="text-lg font-semibold text-gray-800 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-sky-50 border border-sky-100 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold">📝 নোট:</span> আপনার প্রোফাইল তথ্য পরিবর্তন করতে চাইলে অ্যাডমিনের সাথে যোগাযোগ করুন।
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default UserProfile;
