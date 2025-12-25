import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, MapPin, Tag } from 'lucide-react';
import { ISSUE_CATEGORIES, FORMSPREE_ENDPOINT } from '@/config/constants';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

const Submit = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    evidence: '',
    contactEmail: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/issues', formData);

      toast({
        title: "Success!",
        description: "আপনার সমস্যা সফলভাবে জমা হয়েছে। শীঘ্রই যাচাই করা হবে।",
      });
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        evidence: '',
        contactEmail: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "সমস্যা জমা দিতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-sky-900">
            সমস্যা আছে? জানান এখনই!
          </h1>
          <p className="text-sky-800 text-lg">
            ক্যাম্পাসে কোনো অসুবিধা দেখছেন? আমাদের জানান। আমরা দ্রুত সমাধানের জন্য তৎপর আছি।
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                সমস্যার শিরোনাম <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="সমস্যার একটি সংক্ষিপ্ত শিরোনাম লিখুন"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Tag className="inline mr-2" size={16} />
                বিভাগ <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">একটি বিভাগ নির্বাচন করুন</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="inline mr-2" size={16} />
                স্থান <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="সমস্যার স্থান (উদাহরণ: Building A, Room 301)"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                বিস্তারিত বর্ণনা <span className="text-destructive">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="সমস্যার বিস্তারিত বর্ণনা দিন। কখন এবং কীভাবে সমস্যাটি শুরু হয়েছে তা উল্লেখ করুন।"
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ন্যূনতম ৫০টি অক্ষর প্রয়োজন
              </p>
            </div>

            {/* Evidence Links */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Upload className="inline mr-2" size={16} />
                প্রমাণপত্রের লিংক (ঐচ্ছিক)
              </label>
              <input
                type="url"
                value={formData.evidence}
                onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                placeholder="ছবি বা ডকুমেন্টের লিংক (Google Drive, Imgur ইত্যাদি)"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ইমেইল ঠিকানা <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                আপডেটের জন্য আমরা আপনার সাথে যোগাযোগ করব
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-primary-foreground rounded-lg font-semibold hover:shadow-2xl hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>জমা হচ্ছে...</>
              ) : (
                <>
                  <Send size={20} />
                  সমস্যা জমা দিন
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              আপনার সমস্যা জমা হওয়ার পর ২৪-৪৮ ঘণ্টার মধ্যে আমরা যাচাই করে প্রকাশ করব। ধৈর্য ধরুন, আপনার কণ্ঠস্বর শোনা হবে!
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Submit;
