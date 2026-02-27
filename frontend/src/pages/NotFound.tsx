import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-[#0a0f1c] flex items-center justify-center overflow-hidden relative selection:bg-primary/30">

      {/* Background Animated Elements */}
      <div className="absolute inset-0 w-full h-full">
        {/* Soft glowing orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[150px]"
        />

        {/* Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6TTAgMHY0MGgxVDB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+Cjwvc3ZnPg==')] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center justify-center text-center">

        {/* Main 404 Visual */}
        <div className="relative mb-8 md:mb-12 select-none group">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1.2 }}
            className="text-[120px] md:text-[200px] lg:text-[250px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20 drop-shadow-[0_0_80px_rgba(255,255,255,0.2)]"
          >
            404
          </motion.div>

          {/* Glass Overlay Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full"
          >
            <div className="backdrop-blur-md bg-white/5 border border-white/10 mx-auto w-max px-8 py-3 rounded-full flex items-center gap-3 shadow-2xl">
              <AlertCircle className="text-red-400" size={24} />
              <span className="text-white/90 font-medium text-lg md:text-xl tracking-wide uppercase">Page Not Found</span>
            </div>
          </motion.div>
        </div>

        {/* Messaging */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-2xl mx-auto mb-12 space-y-4"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-white">
            আরে না! আপনি ভুল রাস্তায় চলে এসেছেন
          </h2>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed">
            আপনি যে পেজটি খুঁজছেন সেটি অস্তিত্বহীন, মুছে ফেলা হয়েছে অথবা এর নাম পরিবর্তন করা হয়েছে।
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 group backdrop-blur-sm"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            আগের পেজে যান
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto relative px-8 py-4 rounded-xl bg-white text-[#0a0f1c] font-bold overflow-hidden group hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
            <Home size={20} className="text-[#0a0f1c]" />
            হোমপেজে ফিরে যান
          </button>
        </motion.div>

      </div>

      {/* Decorative Bottom Glow */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
    </div>
  );
};

export default NotFound;
