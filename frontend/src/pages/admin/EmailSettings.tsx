import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, Wifi, WifiOff, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface EmailConfig {
    emailHost?: string;
    emailPort?: number;
    emailSecure?: boolean;
    emailUser?: string;
    emailPassword?: string;
    emailFromName?: string;
}

const EmailSettings = () => {
    const queryClient = useQueryClient();
    const [config, setConfig] = useState<EmailConfig>({
        emailHost: '',
        emailPort: 587,
        emailSecure: false,
        emailUser: '',
        emailPassword: '',
        emailFromName: 'ICST Issue Portal',
    });
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<null | { success: boolean; message?: string; diagnosis?: string }>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Load existing config from system-config
    useQuery({
        queryKey: ['emailSettings'],
        queryFn: async () => {
            const { data } = await api.get('/admin/system-config');
            if (data) {
                setConfig({
                    emailHost: data.emailHost || '',
                    emailPort: data.emailPort || 587,
                    emailSecure: data.emailSecure ?? false,
                    emailUser: data.emailUser || '',
                    emailPassword: data.emailPassword || '',
                    emailFromName: data.emailFromName || 'ICST Issue Portal',
                });
                setLoaded(true);
            }
            return data;
        },
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const handleSave = async () => {
        setSaving(true);
        setTestResult(null);
        try {
            await api.post('/admin/system-config', config);
            queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
            toast.success('📧 Email settings saved! The new config will be used for all future emails.');
        } catch (err) {
            toast.error('Failed to save email settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const { data } = await api.post('/admin/test-email', {
                testRecipient: config.emailUser,
            });
            setTestResult({ success: true, message: data.message || 'Connection successful!' });
            toast.success('✅ SMTP connection successful!');
        } catch (err: any) {
            const errData = err.response?.data;
            setTestResult({
                success: false,
                message: errData?.error || 'Connection failed',
                diagnosis: errData?.diagnosis,
            });
            toast.error('❌ SMTP connection failed');
        } finally {
            setTesting(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white text-gray-800 transition";

    return (
        <div className="w-full p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow">
                            <Mail className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Email Settings</h1>
                            <p className="text-gray-500 text-sm mt-0.5">SMTP configuration — stored in database, no redeploy needed</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            id="btn-test-smtp"
                            onClick={handleTest}
                            disabled={testing || !config.emailHost}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                        >
                            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                            Test Connection
                        </button>
                        <button
                            id="btn-save-email-settings"
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Test Result Banner */}
            {testResult && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-5 flex items-start gap-3 p-4 rounded-xl border ${testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
                >
                    {testResult.success ? <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                    <div>
                        <p className="font-semibold">{testResult.success ? 'Connection Successful' : 'Connection Failed'}</p>
                        <p className="text-sm mt-1 opacity-80">{testResult.message}</p>
                        {testResult.diagnosis && !testResult.success && (
                            <p className="text-sm mt-2 font-medium text-red-700">💡 {testResult.diagnosis}</p>
                        )}
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server Settings */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 bg-sky-500 rounded-full" />
                            Server Settings
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Host</label>
                            <input
                                id="email-host"
                                type="text"
                                value={config.emailHost}
                                onChange={e => setConfig({ ...config, emailHost: e.target.value })}
                                placeholder="smtp.gmail.com"
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Port</label>
                                <input
                                    id="email-port"
                                    type="number"
                                    value={config.emailPort}
                                    onChange={e => setConfig({ ...config, emailPort: Number(e.target.value) })}
                                    placeholder="587"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Encryption</label>
                                <div className="flex gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, emailSecure: false, emailPort: 587 })}
                                        className={`flex-1 py-2 text-sm rounded-lg border transition font-medium ${!config.emailSecure ? 'bg-sky-600 text-white border-sky-600' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        TLS (587)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfig({ ...config, emailSecure: true, emailPort: 465 })}
                                        className={`flex-1 py-2 text-sm rounded-lg border transition font-medium ${config.emailSecure ? 'bg-sky-600 text-white border-sky-600' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        SSL (465)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Auth Settings */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                            Authentication
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">From Name</label>
                            <input
                                id="email-from-name"
                                type="text"
                                value={config.emailFromName}
                                onChange={e => setConfig({ ...config, emailFromName: e.target.value })}
                                placeholder="ICST Issue Portal"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address (User)</label>
                            <input
                                id="email-user"
                                type="email"
                                value={config.emailUser}
                                onChange={e => setConfig({ ...config, emailUser: e.target.value })}
                                placeholder="your@gmail.com"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password / App Password</label>
                            <div className="relative">
                                <input
                                    id="email-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={config.emailPassword}
                                    onChange={e => setConfig({ ...config, emailPassword: e.target.value })}
                                    placeholder="••••••••••••••••"
                                    className={`${inputClass} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tips Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6"
            >
                <Card className="border-sky-100 bg-sky-50/60">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-sky-800 mb-2">📋 Recommended: Gmail App Password Setup</p>
                                <ol className="text-sm text-sky-700 space-y-1 list-decimal list-inside leading-relaxed">
                                    <li>Go to <strong>myaccount.google.com → Security → 2-Step Verification</strong> and enable it.</li>
                                    <li>Search for <strong>"App Passwords"</strong> and create one (select "Mail" + "Other device").</li>
                                    <li>Copy the 16-character password and paste it into the <strong>Password</strong> field above.</li>
                                    <li>Set Host: <code className="bg-white/80 px-1 rounded">smtp.gmail.com</code>, Port: <code className="bg-white/80 px-1 rounded">587</code>, Encryption: <strong>TLS</strong>.</li>
                                    <li>Click <strong>Save Settings</strong>, then <strong>Test Connection</strong> to verify.</li>
                                </ol>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default EmailSettings;
