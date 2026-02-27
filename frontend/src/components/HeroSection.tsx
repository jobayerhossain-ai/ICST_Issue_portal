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

/* ========================================================================
   PERFORMANCE-FIRST ANIMATIONS
   - Mobile: NO filter/blur animations — only transform + opacity (GPU-only)
   - Desktop: Full premium blur transitions
   ======================================================================== */

// Detect mobile once at module level to avoid re-checks
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

const getSlideVariant = (direction: number) => ({
  initial: {
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: isMobile ? 1 : 1.05,
    // NO filter on mobile — saves massive GPU cycles
    ...(isMobile ? {} : { filter: "blur(8px)" }),
  },
  animate: {
    x: "0%",
    opacity: 1,
    scale: 1,
    ...(isMobile ? {} : { filter: "blur(0px)" }),
    transition: {
      x: {
        type: "spring",
        stiffness: isMobile ? 300 : 180,  // Snappier on mobile
        damping: isMobile ? 30 : 24,
        mass: isMobile ? 0.8 : 1.2,
        restDelta: 0.001,
      } as const,
      opacity: { duration: isMobile ? 0.2 : 0.4, ease: "easeOut" },
      scale: { duration: isMobile ? 0.2 : 0.4, ease: "easeOut" },
      ...(isMobile ? {} : { filter: { duration: 0.4 } }),
      staggerChildren: isMobile ? 0.04 : 0.08,
      delayChildren: isMobile ? 0.05 : 0.1,
    },
  },
  exit: {
    x: direction > 0 ? "-30%" : "30%",
    opacity: 0,
    scale: isMobile ? 1 : 0.95,
    ...(isMobile ? {} : { filter: "blur(4px)" }),
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 } as const,
      opacity: { duration: isMobile ? 0.15 : 0.3 },
      scale: { duration: isMobile ? 0.15 : 0.3 },
      ...(isMobile ? {} : { filter: { duration: 0.3 } }),
    },
  },
});

const contentVariants = {
  initial: {
    opacity: 0,
    y: isMobile ? 15 : 30,
    // NO filter on mobile
    ...(isMobile ? {} : { filter: "blur(4px)" }),
  },
  animate: {
    opacity: 1,
    y: 0,
    ...(isMobile ? {} : { filter: "blur(0px)" }),
    transition: {
      type: "spring" as const,
      stiffness: isMobile ? 250 : 150,
      damping: isMobile ? 25 : 20,
      mass: isMobile ? 0.6 : 1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    ...(isMobile ? {} : { filter: "blur(4px)" }),
    transition: { duration: isMobile ? 0.1 : 0.2 },
  },
};

export default function HeroSection(): JSX.Element {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
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
        setDirection(1);
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
        setDirection(1);
        setIdx((s) => (s + 1) % slidesCount);
      } else {
        setDirection(-1);
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
      className="relative min-h-[520px] md:min-h-[700px] overflow-hidden flex flex-col justify-center"
      aria-roledescription="carousel"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80 pointer-events-none" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="relative w-full overflow-hidden min-h-[340px] flex items-center justify-center">
          {/* Left Arrow — Desktop only */}
          <button
            onClick={() => {
              setDirection(-1);
              setIdx((s) => (s - 1 + slidesCount) % slidesCount);
            }}
            aria-label="Previous slide"
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 border border-slate-200 hidden md:flex items-center justify-center text-slate-700 shadow-sm hover:shadow-primary/20 hover:scale-110 hover:bg-white transition-all active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Right Arrow — Desktop only */}
          <button
            onClick={() => {
              setDirection(1);
              setIdx((s) => (s + 1) % slidesCount);
            }}
            aria-label="Next slide"
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/80 border border-slate-200 hidden md:flex items-center justify-center text-slate-700 shadow-sm hover:shadow-primary/20 hover:scale-110 hover:bg-white transition-all active:scale-95 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
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
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                variants={getSlideVariant(direction)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-4xl mx-auto text-center px-4"
                style={{
                  willChange: "transform, opacity",
                  transform: "translate3d(0,0,0)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                }}
              >
                <motion.div variants={contentVariants} className="inline-block px-6 py-2 rounded-full bg-white/80 md:backdrop-blur-md border border-slate-200/50 mb-6 shadow-sm">
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-medium tracking-wide text-sm md:text-base">
                    {active.subtitle}
                  </span>
                </motion.div>

                <motion.h1
                  variants={contentVariants}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-slate-800 drop-shadow-sm"
                  style={{ lineHeight: 1.1 }}
                >
                  {active.title}
                </motion.h1>

                <motion.p variants={contentVariants} className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {active.description}
                </motion.p>

                <motion.div variants={contentVariants}>
                  <Link
                    to={active.link}
                    className="inline-block px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg hover:shadow-primary/40 hover:scale-105 transition-all active:scale-95 border border-primary/20"
                  >
                    {active.cta}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="flex justify-center gap-3 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > idx ? 1 : -1);
                setIdx(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-primary" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
            />
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="container mx-auto px-4 pb-12 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-slate-200 hover:border-primary/20 group">
            <TrendingUp className="mx-auto mb-3 text-cyan-500 group-hover:scale-110 transition-transform" size={36} />
            <h3 className="text-3xl font-bold text-slate-800 mb-1">
              {totalIssues ?? "—"}
            </h3>
            <p className="text-slate-600">মোট সমস্যা রিপোর্ট</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-slate-200 hover:border-primary/20 group">
            <Users className="mx-auto mb-3 text-purple-500 group-hover:scale-110 transition-transform" size={36} />
            <h3 className="text-3xl font-bold text-slate-800 mb-1">
              {activeUsers ?? "—"}
            </h3>
            <p className="text-slate-600">সক্রিয় সদস্য</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow border border-slate-200 hover:border-primary/20 group">
            <CheckCircle2 className="mx-auto mb-3 text-green-500 group-hover:scale-110 transition-transform" size={36} />
            <h3 className="text-3xl font-bold text-slate-800 mb-1">
              {resolvedCount ?? "—"}
            </h3>
            <p className="text-slate-600">সমাধান হয়েছে</p>
          </div>
        </div>
      </div>
    </section>
  );
}
