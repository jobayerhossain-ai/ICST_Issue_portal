import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const backdropRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: "প্রথম পাতা", path: "/" },
    { name: "সমস্যাসমূহ", path: "/issues" },
    { name: "সমস্যা জানান", path: "/submit" },
    { name: "পরিচিতি", path: "/about" },
    { name: "যোগাযোগ", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // ─── BODY SCROLL LOCK ───
  // When the mobile menu opens, lock the body so the background doesn't scroll.
  // This prevents Lenis and native scroll from interfering with touch events.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      // Also tell Lenis to stop if it exists
      document.documentElement.classList.add("lenis-stopped");
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.classList.remove("lenis-stopped");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [isOpen]);

  // ─── CLOSE ON ROUTE CHANGE ───
  // This is the ultimate safety net: if the URL changes, ALWAYS close.
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // ─── PROGRAMMATIC NAVIGATE + CLOSE ───
  // Instead of relying on <Link onClick>, we navigate programmatically.
  // This guarantees the menu closes AND navigation happens in one atomic action.
  const handleNavigate = useCallback(
    (path: string) => {
      setIsOpen(false);
      // Use setTimeout(0) to let the state update flush before navigating,
      // ensuring the menu animation starts closing immediately.
      setTimeout(() => {
        navigate(path);
      }, 0);
    },
    [navigate]
  );

  return (
    <nav className="glass-card fixed top-0 left-0 right-0 z-[60] border-b border-border backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <img src="/logo.png" alt="আইসিএসটি সমস্যা পোর্টাল" className="h-10 w-10 md:h-12 md:w-12 neon-glow" />
            <div className="flex flex-col">
              <h1 className="text-base md:text-xl font-bold text-primary leading-tight">আইসিএসটি সমস্যা পোর্টাল</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">সম্প্রদায়ের মতামত</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => {
                  if (link.path === '/issues') {
                    queryClient.prefetchQuery({
                      queryKey: ['issues'],
                      queryFn: async () => {
                        const { data } = await api.get('/issues');
                        return data;
                      }
                    });
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive(link.path)
                  ? "bg-primary/20 text-primary neon-border shadow-lg shadow-primary/20"
                  : "text-foreground hover:bg-white/10 hover:text-primary transition-all duration-300"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* User Authentication Section */}
            <UserAuthSection />
          </div>

          {/* Mobile menu toggle */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary transition shadow-sm"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════
            🍏 ENTERPRISE-GRADE MOBILE MENU (SIDEBAR)
            - Body scroll locked
            - Programmatic navigation for 100% reliability
            - onPointerDown for instant response
            - data-lenis-prevent to isolate from smooth scroll
        ═══════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop — uses onPointerDown for INSTANT close on touch/click */}
              <motion.div
                ref={backdropRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onPointerDown={(e) => {
                  // Only close if the actual backdrop was tapped (not sidebar)
                  if (e.target === backdropRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                  }
                }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
                style={{ WebkitTapHighlightColor: "transparent" }}
              />

              {/* Sidebar Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                }}
                className="fixed top-0 right-0 h-[100dvh] w-4/5 max-w-[320px] bg-white shadow-2xl border-l border-slate-200/50 z-[100] md:hidden flex flex-col"
                data-lenis-prevent
                style={{
                  WebkitTapHighlightColor: "transparent",
                  overscrollBehavior: "contain",
                }}
              >
                {/* Sidebar Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
                  <span className="font-semibold text-slate-800 tracking-wide">মেনু</span>
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Sidebar Content */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1.5"
                  data-lenis-prevent
                >
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigate(link.path);
                      }}
                      className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all duration-200 flex items-center active:scale-[0.97] ${isActive(link.path)
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                    >
                      {link.name}
                    </button>
                  ))}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <MobileUserAuthSection onNavigate={handleNavigate} />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// User Authentication Section for Desktop
const UserAuthSection = () => {
  const { user, logout, isUser, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return (
      <>
        <Link
          to="/user/login"
          className="px-4 py-2 rounded-lg font-medium text-foreground hover:bg-muted hover:text-primary transition-all"
        >
          লগইন
        </Link>
        <Link
          to="/user/register"
          className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
        >
          রেজিস্টার
        </Link>
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition-all"
      >
        <User className="w-4 h-4" />
        <span>{user.name}</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          {isUser && (
            <Link
              to="/user/dashboard"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              ইউজার প্যানেল
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              এডমিন প্যানেল
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              setShowDropdown(false);
            }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Mobile User Authentication Section — uses onPointerDown + programmatic navigate
const MobileUserAuthSection = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const { user, logout, isUser, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate("/user/login");
          }}
          className="w-full px-5 py-4 rounded-xl font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all text-center border border-slate-200/60 active:scale-[0.97]"
        >
          লগইন
        </button>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate("/user/register");
          }}
          className="w-full px-5 py-4 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-all text-center shadow-lg shadow-primary/20 active:scale-[0.97]"
        >
          রেজিস্টার
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-2 px-4 py-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-500">{user.roll}</p>
      </div>
      {isUser && (
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate("/user/dashboard");
          }}
          className="w-full text-left px-5 py-4 rounded-xl font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all active:scale-[0.97]"
        >
          ইউজার প্যানেল
        </button>
      )}
      {isAdmin && (
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate("/admin/dashboard");
          }}
          className="w-full text-left px-5 py-4 rounded-xl font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-all active:scale-[0.97]"
        >
          এডমিন প্যানেল
        </button>
      )}
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          logout();
          onNavigate("/");
        }}
        className="w-full text-left px-5 py-4 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all flex items-center space-x-2 mt-2 active:scale-[0.97]"
      >
        <LogOut className="w-4 h-4" />
        <span>লগআউট</span>
      </button>
    </div>
  );
};

export default Navbar;
