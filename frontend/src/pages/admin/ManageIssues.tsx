import { Link } from 'react-router-dom';
import { Eye, Trash2, Edit } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();

    const { data: issues = [] } = useQuery<Issue[]>({
        queryKey: ['manageIssues'],
        queryFn: async () => {
            const { data } = await api.get('/admin/issues');
            return data;
        },
        staleTime: 30000,
        gcTime: 600000,
        refetchInterval: 10000,
        placeholderData: (prev) => prev ?? [],
    });

    const handleDelete = async (id: string) => {
        if (!confirm('আপনি কি নিশ্চিত এই ইস্যু মুছে ফেলতে চান?')) return;

        try {
            await api.delete(`/issues/${id}`);
            toast.success('ইস্যু মুছে ফেলা হয়েছে');
            queryClient.invalidateQueries({ queryKey: ['manageIssues'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        } catch (error) {
            toast.error('ইস্যু মুছতে সমস্যা হয়েছে');
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/issues/${id}`, { status: newStatus });
            toast.success('স্ট্যাটাস আপডেট হয়েছে');
            queryClient.invalidateQueries({ queryKey: ['manageIssues'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        } catch (error) {
            toast.error('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
        }
    };

    return (
        <div className="p-6 text-slate-800 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">ইস্যু ম্যানেজমেন্ট</h1>
                    <p className="text-slate-600 mt-1">সব ইস্যু পরিচালনা করুন এবং স্ট্যাটাস আপডেট করুন</p>
                </div>
                <Link
                    to="/admin/add-issue"
                    className="px-6 py-3 bg-gradient-to-r from-primary to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all font-medium flex items-center gap-2"
                >
                    <Edit size={18} />
                    নতুন ইস্যু যোগ করুন
                </Link>
            </div>

            {issues.length === 0 ? (
                <div className="bg-white p-12 text-center border border-slate-200 rounded-xl shadow-sm">
                    <p className="text-slate-500 text-lg">কোন ইস্যু পাওয়া যায়নি</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {issues.map((issue) => (
                        <div key={issue._id} className="bg-white shadow-sm rounded-xl p-6 border border-slate-200 hover:shadow-md hover:border-primary/20 transition-all group">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{issue.title}</h3>
                                        <span className="text-sm text-slate-500 whitespace-nowrap ml-4">
                                            {new Date(issue.createdAt).toLocaleDateString('bn-BD')}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mb-4 line-clamp-2">{issue.description}</p>

                                    <div className="flex flex-wrap gap-4 items-center text-sm">
                                        <span className="px-3 py-1 bg-cyan-50 rounded-full border border-cyan-100 text-cyan-700">{issue.category}</span>

                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-600">স্ট্যাটাস:</span>
                                            <select
                                                value={issue.status}
                                                onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-primary/50"
                                            >
                                                <option value="pending" className="bg-white">পেন্ডিং</option>
                                                <option value="in-progress" className="bg-white">প্রসেসিং</option>
                                                <option value="resolved" className="bg-white">সমাধান</option>
                                            </select>
                                        </div>

                                        <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                                            👍 <span className="text-slate-800 font-medium">{typeof issue.votes === 'number' ? issue.votes : (issue.votes?.good || 0)}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 self-start md:self-center">
                                    <Link
                                        to={`/issues/${issue._id}`}
                                        className="p-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-colors border border-blue-500/10"
                                        title="বিস্তারিত দেখুন"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(issue._id)}
                                        className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors border border-red-500/10"
                                        title="মুছে ফেলুন"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageIssues;
