import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Eye, Clock, MapPin, CheckCircle, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { LoginPopover } from '@/components/LoginPopover';

/*
  WHY: Users must be authenticated to vote.
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
  voters?: Record<string, string>;
}

const IssueCard = React.memo(({
  id, title, description, category, status, votes, views, location, date, imageUrl, evidence, voters
}: IssueCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [issueData, setIssueData] = useState<{ votes: { good: number; bad: number }, views: number, voters?: Record<string, string> }>({
    votes: votes || { good: 0, bad: 0 },
    views: views || 0,
    voters: voters || {}
  });

  const [showPopup, setShowPopup] = useState<null | "good" | "bad" | "already">(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setIssueData({
      votes: votes || { good: 0, bad: 0 },
      views: views || 0,
      voters: voters || {}
    });
  }, [votes, views, voters]);

  useEffect(() => {
    if (user) {
      const voted = !!(issueData.voters && issueData.voters[user._id]);
      setHasVoted(voted);
    } else {
      setHasVoted(false);
    }
  }, [issueData, user, id]);

  const totalVotes = issueData.votes.good + issueData.votes.bad;
  const goodPercentage = totalVotes > 0 ? (issueData.votes.good / totalVotes) * 100 : 50;

  const voteMutation = useMutation({
    mutationFn: async (type: "good" | "bad") => {
      const { data } = await api.put(`/issues/${id}/vote`, { type });
      return data;
    },
    onMutate: async (type) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['publicIssues'] });

      const previousIssues = queryClient.getQueryData(['publicIssues']);

      setIssueData(prev => ({
        ...prev,
        votes: {
          ...prev.votes,
          [type]: prev.votes[type] + 1
        },
        voters: user ? { ...prev.voters, [user._id]: "voted" } : prev.voters
      }));
      setHasVoted(true);

      setShowPopup(type);
      setTimeout(() => setShowPopup(null), 1200);

      return { previousIssues };
    },
    onError: (err: any, type, context) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueryData(['publicIssues'], context.previousIssues);
      }

      if (err.response?.data?.message === "already") {
        setShowPopup("already");
      } else {
        setShowPopup("already");
      }
      setTimeout(() => setShowPopup(null), 1200);
      setHasVoted(false);
    },
    onSettled: () => {
      // Only invalidate individual queries if needed, for public issues we rely on optimistic updates to lower server loads
    }
  });

  const handleVote = (type: "good" | "bad") => {
    if (!user || voteMutation.isPending || hasVoted) return;

    if (issueData.voters && issueData.voters[user._id]) {
      setShowPopup("already");
      setTimeout(() => setShowPopup(null), 1400);
      return;
    }

    voteMutation.mutate(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={window.innerWidth >= 768 ? { y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } } : undefined}
      onClick={() => navigate(`/issues/${id}`, { state: { issue: { _id: id, id, title, description, category, status, votesGood: issueData.votes.good, votesBad: issueData.votes.bad, views: issueData.views, location, date, imageUrl, evidence, voters: issueData.voters } } })}
      className="relative glass-card flex flex-col h-full rounded-xl overflow-hidden group border border-slate-200 bg-white hover:border-primary/50 transition-colors shadow-sm cursor-pointer"
      style={{ willChange: "transform, opacity", transform: "translateZ(0)" }}
    >
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute top-3 right-3 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 z-20 shadow-md ${showPopup === "already" ? "bg-red-500" : "bg-slate-800"
              }`}
          >
            <CheckCircle size={14} className="text-white" />
            {showPopup === "already" ? "আপনি আগেই ভোট দিয়েছেন!" : (showPopup === "good" ? "ভোট যুক্ত হয়েছে!" : "ডাউনভোট যুক্ত হয়েছে!")}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-48 w-full overflow-hidden">
        {(imageUrl || evidence) ? (
          <img
            src={imageUrl || evidence}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400 text-sm font-medium">ছবি নেই</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/70 text-slate-800 border border-white/50 shadow-sm">{category}</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-yellow-100/90 text-yellow-800 border border-yellow-200 shadow-sm">{status.replace("_", " ").toUpperCase()}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[17px] font-bold text-slate-800 mb-1.5 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{title}</h3>

        <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-3 font-medium">
          <span className="flex items-center gap-1"><Clock size={12} /> {date}</span>
          <span>•</span>
          <span className="flex items-center gap-1 truncate"><MapPin size={12} className="flex-shrink-0" /> {location}</span>
        </div>

        <p className="text-slate-600 text-[14px] mb-4 line-clamp-2 leading-relaxed">{description}</p>

        <div className="mt-auto pt-2">
          {/* Facebook Style Stats Row */}
          <div className="flex items-center justify-between text-[13px] text-slate-500 mb-2 px-1">
            <div className="flex items-center gap-1.5">
              {issueData.votes.good > 0 || issueData.votes.bad > 0 ? (
                <>
                  <div className="flex -space-x-1">
                    {issueData.votes.good > 0 && (
                      <div className="w-[18px] h-[18px] z-10 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white">
                        <ThumbsUp size={10} className="text-white fill-current" />
                      </div>
                    )}
                    {issueData.votes.bad > 0 && (
                      <div className="w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center ring-2 ring-white">
                        <ThumbsDown size={10} className="text-white fill-current mt-[2px]" />
                      </div>
                    )}
                  </div>
                  <span className="hover:underline cursor-pointer font-medium">{issueData.votes.good + issueData.votes.bad}</span>
                </>
              ) : (
                <span className="text-[13px]">প্রথম প্রতিক্রিয়া জানাবেন?</span>
              )}
            </div>
            <div className="flex items-center gap-3 font-medium">
              <span className="hover:underline cursor-pointer">{issueData.views} ভিউ (views)</span>
            </div>
          </div>

          {/* Facebook Style Actions Row */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-1 -mx-2 px-2">
            <LoginPopover requireAuth={!user}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote("good"); }}
                disabled={(!user ? false : hasVoted) || voteMutation.isPending}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all active:scale-95 ${hasVoted && user
                  ? 'text-slate-400 bg-transparent cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-green-600'
                  }`}
              >
                <ThumbsUp size={22} className={hasVoted && user ? "fill-current" : ""} />
                <span className="font-semibold text-[15px] pt-[2px]">Like</span>
              </button>
            </LoginPopover>

            <LoginPopover requireAuth={!user}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/issues/${id}`, { state: { issue: { _id: id, id, title, description, category, status, votesGood: issueData.votes.good, votesBad: issueData.votes.bad, views: issueData.views, location, date, imageUrl, evidence, voters: issueData.voters } } }); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all active:scale-95 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
              >
                <MessageCircle size={22} />
                <span className="font-semibold text-[15px] pt-[2px]">Comment</span>
              </button>
            </LoginPopover>

            <LoginPopover requireAuth={!user}>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote("bad"); }}
                disabled={(!user ? false : hasVoted) || voteMutation.isPending}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all active:scale-95 ${hasVoted && user
                  ? 'text-slate-400 bg-transparent cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-red-600'
                  }`}
              >
                <ThumbsDown size={22} className={hasVoted && user ? "fill-current" : ""} />
                <span className="font-semibold text-[15px] pt-[2px]">Dislike</span>
              </button>
            </LoginPopover>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default IssueCard;
