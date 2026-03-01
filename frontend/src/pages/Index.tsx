import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import IssueCard from "@/components/IssueCard";
import { IssueCardSkeleton } from "@/components/IssueCardSkeleton";
import { TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface IssueSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: { good: number; bad: number };
  views: number;
  location: string;
  date: string;
  [key: string]: unknown;
}

const Index = () => {
  const [latestIssues, setLatestIssues] = useState<IssueSummary[]>([]);
  const [trendingIssues, setTrendingIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Latest Issues — SORT BY createdAt (NOT timestamp)
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await api.get('/issues');
        // Cast to meaningful type including _id
        const allIssues = data as Array<IssueSummary & { _id: string }>;

        // data is already sorted by createdAt desc from backend
        const approvedIssues = allIssues.filter(item => item.status !== 'pending');

        const latest = approvedIssues.slice(0, 6).map(item => ({ ...item, id: item._id }));
        setLatestIssues(latest);

        // Trending: sort by views desc
        const trending = [...approvedIssues]
          .sort((a, b) => b.views - a.views)
          .slice(0, 4)
          .map(item => ({ ...item, id: item._id }));
        setTrendingIssues(trending);

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch issues", error);
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Latest Issues Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-primary" size={32} />
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                সাম্প্রতিক সমস্যা
              </h2>
            </div>
            <p className="text-slate-600">
              সাম্প্রতিক রিপোর্ট করা সমস্যাগুলি দেখুন এবং আপনার মতামত জানান—কোনটি জরুরি?
            </p>
          </div>

          <Link
            to="/issues"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/25 transition-all hidden md:block"
          >
            সব সমস্যা দেখুন
          </Link>
        </motion.div>

        {/* Latest issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <IssueCardSkeleton key={`latest-skeleton-${index}`} />
            ))
          ) : latestIssues.length === 0 ? (
            <p className="text-slate-500">কোনো সমস্যা পাওয়া যায়নি</p>
          ) : (
            latestIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <IssueCard {...issue} />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Trending Section */}
      <div className="container mx-auto px-4 py-16 border-t border-slate-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <TrendingUp className="text-primary" size={32} />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              এই সপ্তাহের ট্রেন্ডিং
            </h2>
            <p className="text-slate-600">
              কোন সমস্যাগুলো এই সপ্তাহে সবচেয়ে বেশি আলোচিত হচ্ছে? জানুন এখনই!
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <IssueCardSkeleton key={`trending-skeleton-${index}`} />
            ))
          ) : trendingIssues.length === 0 ? (
            <p className="text-muted-foreground">কোনো ট্রেন্ডিং সমস্যা নেই</p>
          ) : (
            trendingIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <IssueCard {...issue} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
