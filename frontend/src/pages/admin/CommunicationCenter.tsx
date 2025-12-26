import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Users, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/services/api';

interface Message {
    id: string;
    from: string;
    to: string;
    subject: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

const CommunicationCenter = () => {
    const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'broadcast' | 'templates'>('inbox');
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (activeTab === 'inbox') {
            fetchMessages();
        }
    }, [activeTab]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get('/messages');
            // Backend returns date string, need to parse to Date object for UI
            const parsed = data.map((msg: any) => ({
                ...msg,
                id: msg._id,
                timestamp: new Date(msg.createdAt),
                from: msg.from?.name || 'Unknown'
            }));
            setMessages(parsed);
        } catch (error) {
            console.error(error);
            toast.error('মেসেজ লোড করা যায়নি');
        }
    };

    const [composeData, setComposeData] = useState({
        to: '',
        subject: '',
        message: ''
    });

    const [broadcastData, setBroadcastData] = useState({
        title: '',
        message: '',
        target: 'all' as 'all' | 'students' | 'specific_dept'
    });

    const templates = [
        {
            id: '1',
            name: 'Issue Received Confirmation',
            content: 'আপনার ইস্যু গৃহীত হয়েছে এবং শীঘ্রই সমাধানের জন্য প্রক্রিয়া শুরু হবে।'
        },
        {
            id: '2',
            name: 'Issue Resolved',
            content: 'আপনার ইস্যু সফলভাবে সমাধান করা হয়েছে। আপনার সহযোগিতার জন্য ধন্যবাদ।'
        },
        {
            id: '3',
            name: 'More Information Needed',
            content: 'আপনার ইস্যু সমাধানের জন্য আরো তথ্য প্রয়োজন। অনুগ্রহ করে বিস্তারিত প্রদান করুন।'
        },
    ];

    const handleSendMessage = async () => {
        if (!composeData.to || !composeData.subject || !composeData.message) {
            toast.error('সব ফিল্ড পূরণ করুন');
            return;
        }

        try {
            await api.post('/messages', {
                // to: composeData.to, // For now ignoring 'to' mapping logic in this demo
                subject: composeData.subject,
                message: composeData.message,
                type: 'direct'
            });
            toast.success('মেসেজ পাঠানো হয়েছে');
            setComposeData({ to: '', subject: '', message: '' });
            setActiveTab('inbox');
        } catch (error) {
            toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastData.title || !broadcastData.message) {
            toast.error('Title এবং Message পূরণ করুন');
            return;
        }

        try {
            await api.post('/admin/send-bulk-email', {
                title: broadcastData.title,
                message: broadcastData.message,
                target: broadcastData.target
            });
            toast.success('ব্রডকাস্ট সফলভাবে পাঠানো হয়েছে');
            setBroadcastData({ title: '', message: '', target: 'all' });
        } catch (error) {
            toast.error('ব্রডকাস্ট পাঠাতে সমস্যা হয়েছে');
        }
    };

    const applyTemplate = (template: typeof templates[0]) => {
        setComposeData({
            ...composeData,
            message: template.content
        });
        setActiveTab('compose');
        toast.success('Template লোড করা হয়েছে');
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800">💬 Communication Center</h1>
                <p className="text-gray-600 mt-1">ইউজার এবং স্টাফ যোগাযোগ</p>
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center space-x-2 mb-6 border-b border-gray-200">
                {[
                    { id: 'inbox' as const, label: 'Inbox', icon: MessageSquare },
                    { id: 'compose' as const, label: 'Compose', icon: Send },
                    { id: 'broadcast' as const, label: 'Broadcast', icon: Users },
                    { id: 'templates' as const, label: 'Templates', icon: FileText },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-sky-600 text-sky-600'
                                : 'border-transparent text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Inbox Tab */}
            {activeTab === 'inbox' && (
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">কোন মেসেজ নেই</p>
                            </CardContent>
                        </Card>
                    ) : (
                        messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Card className={`hover:shadow-md transition-shadow cursor-pointer ${!message.read ? 'bg-sky-50' : ''}`}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <p className="font-semibold text-gray-800">{message.from}</p>
                                                    {!message.read && (
                                                        <span className="px-2 py-0.5 bg-sky-600 text-white text-xs font-medium rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-medium text-gray-700 mb-1">{message.subject}</p>
                                                <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {message.timestamp.toLocaleString('bn-BD')}
                                                </p>
                                            </div>
                                            <button className="ml-4 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-sm font-medium transition-colors">
                                                Reply
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Compose Tab */}
            {activeTab === 'compose' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">To (Roll/Email)</label>
                                <input
                                    type="text"
                                    value={composeData.to}
                                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="2021-1-60-100 or email@icst.edu"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={composeData.subject}
                                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="Message subject"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    value={composeData.message}
                                    onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="আপনার মেসেজ লিখুন..."
                                />
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                    <span>পাঠান</span>
                                </button>
                                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                    <span>Attach File</span>
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Broadcast Tab */}
            {activeTab === 'broadcast' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                ⚠️ ব্রডকাস্ট মেসেজ সব selected ইউজারকে পাঠানো হবে। সাবধানে ব্যবহার করুন।
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                                <select
                                    value={broadcastData.target}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, target: e.target.value as 'all' | 'students' | 'specific_dept' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="all">সব ইউজার</option>
                                    <option value="students">শুধু Students</option>
                                    <option value="specific_dept">Specific Department</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Title</label>
                                <input
                                    type="text"
                                    value={broadcastData.title}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="গুরুত্বপূর্ণ ঘোষণা"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    value={broadcastData.message}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                    placeholder="ব্রডকাস্ট মেসেজ..."
                                />
                            </div>

                            <button
                                onClick={handleBroadcast}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                            >
                                <Users className="w-5 h-5" />
                                <span>ব্রডকাস্ট পাঠান</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg text-gray-800 mb-3">{template.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{template.content}</p>
                                    <button
                                        onClick={() => applyTemplate(template)}
                                        className="w-full bg-sky-100 hover:bg-sky-200 text-sky-700 py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Use Template
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunicationCenter;
