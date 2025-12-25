import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

const UserSubmitIssue = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'academic',
        priority: 'medium',
        image: null as File | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData({ ...formData, image: null });
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';

            // Upload image if exists
            if (formData.image) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.image);
                const { data } = await api.post('/upload', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = data.imageUrl;
            }

            // Submit issue
            await api.post('/issues', {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                priority: formData.priority,
                imageUrl
            });

            toast.success('ইস্যু সফলভাবে সাবমিট হয়েছে! (Issue submitted successfully!)');
            navigate('/user/my-issues');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'সাবমিট করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 mb-2">নতুন ইস্যু সাবমিট করুন</h1>
                <p className="text-gray-600">Submit New Issue</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            শিরোনাম <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="ইস্যুর শিরোনাম লিখুন"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            বর্ণনা <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={6}
                            placeholder="ইস্যুর বিস্তারিত বর্ণনা দিন..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Category and Priority */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ক্যাটাগরি <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            >
                                <option value="academic">একাডেমিক (Academic)</option>
                                <option value="infrastructure">অবকাঠামো (Infrastructure)</option>
                                <option value="facilities">সুবিধা (Facilities)</option>
                                <option value="administrative">প্রশাসনিক (Administrative)</option>
                                <option value="other">অন্যান্য (Other)</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                প্রাধান্য <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            >
                                <option value="low">নিম্ন (Low)</option>
                                <option value="medium">মধ্যম (Medium)</option>
                                <option value="high">উচ্চ (High)</option>
                            </select>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ছবি আপলোড করুন (ঐচ্ছিক)
                        </label>

                        {!imagePreview ? (
                            <label className="block cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-sky-500 hover:bg-sky-50 transition-all">
                                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-600">ক্লিক করে ছবি নির্বাচন করুন</p>
                                    <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
                    >
                        <Send className="w-5 h-5" />
                        <span>{loading ? 'সাবমিট হচ্ছে...' : 'ইস্যু সাবমিট করুন'}</span>
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default UserSubmitIssue;
