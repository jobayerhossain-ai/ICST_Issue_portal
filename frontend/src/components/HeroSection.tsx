// src/components/HeroSection.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  PanInfo,
} from "framer-motion";
import { TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/services/api";

const SLIDES = [
  {
    id: "s1",
    title: "ক্যাম্পাসের সমস্যা? জানান আমাদের!",
    subtitle: "উন্নত প্রতিষ্ঠান গড়তে আপনার কণ্ঠস্বরই আসল শক্তি",
    description:
      "প্রতিষ্ঠানকে আরও ভালো করতে চান? তবে শুধু মনে মনে ক্ষুব্ধ না থেকে সমস্যা রিপোর্ট করুন! আপনি ও আমি মিলেই 'উন্নয়নের নায়ক' হয়ে উঠতে পারি।",
    cta: "সমস্যা জানান",
    link: "/submit",
    gradient: "from-neon-cyan to-neon-blue",
  },
  {
    id: "s2",
    title: "আপনার সমস্যা কোথায় পৌঁছেছে জানতে চান?",
    subtitle: "প্রতিটি সমস্যার অগ্রগতি স্বচ্ছভাবে ট্র্যাক করুন!",
    description:
      "সমস্যা জানানোর পর মনে হবে যেন আপনার রিপোর্টও একটি 'স্ট্যাটাস আপডেট' পাচ্ছে! 'প্রসেসিং চলছে... অনুগ্রহ করে অপেক্ষা করুন'—ঠিক এমনই!",
    cta: "সমস্যা দেখুন",
    link: "/issues",
    gradient: "from-neon-purple to-neon-pink",
  },
  {
    id: "s3",
    title: "কমিউনিটি ভোটিং—কার সমস্যা প্রথমে?",
    subtitle: "সমস্যা অনেক, কিন্তু কোনটি আগে সমাধান হবে? ভোট দিয়ে ঠিক করুন!",
    description:
      "কোন সমস্যাটি VIP ট্রিটমেন্ট পাবে? সেটা আপনার ভোটেই নির্ধারিত হবে! সবাই মিলে চাপ দিলে সমাধানও বলবে—'ঠিক আছে, আসছি!'",
    cta: "এখনই ভোট দিন",
    link: "/issues",
    gradient: "from-neon-blue to-neon-green",
  },
] as const;

const AUTOPLAY_MS = 4800;

/* 🚀 Premium lag-free slide animation with GPU acceleration */
const getSlideVariant = (direction: number) => ({
  initial: {
    x: direction > 0 ? "100%" : "-100%", // Enter from right if forward, left if backward
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
  },
  animate: {
    x: "0%",
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const, // Premium easing curve (easeOutExpo)
      opacity: { duration: 0.3, ease: "easeOut" },
      scale: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      filter: { duration: 0.35 },
    },
  },
  exit: {
    x: direction > 0 ? "-100%" : "100%", // Exit to left if forward, right if backward
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
    transition: {
      duration: 0.4,
      ease: [0.64, 0, 0.78, 0] as const, // Premium easeInExpo
      opacity: { duration: 0.2, ease: "easeIn" },
      scale: { duration: 0.35, ease: [0.64, 0, 0.78, 0] as const },
      filter: { duration: 0.3 },
    },
  },
});

