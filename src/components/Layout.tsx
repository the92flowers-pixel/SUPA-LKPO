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
  Music
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen } = useUIStore();
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex">
      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-[#1a1a1a] border-r border-white/5 flex flex-col transition-all duration-300",
        !sidebarOpen && "-ml-64"
      )}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-violet-500 tracking-tighter">ЖУРБА MUSIC</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
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
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;