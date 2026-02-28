import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Plus, X, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { toast } from 'sonner';

interface SystemConfig {
    _id?: string;
    categories: string[];
    priorities: string[];
    maintenanceMode: boolean;
    allowRegistration: boolean;
    slaRules: {
        criticalResponseTime: number;
        highResponseTime: number;
        mediumResponseTime: number;
    };
}

const defaultConfig: SystemConfig = {
    categories: ['Academic', 'Infrastructure', 'Canteen', 'Library', 'Transport', 'Other'],
    priorities: ['low', 'medium', 'high', 'critical'],
    maintenanceMode: false,
    allowRegistration: true,
    slaRules: {
        criticalResponseTime: 2,
        highResponseTime: 24,
        mediumResponseTime: 48
    }
};

const SystemConfiguration = () => {
    const queryClient = useQueryClient();

    // We keep local state for edits and initialize it with data when fetched.
    const [config, setConfig] = useState<SystemConfig>(defaultConfig);
    const [saving, setSaving] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newPriority, setNewPriority] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetType, setResetType] = useState<'issues' | 'users' | 'all' | 'factory' | null>(null);
    const [resetConfirmText, setResetConfirmText] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useQuery<SystemConfig>({
        queryKey: ['systemConfig'],
        queryFn: async () => {
            const { data } = await api.get('/admin/system-config');
            if (data) {
                setConfig(data);
                return data;
            }
            return defaultConfig;
        },
        staleTime: 30000,
        gcTime: 600000,
        refetchOnWindowFocus: false,
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/admin/system-config', config);
            toast.success('Configuration saved successfully');
            queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
        } catch (error) {
            toast.error('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        if (newCategory.trim() && !config.categories.includes(newCategory.trim())) {
            setConfig({
                ...config,
                categories: [...config.categories, newCategory.trim()]
            });
            setNewCategory('');
        }
    };

    const removeCategory = (category: string) => {
        setConfig({
            ...config,
            categories: config.categories.filter(c => c !== category)
        });
    };

    const addPriority = () => {
        if (newPriority.trim() && !config.priorities.includes(newPriority.trim())) {
            setConfig({
                ...config,
                priorities: [...config.priorities, newPriority.trim()]
            });
            setNewPriority('');
        }
    };

    const removePriority = (priority: string) => {
        setConfig({
            ...config,
            priorities: config.priorities.filter(p => p !== priority)
        });
    };
    const initiateReset = (type: 'issues' | 'users' | 'all' | 'factory') => {
        setResetType(type);
        setResetConfirmText('');
        setShowResetModal(true);
    };

    const handleReset = async () => {
        if (resetConfirmText !== 'RESET') return;

        setIsResetting(true);
        try {
            const { data } = await api.post('/admin/system/reset', { type: resetType });
            toast.success(data.message || 'System reset successful');
            setShowResetModal(false);
            if (resetType === 'factory') {
                window.location.reload();
            } else {
                queryClient.invalidateQueries();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Reset failed');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="w-full p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">⚙️ System Configuration</h1>
                        <p className="text-gray-600 mt-1">সিস্টেম সেটিংস পরিচালনা করুন</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </motion.div>

            <div className="space-y-6">
                {/* Issue Categories */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Issue Categories</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {config.categories.map((category) => (
                                <span
                                    key={category}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                                >
                                    {category}
                                    <button
                                        onClick={() => removeCategory(category)}
                                        className="hover:bg-blue-200 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                                placeholder="Add new category"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={addCategory}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Priority Levels */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Priority Levels</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {config.priorities.map((priority) => (
                                <span
                                    key={priority}
                                    className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full capitalize"
                                >
                                    {priority}
                                    <button
                                        onClick={() => removePriority(priority)}
                                        className="hover:bg-purple-200 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addPriority()}
                                placeholder="Add new priority"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                                onClick={addPriority}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* SLA Rules */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">SLA Response Time (Hours)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Critical Priority
                                </label>
                                <input
                                    type="number"
                                    value={config.slaRules.criticalResponseTime}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        slaRules: { ...config.slaRules, criticalResponseTime: Number(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    High Priority
                                </label>
                                <input
                                    type="number"
                                    value={config.slaRules.highResponseTime}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        slaRules: { ...config.slaRules, highResponseTime: Number(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Medium Priority
                                </label>
                                <input
                                    type="number"
                                    value={config.slaRules.mediumResponseTime}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        slaRules: { ...config.slaRules, mediumResponseTime: Number(e.target.value) }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Toggles */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">System Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                                    <p className="text-sm text-gray-500">System will show maintenance message to users</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={config.maintenanceMode}
                                    onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${config.maintenanceMode ? 'bg-sky-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Allow User Registration</p>
                                    <p className="text-sm text-gray-500">New users can register accounts</p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={config.allowRegistration}
                                    onClick={() => setConfig({ ...config, allowRegistration: !config.allowRegistration })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${config.allowRegistration ? 'bg-sky-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 bg-red-50/30">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-red-700">
                            <AlertTriangle className="w-5 h-5" />
                            <h3 className="text-lg font-bold">Danger Zone (সতর্কতামূলক এলাকা)</h3>
                        </div>
                        <p className="text-sm text-red-600 mb-6">
                            নিচের অ্যাকশনগুলো স্থায়ীভাবে ডাটা ডিলিট করে দিবে। সাবধানে ব্যবহার করুন।
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-red-100 rounded-lg bg-white flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800">Reset All Issues</h4>
                                    <p className="text-xs text-gray-500 mb-4">সকল ইস্যু, ভোট এবং কমেন্ট মুছে যাবে। ইউজার অ্যাকাউন্ট ঠিক থাকবে।</p>
                                </div>
                                <button
                                    onClick={() => initiateReset('issues')}
                                    className="w-full py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium text-sm"
                                >
                                    Reset Issues
                                </button>
                            </div>

                            <div className="p-4 border border-red-100 rounded-lg bg-white flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800">Reset User Accounts</h4>
                                    <p className="text-xs text-gray-500 mb-4">এডমিন ছাড়া সকল ইউজার অ্যাকাউন্ট মুছে যাবে।</p>
                                </div>
                                <button
                                    onClick={() => initiateReset('users')}
                                    className="w-full py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium text-sm"
                                >
                                    Reset Users
                                </button>
                            </div>

                            <div className="p-4 border border-red-100 rounded-lg bg-white flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800">Clear All Transactions</h4>
                                    <p className="text-xs text-gray-500 mb-4">ইস্যু এবং মেসেজ মুছে যাবে। ইউজার এবং কনফিগারেশন ঠিক থাকবে।</p>
                                </div>
                                <button
                                    onClick={() => initiateReset('all')}
                                    className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium text-sm"
                                >
                                    Clear All Data
                                </button>
                            </div>

                            <div className="p-4 border border-red-200 rounded-lg bg-red-100/50 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-red-800">Factory Reset</h4>
                                    <p className="text-xs text-red-700 mb-4">রুট এডমিন ছাড়া সবকিছু মুছে যাবে এবং সিস্টেম একদম নতুনের মতো হয়ে যাবে।</p>
                                </div>
                                <button
                                    onClick={() => initiateReset('factory')}
                                    className="w-full py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Full Factory Reset
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-red-100"
                    >
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">আপনি কি নিশ্চিত?</h2>
                        </div>

                        <p className="text-gray-600 mb-6 font-medium">
                            এটি একটি অতি গুরুত্বপূর্ণ সিদ্ধান্ত। আপনি <span className="text-red-600 font-bold underline capitalize">{resetType}</span> রিসেট করতে চাচ্ছেন। এই ডাটাগুলো আর ফিরে পাওয়া সম্ভব না।
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                            <p className="text-sm text-gray-700 mb-2">কনফার্ম করতে নিচে বড় হাতের অক্ষরে <span className="font-bold">RESET</span> লিখুন:</p>
                            <input
                                type="text"
                                value={resetConfirmText}
                                onChange={(e) => setResetConfirmText(e.target.value)}
                                placeholder="RESET"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none uppercase font-bold text-center tracking-widest"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={resetConfirmText !== 'RESET' || isResetting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isResetting ? (
                                    <>
                                        <RotateCcw className="w-4 h-4 animate-spin" />
                                        রিসেট হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        নিশ্চিত করুন
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SystemConfiguration;
