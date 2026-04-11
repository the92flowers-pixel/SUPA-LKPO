import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, User, LogOut, ShieldCheck, BarChart3, Settings, 
  Palette, ListTodo, Layers, Users as UsersIcon, Music, Bell, Menu, X, LayoutGrid, Share2, Disc, Link2, Globe, Wallet, FileText
} from 'lucide-react';
import { useAuthStore, useUIStore, useDataStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { adminPanelConfig } = useDataStore();
  const location = useLocation();
  const navigate = useNavigate();

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
    { to: '/admin/statuses', icon: ListTodo, label: 'Статуси' },
    { to: '/admin/fields', icon: Layers, label: 'Поля' },
    { to: '/admin/label-socials', icon: Share2, label: 'Соцмережі лейбла' },
    { to: '/admin/login-customization', icon: Palette, label: 'Дизайн входу' },
    { to: '/admin/settings', icon: Settings, label: 'Налаштування' },
  ];

  const links = user?.role === 'admin' ? adminLinks : artistLinks;

  return (
    <div className="min-h-screen bg-transparent text-[#e5e5e5] flex">
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0", !sidebarOpen && "-translate-x-full")}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-lg font-black tracking-[0.3em] uppercase" style={{ color: adminPanelConfig.accentColor }}>{adminPanelConfig.logoText}</h1>
          <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500" onClick={toggleSidebar}><X size={20} /></Button>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={cn("flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 group border-l-2", location.pathname === link.to ? "bg-white/5 text-white" : "hover:bg-white/5 text-zinc-500 hover:text-zinc-200 border-transparent")} style={{ borderLeftColor: location.pathname === link.to ? adminPanelConfig.accentColor : 'transparent' }}>
              <link.icon size={18} style={{ color: location.pathname === link.to ? adminPanelConfig.accentColor : undefined }} />
              <span className="text-xs font-bold uppercase tracking-widest">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 mb-4 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="w-8 h-8 rounded-none flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: adminPanelConfig.accentColor }}>{user?.login[0].toUpperCase()}</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider truncate group-hover:text-white transition-colors">{user?.artistName || user?.login}</p>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{user?.role}</p>
            </div>
          </Link>
          <Button variant="ghost" className="w-full justify-start text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 rounded-none" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={16} className="mr-3" /> Вийти
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-40">
          <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500" onClick={toggleSidebar}><Menu size={20} /></Button>
        </header>
        <main className="flex-1 overflow-auto p-10 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;