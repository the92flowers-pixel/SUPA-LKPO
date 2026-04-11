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
  X
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
    { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/releases', icon: Music, label: 'Мої релізи' },
    { to: '/new-release', icon: PlusCircle, label: 'Новий реліз' },
    { to: '/profile', icon: User, label: 'Профіль' },
  ];

  const adminLinks = [
    { to: '/admin/moderation', icon: ShieldCheck, label: 'Модерація' },
    { to: '/admin/users', icon: UsersIcon, label: 'Користувачі' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Статистика' },
    { to: '/admin/statuses', icon: ListTodo, label: 'Статуси' },
    { to: '/admin/fields', icon: Layers, label: 'Поля' },
    { to: '/admin/login-customization', icon: Palette, label: 'Дизайн входу' },
    { to: '/admin/settings', icon: Settings, label: 'Налаштування' },
  ];

  const links = user?.role === 'admin' ? adminLinks : artistLinks;
  
  // Mock notifications based on releases
  const notifications = releases
    .filter(r => r.userId === user?.id)
    .slice(0, 3)
    .map(r => ({
      id: r.id,
      title: `Статус релізу: ${r.title}`,
      description: `Ваш реліз зараз має статус "${r.status}"`,
      time: 'Щойно'
    }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-violet-500 tracking-tighter">ЖУРБА MUSIC</h1>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
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
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname === link.to 
                  ? "bg-violet-500/10 text-violet-500" 
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold">
              {user?.login[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.artistName || user?.login}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            Вийти
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
            <Menu size={20} />
          </Button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#1a1a1a] border-white/10 p-0 text-white" align="end">
                <div className="p-4 border-b border-white/5">
                  <h3 className="font-bold">Сповіщення</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                        <p className="text-sm font-bold">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.description}</p>
                        <p className="text-[10px] text-violet-500 mt-2 uppercase font-bold">{n.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      Немає нових сповіщень
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <Button variant="link" className="text-xs text-violet-400">Показати всі</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;