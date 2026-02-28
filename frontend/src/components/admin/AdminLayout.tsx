import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ExternalLink, Globe } from "lucide-react";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex w-full">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 flex items-center justify-between border-b border-border glass-card sticky top-0 z-40 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-10 w-10 rounded-xl bg-white/50 hover:bg-white border border-border transition-all shadow-sm hover:shadow-md" />
            <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent hidden sm:block">
              ICST Admin Portal
            </h1>
          </div>

          <a
            href={window.location.origin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-95 text-sm font-semibold group"
          >
            <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>Visit Website</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </header>

        <main className="flex-1">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
