// src/components/IssueCard.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Eye, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

/*
  WHY: localStorage used for anonymous browser-side protection.
  Logged-in users are protected server-side using transaction + voters map.
*/

interface IssueCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: { good: number; bad: number };
  views: number;
  location: string;
  date: string;
  imageUrl?: string;
  evidence?: string;
}

const LOCAL_VOTE_KEY = 'votedIssues';

const canVoteLocal = (issueId: string) => {
  try {
    const raw = localStorage.getItem(LOCAL_VOTE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return !arr.includes(issueId);
  } catch {
    return true;
  }
};

const saveVoteLocal = (issueId: string) => {
  try {
    const raw = localStorage.getItem(LOCAL_VOTE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!arr.includes(issueId)) {
      arr.push(issueId);
      localStorage.setItem(LOCAL_VOTE_KEY, JSON.stringify(arr));
    }
  } catch {
    // ignore
  }
};

const IssueCard = ({
  id, title, description, category, status, votes, views, location, date, imageUrl, evidence
}: IssueCardProps) => {
  const { user } = useAuth();

  // realtime issue snapshot
  const [issueData, setIssueData] = useState<{ votes: { good: number; bad: number }, views: number, voters?: Record<string, string> }>({
    votes: votes || { good: 0, bad: 0 },
    views: views || 0,
    voters: {}
  });

  const [showPopup, setShowPopup] = useState<null | "good" | "bad" | "already">(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // We can fetch fresh data if needed, or rely on props.
    // For now, let's just use props as initial state and update on vote.
    // If we want "realtime", we'd need polling or websockets.
    // Let's stick to props for simplicity unless we want to fetch fresh data on mount.
    setIssueData({
      votes: votes || { good: 0, bad: 0 },
      views: views || 0,
      voters: {} // We don't have voters map in props usually, so we might need to fetch if we want to check "already voted" server side for this user.
    });
  }, [votes, views]);

  // Fetch fresh data to check voters map
  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const { data } = await api.get(`/issues/${id}`);
        setIssueData({
          votes: data.votes || { good: 0, bad: 0 },
          views: data.views || 0,
          voters: data.voters || {}
        });
      } catch (error) {
        console.error("Failed to fetch issue", error);
      }
    };
    fetchIssue();
  }, [id]);

  // compute hasVoted from either logged-in voter map or localStorage
  useEffect(() => {
    if (user) {
      const voted = !!(issueData.voters && issueData.voters[user._id]);
      setHasVoted(voted);
    } else {
      setHasVoted(!canVoteLocal(id) ? true : false);
    }
  }, [issueData, user, id]);

  const totalVotes = issueData.votes.good + issueData.votes.bad;
  const goodPercentage = totalVotes > 0 ? (issueData.votes.good / totalVotes) * 100 : 50;

  // unified vote handler
  const handleVote = async (type: "good" | "bad") => {
    if (isVoting) return;
    // quick local check
    if (user) {
      if (issueData.voters && issueData.voters[user._id]) {
        setShowPopup("already");
        setTimeout(() => setShowPopup(null), 1400);
        return;
      }
    } else {
      if (!canVoteLocal(id)) {
        setShowPopup("already");
        setTimeout(() => setShowPopup(null), 1400);
        return;
      }
    }

    setIsVoting(true);

    try {
      const { data } = await api.put(`/issues/${id}/vote`, { type });

      setIssueData({
        votes: data.votes,
        views: data.views,
        voters: data.voters
      });

      if (!user) {
        saveVoteLocal(id);
      }
      setShowPopup(type);
      setTimeout(() => setShowPopup(null), 1200);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message === "already") {
        setShowPopup("already");
        setTimeout(() => setShowPopup(null), 1200);
      } else {
        console.error("Vote error:", err);
        setShowPopup("already");
        setTimeout(() => setShowPopup(null), 1200);
      }
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative glass-card rounded-xl overflow-hidden group"
    >
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute top-3 right-3 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${showPopup === "already" ? "bg-red-600" : "bg-black/80"
              }`}
          >
            <CheckCircle size={14} className="text-neon-green" />
            {showPopup === "already" ? "আপনি আগেই ভোট দিয়েছেন!" : (showPopup === "good" ? "ভোট যুক্ত হয়েছে!" : "ডাউনভোট যুক্ত হয়েছে!")}
          </motion.div>
        )}
      </AnimatePresence>

      {(imageUrl || evidence) && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img src={imageUrl || evidence} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30">{category}</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-500/20 text-yellow-400 border-yellow-500/50">{status.replace("_", " ").toUpperCase()}</span>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>ভালো: {issueData.votes.good}</span>
            <span>খারাপ: {issueData.votes.bad}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500" style={{ width: `${goodPercentage}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1"><MapPin size={14} className="text-primary" /> {location}</div>
          <div className="flex items-center gap-1"><Clock size={14} className="text-primary" /> {date}</div>
          <div className="flex items-center gap-1"><Eye size={14} className="text-primary" /> {issueData.views}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("good")}
            disabled={hasVoted || isVoting}
            className={`flex-1 py-2 rounded-lg ${hasVoted ? 'bg-muted/50 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'} flex items-center justify-center gap-2 font-medium transition-all`}
          >
            <ThumbsUp size={16} /> ভালো ভোট
          </button>

          <button
            onClick={() => handleVote("bad")}
            disabled={hasVoted || isVoting}
            className={`flex-1 py-2 rounded-lg ${hasVoted ? 'bg-muted/50 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl'} flex items-center justify-center gap-2 font-medium transition-all`}
          >
            <ThumbsDown size={16} /> খারাপ ভোট
          </button>

          <Link to={`/issues/${id}`} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">বিস্তারিত</Link>
        </div>
      </div>
    </motion.div>
  );
};

export default IssueCard;
