import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import IssueCard from "@/components/IssueCard";
import { IssueCardSkeleton } from "@/components/IssueCardSkeleton";
import { motion, AnimatePresence } from "framer-motion";

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

const Issues = () => {
  const { data: issues = [], isLoading, isFetching } = useQuery<IssueSummary[]>({
    queryKey: ['publicIssues'],
    queryFn: async () => {
      const { data } = await api.get('/issues');
      // Backend now filters pending issues, no need for client-side filter
      return data.map((item: { _id: string } & Record<string, unknown>) => ({ ...item, id: item._id }));
    },
    staleTime: 10000,        // Data stays fresh for 10s — no refetch on re-mount
    gcTime: 600000,           // Keep in cache for 10 minutes
    refetchInterval: 5000,    // Real-time sync: auto-refetch every 5s in background
    refetchIntervalInBackground: false, // Only when tab is visible
    placeholderData: (prev) => prev, // Show previous data while refreshing — no skeletons
  });

  return (
    <div className="min-h-screen py-16 container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold text-slate-800 mb-2">সকল সমস্যা</h1>
        <p className="text-slate-600">ক্যাম্পাসের সকল রিপোর্ট করা সমস্যাগুলি এখানে দেখুন</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <IssueCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20 text-xl text-slate-500">কোনো সমস্যা পাওয়া যায়নি</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {issues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index < 10 ? index * 0.05 : 0 }}
                className="h-full"
              >
                <IssueCard {...issue} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Issues;
