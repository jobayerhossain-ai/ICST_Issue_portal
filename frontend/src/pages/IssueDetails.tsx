import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, ThumbsDown, Eye, Clock, MapPin, MessageCircle, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const LOCAL_VOTE_KEY = 'votedIssues';

interface IssueDetail {
  _id: string;
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  views: number;
  votes: { good: number; bad: number };
  voters?: Record<string, string>;
  [key: string]: unknown;
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
  const { user } = useAuth();
  const { toast } = useToast();

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [popup, setPopup] = useState<null | "good" | "bad" | "already">(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchIssue = async () => {
      try {
        const { data } = await api.get(`/issues/${id}`);
        setIssue({ ...data, id: data._id });
      } catch (err) {
        console.error(err);
      }
    };
    fetchIssue();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let failureCount = 0;
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/issues/${id}/comments`);
        setComments(data);
        failureCount = 0; // Reset on success
      } catch (err) {
        console.error(err);
        failureCount++;
        // Stop polling after 3 consecutive failures
        if (failureCount >= 3) {
          clearInterval(interval);
          toast({
            title: "কনেকশন সমস্যা",
            description: "লাইভ মন্তব্য লোড করতে অক্ষম। দয়া করে পেজ রিফ্রেশ করুন।",
            variant: "destructive",
          });
        }
      }
    };

    fetchComments();
    // Poll every 2 seconds for live comments
    const interval = setInterval(fetchComments, 2000);
    return () => clearInterval(interval);
  }, [id, toast]);

  // compute hasVoted
  useEffect(() => {
    if (!issue) return;
    if (user) {
      // Check if user ID is in voters map
      // voters is a Map or Object in Mongo response?
      // Mongoose Map becomes object in JSON: { userId: 'good' }
      if (issue.voters && issue.voters[user._id]) {
        setHasVoted(true);
      } else {
        setHasVoted(false);
      }
    } else {
      setHasVoted(!canVoteLocal(id!));
    }
  }, [issue, user, id]);

  const handleVote = async (type: "good" | "bad") => {
    if (!id || isVoting) return;

    if (user) {
      if (issue.voters && issue.voters[user._id]) {
        setPopup("already");
        setTimeout(() => setPopup(null), 1400);
        return;
      }
    } else {
      if (!canVoteLocal(id)) {
        setPopup("already");
        setTimeout(() => setPopup(null), 1400);
        return;
      }
    }

    setIsVoting(true);

    try {
      const { data } = await api.put(`/issues/${id}/vote`, { type });
      setIssue({ ...data, id: data._id });

      if (!user) {
        saveVoteLocal(id);
      }
      setPopup(type);
      setTimeout(() => setPopup(null), 1200);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error.response?.data?.message === "already") {
        setPopup("already");
        setTimeout(() => setPopup(null), 1200);
      } else {
        console.error("Vote error:", err);
        setPopup("already");
        setTimeout(() => setPopup(null), 1200);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const submitComment = async (text?: string, parentId?: string) => {
    const content = text || commentText;
    if (!content.trim() || !id) return;

    try {
      const { data } = await api.post(`/issues/${id}/comments`, {
        text: content,
        parentId
      });
      setComments([data, ...comments]);
      if (!text) setCommentText("");
    } catch (err: unknown) {
      console.error("Comment error", err);
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Failed to post comment",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!issue) return (
    <div className="text-center py-20 text-muted-foreground">সমস্যা লোড হচ্ছে...</div>
  );

  const totalVotes = (issue.votes?.good || 0) + (issue.votes?.bad || 0);
  const goodPercent = totalVotes > 0 ? ((issue.votes.good || 0) / totalVotes) * 100 : 50;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg text-white ${popup === "already" ? "bg-red-600" : "bg-black/80"}`}
          >
            <CheckCircle size={18} className="inline mr-2" />
            {popup === "already" ? "আপনি আগেই ভোট দিয়েছেন!" : (popup === "good" ? "আপভোট দেওয়া হয়েছে!" : "ডাউনভোট দেওয়া হয়েছে!")}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center mb-8">
        <div className="p-6 rounded-xl border border-primary/50 shadow-[0_0_30px_-5px_rgba(14,255,159,0.3)] bg-card/30 backdrop-blur-sm text-center inline-block max-w-full transition-all duration-500 hover:shadow-[0_0_60px_15px_rgba(14,255,159,0.5)] hover:border-primary hover:scale-[1.02] cursor-default">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight break-words">
            {issue.title}
          </h1>
        </div>
      </div>
      <p className="text-lg text-muted-foreground mb-6">{issue.description}</p>

      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
        <span className="flex items-center gap-1"><MapPin size={15} /> {issue.location}</span>
        <span className="flex items-center gap-1"><Clock size={15} /> {issue.date}</span>
        <span className="flex items-center gap-1"><Eye size={15} /> {issue.views}</span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>ভালো: {issue.votes?.good || 0}</span>
          <span>খারাপ: {issue.votes?.bad || 0}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan" style={{ width: `${goodPercent}%` }} />
        </div>
      </div>

