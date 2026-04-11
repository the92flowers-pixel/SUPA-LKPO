import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  LogOut, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  Palette, 
  ListTodo,
  Layers,
  Users as UsersIcon,
  Music,
  Bell,
  Menu,
  X,
  LayoutGrid
} from 'lucide-react';
import { useAuthStore, useUIStore, useDataStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { releases } = useDataStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const artistLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/releases', icon: Music, label: 'Мої релізи' },
    { to: '/new-release', icon: PlusCircle, label: 'Новий реліз' },
    { to: '/profile', icon: User, label: 'Профіль' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutGrid, label: 'Огляд' },
    { to: '/admin/moderation', icon: ShieldCheck, label: 'Модерація' },
    { to: '/admin/users', icon: UsersIcon, label: 'Користувачі' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Статистика' },
    { to: '/admin/statuses', icon: ListTodo, label: 'Статуси' },
    { to: '/admin/fields', icon: Layers, label: 'Поля' },
    { to: '/admin/login-customization', icon: Palette, label: 'Дизайн входу' },
    { to: '/admin/settings', icon: Settings, label: 'Налаштування' },
  ];

  const links = user?.role === 'admin' ? adminLinks : artistLinks;
  
  const notifications = React.useMemo(() => {
    if (!user) return [];
    return releases
      .filter(r => r.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        title: `Реліз: ${r.title}`,
        description: `Поточний статус: ${r.status}`,
        time: 'Оновлено'
      }));
  }, [releases, user]);

  return (
    <div className="min-h-screen bg-transparent text-[#e5e5e5] flex">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <h1 className="text-lg font-black text-red-700 tracking-[0.3em] uppercase">ЖУРБА</h1>
          <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500" onClick={toggleSidebar}>
            <X size={20} />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 group",
                location.pathname === link.to 
                  ? "bg-red-900/10 text-red-500 border-l-2 border-red-700" 
                  : "hover:bg-white/5 text-zinc-500 hover:text-zinc-200"
              )}
            >
              <link.icon size={18} className={cn(
                "transition-colors",
                location.pathname === link.to ? "text-red-600" : "group-hover:text-red-600"
              )} />
              <span className="text-xs font-bold uppercase tracking-widest">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-none bg-red-800 flex items-center justify-center text-xs font-bold">
              {user?.login[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider truncate">{user?.artistName || user?.login}</p>
              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 hover:bg-red-900/10 rounded-none"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-3" />
            Вийти
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-10 sticky top-0 z-40">
          <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500" onClick={toggleSidebar}>
            <Menu size={20} />
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:text-red-600 transition-colors">
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#0a0a0a] border-zinc-800 p-0 text-white rounded-none shadow-2xl" align="end">
                <div className="p-5 border-b border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest">Сповіщення</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-5 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                        <p className="text-xs font-bold uppercase tracking-wider group-hover:text-red-500 transition-colors">{n.title}</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">{n.description}</p>
                        <p className="text-[9px] text-red-800 mt-3 uppercase font-black tracking-widest">{n.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                      Порожнеча
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;