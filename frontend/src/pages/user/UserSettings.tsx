import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

const UserSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');

    // Profile settings state
    const [name, setName] = useState(user?.name || '');
    const [department, setDepartment] = useState(user?.department || '');

    // Security settings state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification settings state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [issueUpdates, setIssueUpdates] = useState(true);
    const [commentNotifications, setCommentNotifications] = useState(true);

    const tabs = [
        { id: 'profile', label: 'প্রোফাইল', icon: User },
        { id: 'security', label: 'নিরাপত্তা', icon: Lock },
        { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
        { id: 'privacy', label: 'গোপনীয়তা', icon: Shield },
    ] as const;

    const handleProfileSave = () => {
        // TODO: API call to update profile
        toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে');
    };

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            toast.error('নতুন পাসওয়ার্ড মিল নেই');
            return;
        }
        // TODO: API call to change password
        toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleNotificationSave = () => {
        // TODO: API call to save notification preferences
        toast.success('নোটিফিকেশন সেটিংস সংরক্ষিত হয়েছে');
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800">⚙️ সেটিংস</h1>
                <p className="text-gray-600 mt-1">আপনার অ্যাকাউন্ট এবং পছন্দ ব্যবস্থাপনা করুন</p>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Tabs Sidebar */}
                <Card className="lg:col-span-1 h-fit">
                    <CardContent className="p-4">
                        <div className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-sky-500 text-white'
                                                : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Area */}
                <Card className="lg:col-span-3">
                    <CardContent className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">প্রোফাইল তথ্য</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                নাম
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                রোল নাম্বার
                                            </label>
                                            <input
                                                type="text"
                                                value={user?.roll}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">রোল নাম্বার পরিবর্তন করা যাবে না</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ডিপার্টমেন্ট
                                            </label>
                                            <select
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            >
                                                <option value="CSE">CSE</option>
                                                <option value="EEE">EEE</option>
                                                <option value="CE">CE</option>
                                                <option value="BBA">BBA</option>
                                                <option value="English">English</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ইমেইল
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">ইমেইল পরিবর্তন করা যাবে না</p>
                                        </div>

                                        <button
                                            onClick={handleProfileSave}
                                            className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>পরিবর্তন সংরক্ষণ করুন</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">পাসওয়ার্ড পরিবর্তন</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                বর্তমান পাসওয়ার্ড
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                নতুন পাসওয়ার্ড
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                নতুন পাসওয়ার্ড নিশ্চিত করুন
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                            />
                                        </div>

                                        <button
                                            onClick={handlePasswordChange}
                                            className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Lock className="w-5 h-5" />
                                            <span>পাসওয়ার্ড পরিবর্তন করুন</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">নোটিফিকেশন পছন্দ</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">ইমেইল নোটিফিকেশন</p>
                                                <p className="text-sm text-gray-600">ইমেইলে আপডেট পান</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={emailNotifications}
                                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">পুশ নোটিফিকেশন</p>
                                                <p className="text-sm text-gray-600">ব্রাউজার নোটিফিকেশন পান</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={pushNotifications}
                                                    onChange={(e) => setPushNotifications(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">ইস্যু আপডেট</p>
                                                <p className="text-sm text-gray-600">ইস্যু স্ট্যাটাস পরিবর্তনের সময়</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={issueUpdates}
                                                    onChange={(e) => setIssueUpdates(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">কমেন্ট নোটিফিকেশন</p>
                                                <p className="text-sm text-gray-600">নতুন কমেন্ট পেলে</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={commentNotifications}
                                                    onChange={(e) => setCommentNotifications(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                            </label>
                                        </div>

                                        <button
                                            onClick={handleNotificationSave}
                                            className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>সেটিংস সংরক্ষণ করুন</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4">গোপনীয়তা নিয়ন্ত্রণ</h2>
                                    <p className="text-gray-600 mb-4">আপনার ডেটা এবং গোপনীয়তা ব্যবস্থাপনা করুন</p>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-blue-800">
                                            🔒 আপনার সব তথ্য সুরক্ষিত রাখা হয়। আমরা আপনার অনুমতি ছাড়া কোন তথ্য শেয়ার করি না।
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserSettings;