      <div className="flex gap-4 mb-10">
        <button
          onClick={() => handleVote("good")}
          disabled={hasVoted || isVoting}
          className={`flex-1 py-3 rounded-lg ${hasVoted ? 'bg-muted/50 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'} flex justify-center items-center gap-2 text-lg font-semibold transition-all`}
        >
          <ThumbsUp size={18} /> আপভোট
        </button>

        <button
          onClick={() => handleVote("bad")}
          disabled={hasVoted || isVoting}
          className={`flex-1 py-3 rounded-lg ${hasVoted ? 'bg-muted/50 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl'} flex justify-center items-center gap-2 text-lg font-semibold transition-all`}
        >
          <ThumbsDown size={18} /> ডাউনভোট
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><MessageCircle size={22} /> মন্তব্য</h2>

      {/* Comment Input */}
      <div className="flex flex-col gap-2 mb-6">
        <textarea
          placeholder="একটি মন্তব্য লিখুন..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          maxLength={1000}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{commentText.length}/1000</span>
          <button
            onClick={() => submitComment()}
            disabled={!commentText.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-white flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={16} /> পাঠান
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.filter(c => !c.parentId).map((c) => (
          <CommentItem key={c._id} comment={c} allComments={comments} onReply={submitComment} />
        ))}

        {comments.length === 0 && <p className="text-muted-foreground text-sm">এখনও কোনো মন্তব্য নেই।</p>}
      </div>
    </div>
  );
};

const CommentItem = ({ comment, allComments, onReply }: { comment: Comment, allComments: Comment[], onReply: (text: string, parentId?: string) => void }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const replies = allComments.filter(c => c.parentId === comment._id);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(replyText, comment._id);
      setReplyText("");
      setIsReplying(false);
    }
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-primary">{comment.username}</p>
          <p className="text-xs text-muted-foreground mb-2">{new Date(comment.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <p className="text-sm text-foreground mb-3">{comment.text}</p>

      <button
        onClick={() => setIsReplying(!isReplying)}
        className="text-xs text-primary hover:underline mb-2"
      >
        উত্তর
      </button>

      {isReplying && (
        <div className="flex gap-2 mb-3 ml-4">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            maxLength={1000}
            placeholder="একটি উত্তর লিখুন..."
            className="flex-1 px-3 py-2 bg-background border rounded text-sm"
          />
          <button
            onClick={handleReply}
            disabled={!replyText.trim()}
            className="px-3 py-2 bg-primary text-white rounded text-xs disabled:opacity-50"
          >
            উত্তর
          </button>
        </div>
      )}

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="ml-6 space-y-3 border-l-2 border-border pl-4 mt-2">
          {replies.map(reply => (
            <CommentItem key={reply._id} comment={reply} allComments={allComments} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};


export default IssueDetails;
