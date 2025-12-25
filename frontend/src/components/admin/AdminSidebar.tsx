import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  LogOut
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
  { title: 'Pending Issues', url: '/admin/pending', icon: FileText },
  { title: 'Add Issue', url: '/admin/add-issue', icon: PlusCircle },
  { title: 'Manage Issues', url: '/admin/manage-issues', icon: FileText },
  { title: 'Vote Monitor', url: '/admin/vote-monitor', icon: BarChart3 },
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
    <Sidebar className={open ? 'w-64' : 'w-14'}>
      <SidebarContent>

        {/* Header */}
        <div className="p-4 border-b border-border">
          {open ? (
            <div className="flex items-center gap-3 mb-2">
              <img src="/logo.png" className="h-10 w-10 neon-glow" />
              <div>
                <h2 className="font-bold text-primary">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Issue Management</p>
              </div>
            </div>
          ) : (
            <img src="/logo.png" className="h-8 w-8 neon-glow mx-auto" />
          )}
        </div>

        {/* User Info */}
        {open && user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <span className="text-primary font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium neon-border"
                    >
                      <item.icon className={open ? 'mr-3 h-5 w-5' : 'h-5 w-5'} />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className={open ? 'h-5 w-5' : 'h-5 w-5 mx-auto'} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