export default function HeroSection(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const slidesCount = SLIDES.length;

  const [totalIssues, setTotalIssues] = useState<number | null>(null);
  const [resolvedCount, setResolvedCount] = useState<number | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);

  const autoplayTimer = useRef<number | null>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);

  /* API Stats */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/issues/stats');
        setTotalIssues(data.totalIssues);
        setResolvedCount(data.resolvedIssues);
        setActiveUsers(data.totalUsers);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };

    fetchStats();
  }, []);

  /* Autoplay */
  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) window.clearTimeout(autoplayTimer.current);
    autoplayTimer.current = window.setTimeout(() => {
      if (!isPaused.current && !isDragging.current) {
        setDirection(1); // Always forward for autoplay
        setIdx((s) => (s + 1) % slidesCount);
      }
    }, AUTOPLAY_MS);
  }, [slidesCount]);

  const stopAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      window.clearTimeout(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [idx, startAutoplay, stopAutoplay]);

  /* Hover pause */
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pause = () => {
      isPaused.current = true;
      stopAutoplay();
    };
    const resume = () => {
      isPaused.current = false;
      startAutoplay();
    };

    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);

    return () => {
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
    };
  }, [startAutoplay, stopAutoplay]);

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setDirection(1);
        setIdx((s) => (s + 1) % slidesCount);
      }
      if (e.key === "ArrowLeft") {
        setDirection(-1);
        setIdx((s) => (s - 1 + slidesCount) % slidesCount);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slidesCount]);

  /* Drag */
  const handleDragStart = () => {
    isDragging.current = true;
    stopAutoplay();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDragging.current = false;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    const threshold = 80;

    if (Math.abs(velocity) > 700) {
      if (velocity < 0) {
        setDirection(1); // Swiped left = go forward
        setIdx((s) => (s + 1) % slidesCount);
      } else {
        setDirection(-1); // Swiped right = go backward
        setIdx((s) => (s - 1 + slidesCount) % slidesCount);
      }
    } else {
      if (offset < -threshold) {
        setDirection(1);
        setIdx((s) => (s + 1) % slidesCount);
      } else if (offset > threshold) {
        setDirection(-1);
        setIdx((s) => (s - 1 + slidesCount) % slidesCount);
      }
    }

    startAutoplay();
  };

  const active = SLIDES[idx];

  return (
    <section
      ref={containerRef}
      className="relative min-h-[520px] md:min-h-[700px] overflow-hidden"
      aria-roledescription="carousel"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-6 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="relative w-full overflow-hidden min-h-[340px] flex items-center justify-center">
          {/* Left Arrow */}
          <button
            onClick={() => {
              setDirection(-1);
              setIdx((s) => (s - 1 + slidesCount) % slidesCount);
            }}
            aria-label="Previous slide"
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue flex items-center justify-center text-white shadow-lg hover:shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all active:scale-95 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => {
              setDirection(1);
              setIdx((s) => (s + 1) % slidesCount);
            }}
            aria-label="Next slide"
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-neon-cyan to-neon-blue flex items-center justify-center text-white shadow-lg hover:shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all active:scale-95 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-0.5 transition-transform"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing select-none"
            style={{
              willChange: "transform",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                variants={getSlideVariant(direction)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-4xl mx-auto text-center px-4"
                style={{
                  willChange: "transform, opacity, filter",
                  transform: "translate3d(0,0,0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                <div
                  className="inline-block px-6 py-2 rounded-full bg-white/90 border-2 border-primary/40 mb-6 shadow-lg"
                >
                  <span className="text-sm font-semibold text-sky-800">
                    {active.subtitle}
                  </span>
                </div>

                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-sky-900 drop-shadow-sm"
                  style={{ lineHeight: 1.02 }}
                >
                  {active.title}
                </h1>

                <p className="text-lg md:text-xl text-sky-800 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {active.description}
                </p>

                <Link
                  to={active.link}
                  className="inline-block px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-lg bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-transform shadow-lg"
                >
                  {active.cta}
                </Link>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > idx ? 1 : -1);
                setIdx(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-primary shadow-lg" : "w-2 bg-sky-400 hover:bg-primary/70"
                }`}
            />
          ))}
        </div>
      </div>

      {/* STATS (unchanged) */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <motion.div className="glass-card p-6 text-center hover:neon-border transition">
            <TrendingUp className="mx-auto mb-3 text-neon-cyan" size={36} />
            <h3 className="text-3xl font-bold text-primary mb-1">
              {totalIssues ?? "—"}
            </h3>
            <p className="text-muted-foreground">মোট সমস্যা রিপোর্ট</p>
          </motion.div>

          <motion.div className="glass-card p-6 text-center hover:neon-border transition">
            <Users className="mx-auto mb-3 text-neon-purple" size={36} />
            <h3 className="text-3xl font-bold text-secondary mb-1">
              {activeUsers ?? "—"}
            </h3>
            <p className="text-muted-foreground">সক্রিয় সদস্য</p>
          </motion.div>

          <motion.div className="glass-card p-6 text-center hover:neon-border transition">
            <CheckCircle2 className="mx-auto mb-3 text-neon-green" size={36} />
            <h3 className="text-3xl font-bold text-accent mb-1">
              {resolvedCount ?? "—"}
            </h3>
            <p className="text-muted-foreground">সমাধান হয়েছে</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
