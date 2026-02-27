import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Eye, Clock, MapPin, MessageCircle, Send, CheckCircle, ChevronLeft, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { LoginPopover } from "@/components/LoginPopover";

const LOCAL_VOTE_KEY = 'votedIssues';

interface IssueDetail {
  _id: string;
  id: string;
  title: string;
  description: string;
  location: string;
  category?: string;
  status?: string;
  date: string;
  views: number;
  votesGood: number;
  votesBad: number;
  votes?: { good?: number; bad?: number };
  imageUrl?: string;
  evidence?: string;
  voters?: Record<string, string>;
  votersList?: { _id: string; name: string; type: string }[];
  [key: string]: any;
}

interface Comment {
  _id: string;
  text: string;
  parentId?: string;
  username: string;
  timestamp: string;
}

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

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();

  // INSTANT DATA: Grab issue data from router state (passed by IssueCard)
  const routerIssue = (location.state as any)?.issue as IssueDetail | undefined;

  const [commentText, setCommentText] = useState("");
  const [popup, setPopup] = useState<null | "good" | "bad" | "already">(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Fetch issue details
  const { data: issue, isLoading: isIssueLoading } = useQuery<IssueDetail>({
    queryKey: ['issue', id],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${id}`);
      return { ...data, id: data._id };
    },
    enabled: !!id,
    staleTime: 5000,
    gcTime: 600000,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
    initialData: () => {
      if (routerIssue) return routerIssue;
      const queries = queryClient.getQueriesData({ predicate: (q) => Array.isArray(q.state.data) });
      for (const [_, data] of queries) {
        if (!Array.isArray(data)) continue;
        const found = data.find((i: any) => i?._id === id || i?.id === id);
        if (found) {
          return {
            ...found,
            _id: found._id || found.id,
            id: found.id || found._id,
            votesGood: found.votesGood !== undefined ? found.votesGood : (found.votes?.good || 0),
            votesBad: found.votesBad !== undefined ? found.votesBad : (found.votes?.bad || 0),
          } as IssueDetail;
        }
      }
      return undefined;
    }
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data } = await api.get(`/issues/${id}/comments`);
      return data;
    },
    enabled: !!id,
    staleTime: 5000,
    gcTime: 600000,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
    retry: 3,
    retryDelay: 1000,
  });

  // Check Vote Status Logics
  useEffect(() => {
    if (!issue || !id) return;
    if (user) {
      if (issue.voters && issue.voters[user._id]) {
        setHasVoted(true);
      } else {
        setHasVoted(false);
      }
    } else {
      setHasVoted(!canVoteLocal(id));
    }
  }, [issue, user, id]);

  const voteMutation = useMutation({
    mutationFn: async (type: "good" | "bad") => {
      const { data } = await api.put(`/issues/${id}/vote`, { type });
      return data;
    },
    onMutate: async (type) => {
      await queryClient.cancelQueries({ queryKey: ['issue', id] });
      const previousIssue = queryClient.getQueryData(['issue', id]);

      queryClient.setQueryData(['issue', id], (old: any) => ({
        ...old,
        votesGood: type === 'good' ? (old.votesGood || old.votes?.good || 0) + 1 : old.votesGood,
        votesBad: type === 'bad' ? (old.votesBad || old.votes?.bad || 0) + 1 : old.votesBad,
        votes: {
          ...old.votes,
          [type]: (old.votes?.[type] || 0) + 1
        },
        voters: user ? { ...old.voters, [user._id]: "voted" } : old.voters
      }));

      setHasVoted(true);
      if (!user && id) saveVoteLocal(id);

      setPopup(type);
      setTimeout(() => setPopup(null), 1200);

      return { previousIssue };
    },
    onError: (err: any, type, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(['issue', id], context.previousIssue);
      }
      setPopup("already");
      setTimeout(() => setPopup(null), 1200);
      setHasVoted(false);
    }
  });

  const handleVote = (type: "good" | "bad") => {
    if (!user || !id || voteMutation.isPending || hasVoted) return;

    if (issue?.voters && issue.voters[user._id]) {
      setPopup("already");
      setTimeout(() => setPopup(null), 1400);
      return;
    }

    voteMutation.mutate(type);
  };

  const commentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      const payload = { text, parentId: parentId?.trim() || undefined };
      const { data } = await api.post(`/issues/${id}/comments`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to post comment",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const submitComment = (text?: string, parentId?: string) => {
    if (!user) return;
    const content = text || commentText;
    if (!content.trim() || !id) return;

    commentMutation.mutate({ text: content, parentId });
    if (!text) setCommentText("");
  };

  const safeIssue = issue || routerIssue || {
    _id: id || "",
    id: id || "",
    title: "",
    description: "",
    location: "",
    category: "",
    status: "",
    date: new Date().toISOString(),
    views: 0,
    votesGood: 0,
    votesBad: 0,
    voters: {},
    votersList: []
  };

  const totalVotes = Math.max(0, (safeIssue.votesGood || safeIssue?.votes?.good || 0) + (safeIssue.votesBad || safeIssue?.votes?.bad || 0));
  const exactGood = safeIssue.votesGood || safeIssue?.votes?.good || 0;
  const exactBad = safeIssue.votesBad || safeIssue?.votes?.bad || 0;
  const goodPercent = totalVotes > 0 ? (exactGood / totalVotes) * 100 : 50;

  const bgImage = safeIssue.imageUrl || safeIssue.evidence;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-primary/20">

      {/* Toast Popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl text-white font-medium z-[100] flex items-center gap-2 backdrop-blur-md border border-white/20 ${popup === "already" ? "bg-red-500" : "bg-slate-800"}`}
          >
            <CheckCircle size={18} />
            {popup === "already" ? "আপনি আগেই ভোট দিয়েছেন!" : (popup === "good" ? "আপভোট দেওয়া হয়েছে!" : "ডাউনভোট দেওয়া হয়েছে!")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="relative w-full bg-slate-900 overflow-hidden flex flex-col justify-end min-h-[45vh] lg:min-h-[500px]">
        {/* Background Layer */}
        {bgImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center blur-3xl scale-125 opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-slate-950" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-900 to-slate-950" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          </>
        )}

        {/* Floating Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 md:top-10 md:left-10 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white text-sm font-medium transition-all group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> ফিরে যান
        </button>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 md:px-8 pb-16 pt-32 max-w-4xl">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center text-center gap-3 mb-6"
          >
            {safeIssue.category && (
              <span className="px-5 py-1.5 rounded-full text-[13px] font-bold tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md shadow-lg">
                {safeIssue.category}
              </span>
            )}
            {safeIssue.status && (
              <span className="px-5 py-1.5 rounded-full text-[13px] font-bold tracking-widest uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 backdrop-blur-md shadow-lg">
                {safeIssue.status.replace("_", " ")}
              </span>
            )}
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-4xl text-center mx-auto"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            {safeIssue.title || "Loading Issue Details..."}
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center items-center gap-4 text-slate-300 text-sm md:text-[15px] font-medium"
          >
            <div className="flex items-center gap-2"><MapPin size={18} className="text-primary-400" /> {safeIssue.location || "অজানা"}</div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
            <div className="flex items-center gap-2"><Calendar size={18} className="text-primary-400" /> {new Date(safeIssue.date || Date.now()).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block" />
            <div className="flex items-center gap-2"><Eye size={18} className="text-primary-400" /> {safeIssue.views || 0} ভিউ</div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8 -mt-12 relative z-30 max-w-4xl">
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/80 overflow-hidden mb-16">

          {/* Detailed Image / Banner (If exists) */}
          {bgImage && (
            <div className="w-full h-[300px] md:h-auto md:max-h-[400px] overflow-hidden bg-slate-100 group relative">
              <img
                src={bgImage}
                alt="Evidence"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-in-out cursor-pointer"
                onClick={() => window.open(bgImage, '_blank')}
              />
            </div>
          )}

          <div className="p-6 md:p-10 lg:p-12">

            {/* Description Area */}
            <div className="mb-12">
              <h2 className="text-[22px] font-extrabold text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                বিস্তারিত বিবরণ
              </h2>
              <div className="text-slate-600 text-[16px] md:text-[18px] leading-[1.9] font-medium whitespace-pre-wrap">
                {safeIssue.description || "বিবরণ লোড হচ্ছে..."}
              </div>
            </div>

            {/* Horizontal Voting Bar (Replaces Sidebar) */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <h3 className="text-[15px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">জনগণের মতামত</h3>
                  <div className="text-[13px] font-semibold text-slate-400">সর্বমোট {totalVotes} টি ভোট গৃহীত হয়েছে</div>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-bold text-green-600/80 uppercase tracking-widest mb-1.5">সপক্ষে</span>
                    <span className="text-3xl font-black text-slate-800 leading-none">{exactGood}</span>
                  </div>
                  <div className="w-px h-12 bg-slate-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-bold text-red-500/80 uppercase tracking-widest mb-1.5">বিপক্ষে</span>
                    <span className="text-3xl font-black text-slate-800 leading-none">{exactBad}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden flex mb-8">
                <div className="h-full bg-green-500 transition-all duration-1000 ease-out relative" style={{ width: `${goodPercent}%` }}>
                  <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                </div>
                <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: `${100 - goodPercent}%` }} />
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LoginPopover requireAuth={!user}>
                  <button
                    onClick={() => handleVote("good")}
                    disabled={(!user ? false : hasVoted) || voteMutation.isPending}
                    className={`w-full py-4 rounded-2xl flex justify-center items-center gap-3 text-[17px] font-bold transition-all active:scale-95 border-2 ${hasVoted && user
                      ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-green-50/50 border-green-200 text-green-700 hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-lg hover:shadow-green-600/30'
                      }`}
                  >
                    <ThumbsUp size={22} className={hasVoted && user ? "fill-current opacity-50" : ""} />
                    আমি একমত
                  </button>
                </LoginPopover>

                <LoginPopover requireAuth={!user}>
                  <button
                    onClick={() => handleVote("bad")}
                    disabled={(!user ? false : hasVoted) || voteMutation.isPending}
                    className={`w-full py-4 rounded-2xl flex justify-center items-center gap-3 text-[17px] font-bold transition-all active:scale-95 border-2 ${hasVoted && user
                      ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-red-50/50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:shadow-red-600/30'
                      }`}
                  >
                    <ThumbsDown size={22} className={hasVoted && user ? "fill-current opacity-50" : ""} />
                    আমি দ্বিমত
                  </button>
                </LoginPopover>
              </div>
            </div>

            {/* Comments Area inside the same card */}
            <div className="pt-10 border-t border-slate-100">
              <h2 className="text-[24px] font-extrabold mb-10 flex items-center gap-3 text-slate-800">
                <MessageCircle size={28} className="text-primary" />
                মন্তব্য ({comments.length})
              </h2>

              {/* Modern Comment Input */}
              <div className="mb-12 p-3 md:p-6 rounded-[2rem] border border-slate-200/60 bg-slate-50 relative focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                <LoginPopover requireAuth={!user}>
                  <div className="relative">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      readOnly={!user}
                      disabled={commentMutation.isPending}
                      placeholder={user ? "আপনার গঠনমূলক মতামত জানান..." : "মন্তব্য করতে লগইন করুন..."}
                      className={`w-full min-h-[140px] p-4 bg-transparent resize-none focus:outline-none transition-all text-slate-800 text-[16px] md:text-[17px] font-medium leading-relaxed ${!user ? "cursor-not-allowed opacity-70" : ""}`}
                    />
                    <div className="absolute bottom-0 right-0 left-0 pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/60 p-2 sm:px-4 sm:pb-2">
                      <span className="text-[13px] font-semibold text-slate-400 mb-2 sm:mb-0">
                        {commentText.length}/1000
                      </span>
                      <button
                        onClick={() => submitComment()}
                        disabled={(!commentText.trim() && user !== null) || commentMutation.isPending}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-900 !text-white hover:bg-primary flex justify-center items-center gap-2 disabled:opacity-50 transition-all font-bold text-[16px] shadow-lg shadow-primary/20"
                      >
                        <Send size={18} className="-ml-1" /> পোস্ট করুন
                      </button>
                    </div>
                  </div>
                </LoginPopover>
              </div>

              {/* Comments Thread */}
              <div className="space-y-8 pl-1 md:pl-2">
                {comments.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-3xl border-2 border-slate-200 border-dashed bg-slate-50/50">
                    <p className="text-slate-500 font-semibold text-[17px]">এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি করুন!</p>
                  </div>
                ) : (
                  comments.filter(c => !c.parentId).map((c) => (
                    <CommentItem key={c._id} comment={c} allComments={comments} onReply={submitComment} user={user} />
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Clean Modern Comment Component
const CommentItem = ({ comment, allComments, onReply, user }: { comment: Comment, allComments: Comment[], onReply: (text: string, parentId?: string) => void, user: any }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replies = allComments.filter(c => c.parentId === comment._id).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText, comment._id);
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
    <div className="group flex gap-3 md:gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-gradient-to-br from-slate-200 to-slate-200/50 border border-slate-200 flex items-center justify-center text-[14px] md:text-[15px] font-black text-slate-500 uppercase shadow-sm">
        {comment.username.substring(0, 2)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 border border-slate-100/80 rounded-[1.25rem] p-4 md:p-5 text-slate-800 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[15px] md:text-[16px] text-slate-900 tracking-tight">{comment.username}</span>
            <span className="text-[11px] md:text-[12px] font-semibold text-slate-400">{new Date(comment.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}</span>
          </div>
          <p className="text-[15px] md:text-[16px] leading-[1.7] text-slate-600 md:pr-4 font-medium whitespace-pre-wrap">{comment.text}</p>
        </div>

        <div className="mt-2.5 flex items-center gap-4 ml-2">
          <LoginPopover requireAuth={!user}>
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-[12px] md:text-[13px] text-slate-400 hover:text-primary font-bold transition-colors uppercase tracking-widest"
            >
              Reply
            </button>
          </LoginPopover>
        </div>

        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3.5 flex gap-2 md:gap-3 overflow-hidden pr-2"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full bg-slate-200/50 border border-slate-200 hidden sm:block" />
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex items-center pr-1.5 shadow-sm focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all overflow-hidden flex-col sm:flex-row">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply..."
                  className="w-full bg-transparent px-4 py-3 text-[14px] md:text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="w-[calc(100%-8px)] sm:w-auto px-5 py-2 m-1 bg-slate-900 text-white rounded-xl text-[13px] font-bold disabled:opacity-50 hover:bg-primary transition-colors shrink-0 shadow-md"
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {replies.length > 0 && (
          <div className="mt-5 space-y-5 border-l-2 border-slate-100 pl-3 md:pl-6 ml-1 md:ml-2">
            {replies.map(reply => (
              <CommentItem key={reply._id} comment={reply} allComments={allComments} onReply={onReply} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(IssueDetails);
