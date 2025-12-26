import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Trash2, Edit } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Issue {
    _id: string;
    title: string;
    description: string;
    status: string;
    category: string;
    votes: number | { good: number; bad: number };
    createdAt: string;
}

const ManageIssues = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const { data } = await api.get('/issues');
            setIssues(data);
        } catch (error) {
            toast.error('ইস্যু লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('আপনি কি নিশ্চিত এই ইস্যু মুছে ফেলতে চান?')) return;

        try {
            await api.delete(`/issues/${id}`);
            toast.success('ইস্যু মুছে ফেলা হয়েছে');
            fetchIssues();
        } catch (error) {
            toast.error('ইস্যু মুছতে সমস্যা হয়েছে');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/issues/${id}`, { status: newStatus });
            toast.success('স্ট্যাটাস আপডেট হয়েছে');
            fetchIssues();
        } catch (error) {
            toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">ইস্যু ম্যানেজমেন্ট</h1>
                <Link
                    to="/admin/add-issue"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    নতুন ইস্যু যোগ করুন
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : issues.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        কোন ইস্যু পাওয়া যায়নি
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <Card key={issue._id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                                        <p className="text-gray-600 mb-4 line-clamp-2">{issue.description}</p>

                                        <div className="flex gap-4 items-center text-sm">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full">{issue.category}</span>
                                            <select
                                                value={issue.status}
                                                onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                                className="px-3 py-1 border rounded-lg"
                                            >
                                                <option value="pending">পেন্ডিং</option>
                                                <option value="in-progress">প্রসেসিং</option>
                                                <option value="resolved">সমাধান</option>
                                            </select>
                                            <span className="text-gray-500">👍 {typeof issue.votes === 'number' ? issue.votes : (issue.votes?.good || 0)}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/issues/${issue._id}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(issue._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageIssues;
