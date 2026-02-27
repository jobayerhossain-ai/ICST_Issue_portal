import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { motion } from "framer-motion";
import { TrendingUp, ThumbsUp, ThumbsDown, Activity } from "lucide-react";

interface VoteIssue {
  _id: string;
  id: string;
  title: string;
  votesGood: number;
  votesBad: number;
  [key: string]: unknown;
}

const VoteMonitor = () => {
  const { data: issues = [] } = useQuery<VoteIssue[]>({
    queryKey: ['voteMonitor'],
    queryFn: async () => {
      const { data } = await api.get('/issues');
      return data.map((item: VoteIssue) => ({ ...item, id: item._id }));
    },
    staleTime: 30000,
    gcTime: 600000,
    refetchInterval: 10000,
    placeholderData: (prev) => prev ?? [],
  });

  const totalGood = issues.reduce((a, b) => a + (b.votesGood || 0), 0);
  const totalBad = issues.reduce((a, b) => a + (b.votesBad || 0), 0);
  const totalVotes = totalGood + totalBad;

  const sortedIssues = [...issues]
    .map((i) => ({
      ...i,
      score: (i.votesGood || 0) - (i.votesBad || 0),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold">Vote Monitor</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <Activity size={32} className="text-primary" />
          <h2 className="text-3xl font-bold">{totalVotes}</h2>
          <p>Total Votes</p>
        </div>

        <div className="glass-card p-6">
          <ThumbsUp size={32} className="text-green-500" />
          <h2 className="text-3xl font-bold">{totalGood}</h2>
          <p>Good Votes</p>
        </div>

        <div className="glass-card p-6">
          <ThumbsDown size={32} className="text-red-500" />
          <h2 className="text-3xl font-bold">{totalBad}</h2>
          <p>Bad Votes</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Top Voted Issues</h2>
        {sortedIssues.map((i, index) => (
          <div key={i.id} className="p-3 border-b border-border">
            <h3 className="font-semibold">{index + 1}. {i.title}</h3>
            <p className="text-sm text-muted-foreground">
              Good: {i.votesGood || 0} | Bad: {i.votesBad || 0} | Score: {i.score}
            </p>
          </div>
        ))}
        {sortedIssues.length === 0 && (
          <p className="text-sm text-muted-foreground">No voted issues available.</p>
        )}
      </div>

    </div>
  );
};

export default VoteMonitor;
