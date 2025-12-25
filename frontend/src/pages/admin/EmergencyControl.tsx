import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Unlock, Bell, Phone, ShieldAlert, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const EmergencyControl = () => {
    const [systemLocked, setSystemLocked] = useState(false);
    const [incidentMode, setIncidentMode] = useState(false);

    const handleSystemLock = () => {
        setSystemLocked(!systemLocked);
        toast.success(systemLocked ? 'সিস্টেম আনলক করা হয়েছে' : 'সিস্টেম লক করা হয়েছে', {
            description: systemLocked ? 'ইউজাররা এখন নতুন ইস্যু সাবমিট করতে পারবে' : 'ইউজাররা এখন নতুন ইস্যু সাবমিট করতে পারবে না'
        });
    };

    const handleIncidentMode = () => {
        setIncidentMode(!incidentMode);
        toast.success(incidentMode ? 'Incident Mode বন্ধ করা হয়েছে' : 'Incident Mode চালু করা হয়েছে', {
            description: incidentMode ? 'স্বাভাবিক অপারেশন পুনরায় শুরু' : 'জরুরি প্রোটোকল সক্রিয় করা হয়েছে'
        });
    };

    const handleNotifyAuthority = () => {
        toast.success('সংশ্লিষ্ট কর্তৃপক্ষকে নোটিফিকেশন পাঠানো হয়েছে', {
            description: 'Email এবং SMS পাঠানো হয়েছে'
        });
    };

    const handleEmergencyBroadcast = () => {
        toast.success('জরুরি ঘোষণা সব ইউজারকে পাঠানো হয়েছে', {
            description: 'সব সক্রিয় ইউজার নোটিফিকেশন পাবে'
        });
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                    <span>🚨 জরুরি নিয়ন্ত্রণ কেন্দ্র</span>
                </h1>
                <p className="text-gray-600 mt-1">ক্রিটিক্যাল সিস্টেম কন্ট্রোল এবং জরুরি প্রোটোকল</p>
            </motion.div>

            {/* Warning Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-red-800">⚠️ সতর্কতা</p>
                        <p className="text-sm text-red-700 mt-1">
                            এই পেজের সব অ্যাকশন অত্যন্ত গুরুত্বপূর্ণ এবং সিস্টেমে বড় প্রভাব ফেলতে পারে।
                            শুধুমাত্র জরুরি পরিস্থিতিতে এই নিয়ন্ত্রণগুলো ব্যবহার করুন।
                        </p>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className={`border-2 ${systemLocked ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                {systemLocked ? (
                                    <Lock className="w-8 h-8 text-red-600" />
                                ) : (
                                    <Unlock className="w-8 h-8 text-green-600" />
                                )}
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">সিস্টেম স্ট্যাটাস</h3>
                                    <p className={`text-sm ${systemLocked ? 'text-red-700' : 'text-green-700'}`}>
                                        {systemLocked ? 'লক করা আছে (Locked)' : 'স্বাভাবিক (Normal)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSystemLock}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${systemLocked
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {systemLocked ? '🔓 সিস্টেম আনলক করুন' : '🔒 সিস্টেম লক করুন'}
                        </button>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                            {systemLocked
                                ? 'আনলক করলে ইউজাররা আবার ইস্যু সাবমিট করতে পারবে'
                                : 'লক করলে ইউজাররা নতুন ইস্যু সাবমিট করতে পারবে না'
                            }
                        </p>
                    </CardContent>
                </Card>

                <Card className={`border-2 ${incidentMode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <Power className={`w-8 h-8 ${incidentMode ? 'text-red-600' : 'text-gray-600'}`} />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Incident Mode</h3>
                                    <p className={`text-sm ${incidentMode ? 'text-red-700' : 'text-gray-600'}`}>
                                        {incidentMode ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleIncidentMode}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${incidentMode
                                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                        >
                            {incidentMode ? '⏹️ Incident Mode বন্ধ করুন' : '▶️ Incident Mode চালু করুন'}
                        </button>
                        <p className="text-xs text-gray-600 mt-2 text-center">
                            জরুরি পরিস্থিতিতে সব priority override করে সরাসরি প্রসেস করুন
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Emergency Actions */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">জরুরি অ্যাকশন</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                    onClick={handleNotifyAuthority}
                    className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                    <div className="flex flex-col items-center space-y-3">
                        <Phone className="w-8 h-8" />
                        <div className="text-center">
                            <p className="font-bold">📞 কর্তৃপক্ষকে নোটিফাই করুন</p>
                            <p className="text-xs opacity-90 mt-1">Instant Email + SMS</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={handleEmergencyBroadcast}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                    <div className="flex flex-col items-center space-y-3">
                        <Bell className="w-8 h-8" />
                        <div className="text-center">
                            <p className="font-bold">📢 জরুরি ঘোষণা</p>
                            <p className="text-xs opacity-90 mt-1">সব ইউজারকে পাঠান</p>
                        </div>
                    </div>
                </button>

                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                    onClick={() => toast.info('আগামী আপডেটে উপলব্ধ হবে')}
                >
                    <div className="flex flex-col items-center space-y-3">
                        <AlertTriangle className="w-8 h-8" />
                        <div className="text-center">
                            <p className="font-bold">⚡ Manual Escalation</p>
                            <p className="text-xs opacity-90 mt-1">Priority Override</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Emergency Contacts */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">জরুরি যোগাযোগ</h2>
                <Card>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-semibold text-gray-800">Vice Chancellor</p>
                                <p className="text-sm text-gray-600 mt-1">vc@icst.edu</p>
                                <p className="text-sm text-gray-600">+880 1XXX-XXXXXX</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-semibold text-gray-800">Registrar</p>
                                <p className="text-sm text-gray-600 mt-1">registrar@icst.edu</p>
                                <p className="text-sm text-gray-600">+880 1XXX-XXXXXX</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-semibold text-gray-800">IT Support</p>
                                <p className="text-sm text-gray-600 mt-1">support@icst.edu</p>
                                <p className="text-sm text-gray-600">+880 1XXX-XXXXXX</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EmergencyControl;
