import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, FileText, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '@/services/api';

const BulkEmail = () => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipients, setRecipients] = useState<'all' | 'students' | 'custom'>('all');
    const [customEmails, setCustomEmails] = useState('');
    const [preview, setPreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [testingSmtp, setTestingSmtp] = useState(false);
    const [smtpStatus, setSmtpStatus] = useState<{
        success?: boolean;
        message?: string;
        diagnosis?: string;
        lastChecked?: string;
    } | null>(null);

    const handleSend = async () => {
        if (!subject || !body) {
            toast.error('Subject এবং Message পূরণ করুন');
            return;
        }

        // Validate custom emails if custom mode
        if (recipients === 'custom') {
            if (!customEmails.trim()) {
                toast.error('Email addresses দিন');
                return;
            }

            const emails = customEmails.split(',').map(e => e.trim()).filter(e => e);
            const invalidEmails = emails.filter(email => !email.includes('@'));

            if (invalidEmails.length > 0) {
                toast.error('Invalid email addresses পাওয়া গেছে', {
                    description: 'সব email addresses ঠিক আছে কিনা check করুন'
                });
                return;
            }
        }

        setSending(true);

        try {
            const response = await api.post('/admin/send-bulk-email', {
                subject,
                body,
                recipients,
                customEmails: recipients === 'custom' ? customEmails : undefined,
            });

            toast.success('✅ ব্রডকাস্ট সফল!', {
                description: `${response.data.queued} users কে email পাঠানো হচ্ছে`,
            });

            // Reset form
            setSubject('');
            setBody('');
            setCustomEmails('');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error('Failed to send', {
                description: error.response?.data?.message || 'Please try again',
            });
        } finally {
            setSending(false);
        }
    };

    const testConnection = async () => {
        setTestingSmtp(true);
        setSmtpStatus(null);
        try {
            const response = await api.post('/admin/test-email');
            setSmtpStatus({
                success: true,
                message: response.data.message,
                lastChecked: new Date().toLocaleTimeString()
            });
            toast.success('SMTP Connection Successful');
        } catch (err: any) {
            const errorData = err.response?.data;
            setSmtpStatus({
                success: false,
                message: errorData?.error || 'Unknown Error',
                diagnosis: errorData?.diagnosis,
                lastChecked: new Date().toLocaleTimeString()
            });
            toast.error('SMTP Connection Failed');
        } finally {
            setTestingSmtp(false);
        }
    };

    const previewHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 40px; background: #f4f4f4;">
    <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #fff; margin: 0;">📢 ${subject || 'Subject Here'}</h1>
        </div>
        <div style="line-height: 1.6; color: #333; white-space: pre-wrap;">
${body || 'Email body will appear here...'}
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2025 ICST Issue Portal</p>
        </div>
    </div>
</body>
</html>
  `;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold text-gray-800">📧 Bulk Email System</h1>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
                    <p className="text-gray-600">সব users কে একসাথে email পাঠান</p>

                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${!smtpStatus ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                smtpStatus.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${!smtpStatus ? 'bg-gray-400' :
                                    smtpStatus.success ? 'bg-green-500' : 'bg-red-500'
                                }`} />
                            SMTP: {!smtpStatus ? 'Not Tested' : smtpStatus.success ? 'Connected' : 'Error'}
                            {smtpStatus?.lastChecked && <span className="text-[10px] opacity-60 ml-1">at {smtpStatus.lastChecked}</span>}
                        </div>

                        <button
                            onClick={testConnection}
                            disabled={testingSmtp}
                            className="text-xs font-medium text-sky-600 hover:text-sky-700 underline flex items-center gap-1 disabled:opacity-50"
                        >
                            {testingSmtp ? 'Testing...' : 'Test Connection'}
                        </button>
                    </div>
                </div>
            </motion.div>

            {smtpStatus && !smtpStatus.success && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"
                >
                    <div className="flex items-start">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-800">SMTP Configuration Problem Detected</h3>
                            <p className="text-xs text-red-700 mt-1"><strong>Error:</strong> {smtpStatus.message}</p>
                            {smtpStatus.diagnosis && (
                                <p className="text-xs text-red-600 mt-2 bg-white/50 p-2 rounded border border-red-100">
                                    💡 <strong>Fix:</strong> {smtpStatus.diagnosis}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compose Section */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Compose Email</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Recipients */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Recipients</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setRecipients('all')}
                                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${recipients === 'all'
                                            ? 'bg-sky-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Users className="w-4 h-4 inline mr-2" />
                                        All Users
                                    </button>
                                    <button
                                        onClick={() => setRecipients('students')}
                                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${recipients === 'students'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4 inline mr-2" />
                                        Students Only
                                    </button>
                                    <button
                                        onClick={() => setRecipients('custom')}
                                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${recipients === 'custom'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <Send className="w-4 h-4 inline mr-2" />
                                        Custom
                                    </button>
                                </div>
                            </div>

                            {/* Custom Email Input - Show only when custom is selected */}
                            {recipients === 'custom' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <label className="block text-sm font-medium mb-2 text-green-800">
                                        📧 Custom Email Addresses
                                    </label>
                                    <textarea
                                        value={customEmails}
                                        onChange={(e) => setCustomEmails(e.target.value)}
                                        rows={4}
                                        placeholder="email1@example.com, email2@example.com, email3@example.com..."
                                        className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                                    />
                                    <p className="text-xs text-green-700 mt-2">
                                        💡 Multiple emails দিতে comma (,) দিয়ে আলাদা করুন। Example: user1@gmail.com, user2@gmail.com
                                    </p>
                                </div>
                            )}

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    placeholder="আপনার মেসেজ লিখুন... (Supports Bangla & English)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Plain text. Automatic email template will be applied.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !subject || !body}
                                    className="flex-1 bg-gradient-to-r from-sky-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                        'পাঠানো হচ্ছে...'
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 inline mr-2" />
                                            Send Broadcast
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setPreview(!preview)}
                                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                                >
                                    <Eye className="w-5 h-5 inline mr-2" />
                                    {preview ? 'Hide' : 'Preview'}
                                </button>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ এই email selected সব users এর কাছে পাঠানো হবে। সাবধানে পাঠান!
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-4">Email Preview</h2>

                        {preview ? (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <iframe
                                    srcDoc={previewHTML}
                                    className="w-full h-[600px] bg-gray-50"
                                    title="Email Preview"
                                />
                            </div>
                        ) : (
                            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Preview বন্ধ আছে</p>
                                    <p className="text-sm text-gray-400 mt-1">Click "Preview" to see email</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Email History Placeholder */}
            <Card className="mt-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Broadcasts</h2>
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Email history feature coming soon...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BulkEmail;
