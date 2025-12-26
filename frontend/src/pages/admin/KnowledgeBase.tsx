import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';
import { toast } from 'sonner';

interface Article {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    views: number;
    helpful: number;
    createdAt: string;
    updatedAt: string;
}

const KnowledgeBase = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'FAQ',
        tags: ''
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const { data } = await api.get('/admin/knowledge-base');
            setArticles(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const articleData = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            if (editingArticle) {
                await api.put(`/admin/knowledge-base/${editingArticle._id}`, articleData);
                toast.success('Article updated successfully');
            } else {
                await api.post('/admin/knowledge-base', articleData);
                toast.success('Article created successfully');
            }
            setShowAddModal(false);
            setEditingArticle(null);
            setFormData({ title: '', content: '', category: 'FAQ', tags: '' });
            fetchArticles();
        } catch (error) {
            toast.error('Failed to save article');
        }
    };

    const handleEdit = (article: Article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title,
            content: article.content,
            category: article.category,
            tags: article.tags.join(', ')
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            await api.delete(`/admin/knowledge-base/${id}`);
            toast.success('Article deleted');
            fetchArticles();
        } catch (error) {
            toast.error('Failed to delete article');
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">📚 Knowledge Base</h1>
                        <p className="text-gray-600 mt-1">সাধারণ সমস্যার সমাধান এবং গাইড</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowAddModal(true);
                            setEditingArticle(null);
                            setFormData({ title: '', content: '', category: 'FAQ', tags: '' });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Article
                    </button>
                </div>
            </motion.div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="all">All Categories</option>
                            <option value="FAQ">FAQ</option>
                            <option value="Guide">Guide</option>
                            <option value="Tutorial">Tutorial</option>
                            <option value="Policy">Policy</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Articles List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            ) : filteredArticles.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        No articles found
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles.map((article) => (
                        <Card key={article._id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <BookOpen className="w-6 h-6 text-sky-600" />
                                    <span className="px-2 py-1 text-xs bg-sky-100 text-sky-800 rounded-full">
                                        {article.category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{article.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{article.content}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {article.tags.map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {article.views} views
                                    </span>
                                    <span>👍 {article.helpful}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(article)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article._id)}
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardContent className="p-6">
                            <h2 className="text-2xl font-bold mb-4">
                                {editingArticle ? 'Edit Article' : 'Add New Article'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="FAQ">FAQ</option>
                                        <option value="Guide">Guide</option>
                                        <option value="Tutorial">Tutorial</option>
                                        <option value="Policy">Policy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Content
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="howto, library, wifi"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditingArticle(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                                    >
                                        {editingArticle ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default KnowledgeBase;
