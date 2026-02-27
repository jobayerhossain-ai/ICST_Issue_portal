import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Plus, X } from 'lucide-react';
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
            </div>
        </div>
    );
};

export default SystemConfiguration;
