import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "প্রথম পাতা", path: "/" },
    { name: "সমস্যাসমূহ", path: "/issues" },
    { name: "সমস্যা জানান", path: "/submit" },
    { name: "পরিচিতি", path: "/about" },
    { name: "যোগাযোগ", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  /** 🍏 iOS smooth slide (no flicker) */
  const menuVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.32,
        ease: [0.25, 0.9, 0.35, 1] as const,
      },
    },
    closed: {
      opacity: 0,
      y: -12,
      transition: {
        duration: 0.22,
        ease: [0.25, 0.9, 0.35, 1] as const,
      },
    },
  };

  return (
    <nav className="glass-card sticky top-0 z-[60] border-b border-border backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="আইসিএসটি সমস্যা পোর্টাল" className="h-12 w-12 neon-glow" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-primary">আইসিএসটি সমস্যা পোর্টাল</h1>
              <p className="text-xs text-muted-foreground">সম্প্রদায়ের মতামত</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive(link.path)
                  ? "bg-primary/10 text-primary neon-border"
                  : "text-foreground hover:bg-muted hover:text-primary"
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
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU — FLICKER-FREE */}
        <AnimatePresence mode="popLayout">
          {isOpen && (
            <motion.div
              key="mobile-menu"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden pb-4"
              style={{
                willChange: "opacity, transform",
                transformOrigin: "top",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="flex flex-col gap-2 mt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${isActive(link.path)
                      ? "bg-primary/10 text-primary neon-border"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile User Auth Links */}
                <MobileUserAuthSection onClose={() => setIsOpen(false)} />
              </div>
            </motion.div>
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

// Mobile User Authentication Section
const MobileUserAuthSection = ({ onClose }: { onClose: () => void }) => {
  const { user, logout, isUser, isAdmin } = useAuth();

  if (!user) {
    return (
      <>
        <Link
          to="/user/login"
          onClick={onClose}
          className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition"
        >
          লগইন
        </Link>
        <Link
          to="/user/register"
          onClick={onClose}
          className="px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition"
        >
          রেজিস্টার
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200 mt-2">
        {user.name} ({user.roll})
      </div>
      {isUser && (
        <Link
          to="/user/dashboard"
          onClick={onClose}
          className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition"
        >
          ইউজার প্যানেল
        </Link>
      )}
      {isAdmin && (
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="px-4 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition"
        >
          এডমিন প্যানেল
        </Link>
      )}
      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>লগআউট</span>
      </button>
    </>
  );
};

export default Navbar;
