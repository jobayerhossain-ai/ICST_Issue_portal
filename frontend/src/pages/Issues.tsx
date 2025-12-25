import { useEffect, useState } from "react";
import api from "@/services/api";
import IssueCard from "@/components/IssueCard";
import { motion } from "framer-motion";

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
  const [issues, setIssues] = useState<IssueSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { data } = await api.get('/issues');
        const mappedData = data
          .filter((item: { status: string }) => item.status !== 'pending')
          .map((item: { _id: string } & Record<string, unknown>) => ({ ...item, id: item._id }));
        setIssues(mappedData);
      } catch (error) {
        console.error("Failed to fetch issues", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xl">সমস্যা লোড হচ্ছে...</div>;
  }

  return (
    <div className="min-h-screen py-10 container mx-auto px-4">
      <h1 className="text-4xl font-bold mb-6">সকল সমস্যা</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue, index) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <IssueCard {...issue} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Issues;
