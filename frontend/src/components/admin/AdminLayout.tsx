import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex w-full">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center border-b border-border glass-card sticky top-0 z-40">
          <SidebarTrigger className="ml-4" />
          <h1 className="ml-4 text-lg font-semibold text-foreground">
            ICST Admin Portal
          </h1>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
