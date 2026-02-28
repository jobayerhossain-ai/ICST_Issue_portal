import { motion, Variants } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  LogOut,
  Users,
  Shield,
  MessageSquare,
  Bell,
  Settings,
  BookOpen,
  BarChart,
  Lock,
  Mail
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Issues Filter', url: '/admin/manage-issues', icon: FileText },
  { title: 'Add Issue', url: '/admin/add-issue', icon: PlusCircle },
  { title: 'Pending Issues', url: '/admin/pending', icon: BarChart3 },
  { title: 'Vote Monitor', url: '/admin/vote-monitor', icon: BarChart3 },
  { title: 'User Management', url: '/admin/users', icon: Users },
  { title: 'Staff Management', url: '/admin/staff', icon: Shield },
  { title: 'Push & Email', url: '/admin/communications', icon: Bell },
  { title: 'Emergency Control', url: '/admin/emergency', icon: Lock },
  // Placeholders for future features
  { title: 'Reports & Analytics', url: '/admin/reports', icon: BarChart },
  { title: 'Email Settings', url: '/admin/email-settings', icon: Mail },
  { title: 'System Config', url: '/admin/config', icon: Settings },
  { title: 'Audit Logs', url: '/admin/audit', icon: FileText },
  { title: 'Knowledge Base', url: '/admin/kb', icon: BookOpen },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Sidebar className={`${open ? 'w-72' : 'w-20'} transition-all duration-500 border-r border-white/20 bg-white/40 backdrop-blur-2xl shadow-2xl overflow-hidden`}>
      <SidebarContent className="bg-transparent">

        {/* Header - Premium Look */}
        <div className="p-6 mb-2">
          {open ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 py-2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <img src="/logo.png" className="h-12 w-12 shadow-2xl rounded-2xl relative z-10 border border-white/40" />
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-slate-800 tracking-tight leading-tight">ADMIN <span className="text-primary italic">PORTAL</span></h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 opacity-70">Control Tower</p>
              </div>
            </motion.div>
          ) : (
            <div className="relative py-2">
              <img src="/logo.png" className="h-10 w-10 shadow-xl rounded-xl mx-auto border border-white/40" />
            </div>
          )}
        </div>

        {/* User Info - Premium Card */}
        {open && user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 mb-6"
          >
            <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-slate-200/20">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-purple-600 p-0.5 shadow-lg shadow-primary/20">
                  <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
                    <span className="text-primary font-black text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-800 truncate leading-tight">{user.email?.split('@')[0]}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">Administrator</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation - Apple-style List */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-4">Management Dashboard</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white/60 hover:text-primary transition-all duration-300 font-medium group"
                      activeClassName="bg-primary shadow-lg shadow-primary/20 text-white font-bold hover:bg-primary"
                    >
                      <div className={`p-2 rounded-lg transition-colors ${location.pathname === item.url ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-primary/10'}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      {open && <span className="text-sm tracking-tight">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout - Premium Destructive Button */}
        <div className="mt-auto p-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300
              ${open
                ? 'bg-rose-50 hover:bg-rose-100/80 text-rose-600 border border-rose-100 hover:border-rose-200'
                : 'justify-center text-rose-500 hover:bg-rose-50'
              }`}
          >
            <LogOut className="h-5 w-5" />
            {open && <span className="font-black text-xs uppercase tracking-widest">Logout System</span>}
          </motion.button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
