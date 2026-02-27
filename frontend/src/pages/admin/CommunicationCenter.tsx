import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Mail, Users, Search, X, CheckCheck, Plus, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface UserItem {
    id: string;
    name: string;
    email: string;
    department: string;
    roll: string;
    role: string;
}

type TabType = 'email' | 'push';
type FilterMode = 'manual' | 'user' | 'department' | 'all';

const CommunicationCenter = () => {
    const [activeTab, setActiveTab] = useState<TabType>('email');

    // Email state
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [emailFilterMode, setEmailFilterMode] = useState<FilterMode>('user');
    const [emailSelectedUsers, setEmailSelectedUsers] = useState<string[]>([]);
    const [emailSelectedDept, setEmailSelectedDept] = useState('');
    const [manualEmails, setManualEmails] = useState('');
    const [emailSearch, setEmailSearch] = useState('');
    const [emailSending, setEmailSending] = useState(false);

    // Push state
    const [pushTitle, setPushTitle] = useState('');
    const [pushBody, setPushBody] = useState('');
    const [pushUrl, setPushUrl] = useState('');
    const [pushFilterMode, setPushFilterMode] = useState<FilterMode>('all');
    const [pushSelectedUsers, setPushSelectedUsers] = useState<string[]>([]);
    const [pushSelectedDept, setPushSelectedDept] = useState('');
    const [pushSearch, setPushSearch] = useState('');
    const [pushSending, setPushSending] = useState(false);

    // Fetch all users
    const { data: allUsers = [] } = useQuery<UserItem[]>({
        queryKey: ['admin-all-users'],
        queryFn: async () => {
            const { data } = await api.get('/admin/all-users');
            return data;
        },
        staleTime: 60000,
    });

    const departments = useMemo(() =>
        [...new Set(allUsers.map(u => u.department).filter(Boolean))].sort()
        , [allUsers]);

    // Email: filtered users
    const emailFilteredUsers = useMemo(() => {
        let list = allUsers;
        if (emailSearch) {
            const s = emailSearch.toLowerCase();
            list = list.filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.roll?.toLowerCase().includes(s));
        }
        return list;
    }, [allUsers, emailSearch]);

    // Push: filtered users
    const pushFilteredUsers = useMemo(() => {
        let list = allUsers;
        if (pushSearch) {
            const s = pushSearch.toLowerCase();
            list = list.filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.roll?.toLowerCase().includes(s));
        }
        return list;
    }, [allUsers, pushSearch]);

    // Toggle user selection
    const toggleUser = (userId: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    // Select all visible
    const selectAll = (filtered: UserItem[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList(filtered.map(u => u.id));
    };

    // Send email handler
    const handleSendEmail = async () => {
        if (!emailSubject.trim() || !emailBody.trim()) {
            toast.error('সাবজেক্ট এবং মেইল বডি দিন');
            return;
        }

        let recipients: string[] = [];
        let manualEmailList: string[] = [];

        if (emailFilterMode === 'user') {
            if (emailSelectedUsers.length === 0) { toast.error('অন্তত একজন ইউজার সিলেক্ট করুন'); return; }
            recipients = emailSelectedUsers;
        } else if (emailFilterMode === 'department') {
            if (!emailSelectedDept) { toast.error('ডিপার্টমেন্ট সিলেক্ট করুন'); return; }
            recipients = allUsers.filter(u => u.department === emailSelectedDept).map(u => u.id);
        } else if (emailFilterMode === 'all') {
            recipients = allUsers.map(u => u.id);
        } else if (emailFilterMode === 'manual') {
            manualEmailList = manualEmails.split(/[,;\n]+/).map(e => e.trim()).filter(e => e.includes('@'));
            if (manualEmailList.length === 0) { toast.error('অন্তত একটি ইমেইল দিন'); return; }
        }

        setEmailSending(true);

        // Watchdog timer: if Vercel kills the request at 10s, don't leave the UI hanging
        const watchdog = setTimeout(() => {
            setEmailSending(false);
            toast.info('ইমেইল প্রসেসিং ব্যাকগ্রাউন্ডে চলছে। ফলাফল কিছুক্ষণ পর দেখতে পাবেন।', { duration: 6000 });
        }, 11000); // 11 seconds (slightly more than Vercel's 10s limit)

        try {
            const { data } = await api.post('/admin/send-email', {
                recipients,
                subject: emailSubject,
                body: emailBody,
                manualEmails: manualEmailList
            });
            clearTimeout(watchdog);
            toast.success(data.message || '✅ ইমেইল পাঠানো শুরু হয়েছে');
            setEmailSubject(''); setEmailBody(''); setEmailSelectedUsers([]); setManualEmails('');
        } catch (err: any) {
            clearTimeout(watchdog);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'ইমেইল পাঠাতে ব্যর্থ';
            toast.error(errMsg, { duration: 5000 });
        } finally {
            setEmailSending(false);
        }
    };

    // Send push handler
    const handleSendPush = async () => {
        if (!pushTitle.trim() || !pushBody.trim()) {
            toast.error('টাইটেল এবং মেসেজ দিন');
            return;
        }

        let recipients: string[] | string = [];

        if (pushFilterMode === 'all') {
            recipients = 'all';
        } else if (pushFilterMode === 'user') {
            if (pushSelectedUsers.length === 0) { toast.error('অন্তত একজন ইউজার সিলেক্ট করুন'); return; }
            recipients = pushSelectedUsers;
        } else if (pushFilterMode === 'department') {
            if (!pushSelectedDept) { toast.error('ডিপার্টমেন্ট সিলেক্ট করুন'); return; }
            recipients = allUsers.filter(u => u.department === pushSelectedDept).map(u => u.id);
        }

        setPushSending(true);
        try {
            const { data } = await api.post('/admin/send-push', {
                recipients,
                title: pushTitle,
                body: pushBody,
                url: pushUrl || '/user/dashboard'
            });
            toast.success(`🔔 ${data.success} জনকে পুশ নোটিফিকেশন পাঠানো হয়েছে`);
            setPushTitle(''); setPushBody(''); setPushUrl(''); setPushSelectedUsers([]);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'পুশ নোটিফিকেশন পাঠাতে ব্যর্থ');
        } finally {
            setPushSending(false);
        }
    };

    // Reusable user selector component
    const UserSelector = ({
        filterMode, setFilterMode, selectedUsers, setSelectedUsers, selectedDept, setSelectedDept, search, setSearch, filteredUsers, showManual = false, manualValue = '', setManualValue = (_v: string) => { }
    }: {
        filterMode: FilterMode; setFilterMode: (m: FilterMode) => void;
        selectedUsers: string[]; setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
        selectedDept: string; setSelectedDept: (d: string) => void;
        search: string; setSearch: (s: string) => void;
        filteredUsers: UserItem[];
        showManual?: boolean; manualValue?: string; setManualValue?: (v: string) => void;
    }) => (
        <div className="space-y-3">
            {/* Filter Mode Tabs */}
            <div className="flex flex-wrap gap-2">
                {showManual && (
                    <button onClick={() => setFilterMode('manual')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterMode === 'manual' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        <Plus className="w-3 h-3 inline mr-1" />Manual
                    </button>
                )}
                <button onClick={() => setFilterMode('user')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterMode === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Users className="w-3 h-3 inline mr-1" />User Select
                </button>
                <button onClick={() => setFilterMode('department')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterMode === 'department' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Filter className="w-3 h-3 inline mr-1" />Department
                </button>
                <button onClick={() => setFilterMode('all')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterMode === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <CheckCheck className="w-3 h-3 inline mr-1" />All Users
                </button>
            </div>

            {/* Manual Email Input */}
            {filterMode === 'manual' && showManual && (
                <textarea
                    value={manualValue}
                    onChange={(e) => setManualValue(e.target.value)}
                    placeholder="ইমেইল গুলো লিখুন (কমা বা নতুন লাইনে আলাদা করুন)&#10;example1@mail.com, example2@mail.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                />
            )}

            {/* Department Select */}
            {filterMode === 'department' && (
                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                >
                    <option value="">ডিপার্টমেন্ট সিলেক্ট করুন</option>
                    {departments.map(d => (
                        <option key={d} value={d}>{d} ({allUsers.filter(u => u.department === d).length} জন)</option>
                    ))}
                </select>
            )}

            {/* User Selector */}
            {filterMode === 'user' && (
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="নাম, ইমেইল, বা রোল দিয়ে খুঁজুন..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <span>{selectedUsers.length} জন সিলেক্টেড</span>
                        <div className="flex gap-2">
                            <button onClick={() => selectAll(filteredUsers, setSelectedUsers)} className="text-purple-600 hover:underline font-medium">সব সিলেক্ট</button>
                            <button onClick={() => setSelectedUsers([])} className="text-red-500 hover:underline font-medium">সব বাদ</button>
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                        {filteredUsers.map(user => (
                            <label key={user.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-purple-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleUser(user.id, selectedUsers, setSelectedUsers)}
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{user.name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email} • {user.department} • {user.roll}</p>
                                </div>
                            </label>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-4">কোনো ইউজার পাওয়া যায়নি</p>
                        )}
                    </div>
                </div>
            )}

            {/* All Users info */}
            {filterMode === 'all' && (
                <div className="px-4 py-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-700 font-medium">সকল {allUsers.length} জন ইউজারকে পাঠানো হবে</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">📡 যোগাযোগ কেন্দ্র</h1>
                <p className="text-gray-600 mt-1">ইউজারদের ইমেইল এবং পুশ নোটিফিকেশন পাঠান</p>
            </motion.div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('email')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'email' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Mail className="w-5 h-5" /> ইমেইল পাঠান
                </button>
                <button
                    onClick={() => setActiveTab('push')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'push' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <Bell className="w-5 h-5" /> পুশ নোটিফিকেশন
                </button>
            </div>

            {/* Email Tab */}
            {activeTab === 'email' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-2 text-blue-600 mb-2">
                                <Mail className="w-5 h-5" />
                                <h2 className="text-lg font-bold">কাস্টম ইমেইল পাঠান</h2>
                            </div>

                            {/* Recipient Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">প্রাপক নির্বাচন করুন</label>
                                <UserSelector
                                    filterMode={emailFilterMode} setFilterMode={setEmailFilterMode}
                                    selectedUsers={emailSelectedUsers} setSelectedUsers={setEmailSelectedUsers}
                                    selectedDept={emailSelectedDept} setSelectedDept={setEmailSelectedDept}
                                    search={emailSearch} setSearch={setEmailSearch}
                                    filteredUsers={emailFilteredUsers}
                                    showManual={true} manualValue={manualEmails} setManualValue={setManualEmails}
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">সাবজেক্ট</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="ইমেইলের সাবজেক্ট লিখুন..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">মেইল বডি</label>
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="ইমেইলের বিষয়বস্তু লিখুন..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                    rows={6}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendEmail}
                                disabled={emailSending}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-[0.98]"
                            >
                                {emailSending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        পাঠানো হচ্ছে...
                                    </span>
                                ) : (
                                    <><Send className="w-5 h-5" /> ইমেইল পাঠান</>
                                )}
                            </button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Push Tab */}
            {activeTab === 'push' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6 space-y-5">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <Bell className="w-5 h-5" />
                                <h2 className="text-lg font-bold">পুশ নোটিফিকেশন পাঠান</h2>
                            </div>

                            {/* Recipient Selector */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">প্রাপক নির্বাচন করুন</label>
                                <UserSelector
                                    filterMode={pushFilterMode} setFilterMode={setPushFilterMode}
                                    selectedUsers={pushSelectedUsers} setSelectedUsers={setPushSelectedUsers}
                                    selectedDept={pushSelectedDept} setSelectedDept={setPushSelectedDept}
                                    search={pushSearch} setSearch={setPushSearch}
                                    filteredUsers={pushFilteredUsers}
                                />
                            </div>

                            {/* Push Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">নোটিফিকেশন টাইটেল</label>
                                <input
                                    type="text"
                                    value={pushTitle}
                                    onChange={(e) => setPushTitle(e.target.value)}
                                    placeholder="নোটিফিকেশনের শিরোনাম..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Push Body */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">মেসেজ</label>
                                <textarea
                                    value={pushBody}
                                    onChange={(e) => setPushBody(e.target.value)}
                                    placeholder="নোটিফিকেশনের মেসেজ লিখুন..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                                    rows={4}
                                />
                            </div>

                            {/* URL (optional) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">লিংক (ঐচ্ছিক)</label>
                                <input
                                    type="text"
                                    value={pushUrl}
                                    onChange={(e) => setPushUrl(e.target.value)}
                                    placeholder="/user/dashboard (ক্লিক করলে কোথায় যাবে)"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendPush}
                                disabled={pushSending}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 active:scale-[0.98]"
                            >
                                {pushSending ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        পাঠানো হচ্ছে...
                                    </span>
                                ) : (
                                    <><Bell className="w-5 h-5" /> পুশ নোটিফিকেশন পাঠান</>
                                )}
                            </button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default CommunicationCenter;
