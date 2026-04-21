import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, User, LogOut, ShieldCheck, BarChart3, Settings, 
  Users as UsersIcon, Music, Menu, X, LayoutGrid, Disc, Link2, Globe, Wallet, FileText, ListTodo, ExternalLink
} from 'lucide-react';
import { useAuthStore, useUIStore, useDataStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import AdminHeaderLinks from './AdminHeaderLinks';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { adminPanelConfig } = useDataStore();
  const [dynamicAdminLinks, setDynamicAdminLinks] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchDynamicLinks = async () => {
        const { data } = await supabase
          .from('admin_links')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (data) setDynamicAdminLinks(data);
      };
      fetchDynamicLinks();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const artistLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/releases', icon: Music, label: 'Мої релізи' },
    { to: '/new-release', icon: PlusCircle, label: 'Новий реліз' },
    { to: '/finances', icon: Wallet, label: 'Фінанси' },
    { to: '/reports', icon: FileText, label: 'Звіти' },
    { to: '/profile', icon: User, label: 'Профіль' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutGrid, label: 'Огляд' },
    { to: '/admin/moderation', icon: ShieldCheck, label: 'Модерація' },
    { to: '/admin/releases', icon: Disc, label: 'Всі релізи' },
    { to: '/admin/finance', icon: Wallet, label: 'Фінанси' },
    { to: '/admin/reports', icon: FileText, label: 'Звіти' },
    { to: '/admin/smart-links', icon: Link2, label: 'Смартлінки' },
    { to: '/admin/artist-websites', icon: Globe, label: 'Сайти артистів' },
    { to: '/admin/users', icon: UsersIcon, label: 'Користувачі' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Статистика' },
    { to: '/admin/tasks', icon: ListTodo, label: 'Завдання' },
    { to: '/admin/links', icon: ExternalLink, label: 'Адмін-посилання' },
    { to: '/admin/settings', icon: Settings, label: 'Налаштування' },
  ];

  const links = user?.role === 'admin' ? adminLinks : artistLinks;
  const accentColor = adminPanelConfig?.accentColor || '#ef4444';
  const logoText = adminPanelConfig?.logoText || 'ЖУРБА';

  const getUserName = () => user?.artistName || user?.login || 'Користувач';
  const getUserInitial = () => getUserName()[0]?.toUpperCase() || 'U';

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e5e5] flex flex-col lg:flex-row">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-black/90 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-[0.3em] uppercase" style={{ color: accentColor }}>{logoText}</h1>
          <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500" onClick={toggleSidebar}>
            <X size={24} />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {links.map((link) => (
            <Link 
              key={link.to} 
              to={link.to} 
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-none transition-all duration-300 group border-l-2",
                location.pathname === link.to 
                  ? "bg-white/5 text-white" 
                  : "hover:bg-white/5 text-zinc-500 hover:text-zinc-200 border-transparent"
              )} 
              style={{ borderLeftColor: location.pathname === link.to ? accentColor : 'transparent' }}
            >
              <link.icon size={20} style={{ color: location.pathname === link.to ? accentColor : undefined }} />
              <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
            </Link>
          ))}

          {/* Динамічні адмін-посилання */}
          {user?.role === 'admin' && dynamicAdminLinks.length > 0 && (
            <div className="pt-6 mt-6 border-t border-white/5">
              <p className="px-4 mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Швидкі посилання</p>
              {dynamicAdminLinks.map((link) => (
                <a 
                  key={link.id} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{link.title}</span>
                  <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link to="/profile" onClick={handleLinkClick} className="flex items-center gap-3 px-4 py-4 mb-4 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-none flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: accentColor }}>
              {getUserInitial()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[11px] font-black uppercase tracking-wider truncate group-hover:text-white transition-colors">{getUserName()}</p>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">{user?.role}</p>
            </div>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 rounded-none h-12" 
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-3" /> Вийти
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden text-zinc-400 mr-4" onClick={toggleSidebar}>
              <Menu size={24} />
            </Button>
            <AdminHeaderLinks />
          </div>
          <div className="flex-1 lg:hidden flex justify-center">
            <h1 className="text-sm font-black tracking-[0.3em] uppercase" style={{ color: accentColor }}>{logoText}</h1>
          </div>
          <div className="w-10 lg:hidden" />
        </header>
        
        <main className="flex-1 overflow-x-hidden p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;