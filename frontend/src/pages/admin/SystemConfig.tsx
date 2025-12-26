import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const SystemConfiguration = () => {
    const [config, setConfig] = useState<SystemConfig>({
        categories: ['Academic', 'Infrastructure', 'Canteen', 'Library', 'Transport', 'Other'],
        priorities: ['low', 'medium', 'high', 'critical'],
        maintenanceMode: false,
        allowRegistration: true,
        slaRules: {
            criticalResponseTime: 2,
            highResponseTime: 24,
            mediumResponseTime: 48
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newPriority, setNewPriority] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await api.get('/admin/system-config');
            if (data) {
                setConfig(data);
            }
        } catch (error) {
            console.error(error);
            // Use default config if none exists
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/admin/system-config', config);
            toast.success('Configuration saved successfully');
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

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            ) : (
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
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.maintenanceMode}
                                            onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Allow User Registration</p>
                                        <p className="text-sm text-gray-500">New users can register accounts</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.allowRegistration}
                                            onChange={(e) => setConfig({ ...config, allowRegistration: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SystemConfiguration;
