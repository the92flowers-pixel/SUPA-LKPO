import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useDataStore } from "./lib/store";
import { supabase } from "./lib/supabase";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Releases from "./pages/Releases";
import NewRelease from "./pages/NewRelease";
import Profile from "./pages/Profile";
import Finances from "./pages/Finances";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Moderation from "./pages/admin/Moderation";
import Users from "./pages/admin/Users";
import Statistics from "./pages/admin/Statistics";
import Statuses from "./pages/admin/Statuses";
import Fields from "./pages/admin/Fields";
import LoginCustomization from "./pages/admin/LoginCustomization";
import Settings from "./pages/admin/Settings";
import Export from "./pages/admin/Export";
import LabelSocials from "./pages/admin/LabelSocials";
import AllReleases from "./pages/admin/AllReleases";
import SmartLinksManagement from "./pages/admin/SmartLinksManagement";
import ArtistWebsitesManagement from "./pages/admin/ArtistWebsitesManagement";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminReports from "./pages/admin/AdminReports";
import SmartLinkPage from "./pages/SmartLinkPage";
import ArtistWebsitePage from "./pages/ArtistWebsitePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'artist' }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

const App = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const fetchInitialData = useDataStore((state) => state.fetchInitialData);

  useEffect(() => {
    // Перевірка поточної сесії
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session);
      }
    });

    // Слухач змін авторизації
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session);
      } else {
        setAuth(null, null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (session: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      const userData = {
        id: profile.id,
        login: profile.email,
        role: profile.role,
        artistName: profile.full_name,
        balance: profile.balance || 0,
        isVerified: profile.is_verified || false,
        createdAt: profile.created_at
      };
      setAuth(userData, session);
      // Завантажуємо дані для цього користувача
      fetchInitialData(profile.id, profile.role);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" theme="dark" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/s/:slug" element={<SmartLinkPage />} />
            <Route path="/a/:slug" element={<ArtistWebsitePage />} />
            
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/releases" element={<ProtectedRoute><Releases /></ProtectedRoute>} />
            <Route path="/new-release" element={<ProtectedRoute><NewRelease /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/moderation" element={<ProtectedRoute role="admin"><Moderation /></ProtectedRoute>} />
            <Route path="/admin/releases" element={<ProtectedRoute role="admin"><AllReleases /></ProtectedRoute>} />
            <Route path="/admin/smart-links" element={<ProtectedRoute role="admin"><SmartLinksManagement /></ProtectedRoute>} />
            <Route path="/admin/artist-websites" element={<ProtectedRoute role="admin"><ArtistWebsitesManagement /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
            <Route path="/admin/statistics" element={<ProtectedRoute role="admin"><Statistics /></ProtectedRoute>} />
            <Route path="/admin/statuses" element={<ProtectedRoute role="admin"><Statuses /></ProtectedRoute>} />
            <Route path="/admin/fields" element={<ProtectedRoute role="admin"><Fields /></ProtectedRoute>} />
            <Route path="/admin/label-socials" element={<ProtectedRoute role="admin"><LabelSocials /></ProtectedRoute>} />
            <Route path="/admin/login-customization" element={<ProtectedRoute role="admin"><LoginCustomization /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />
            <Route path="/admin/export" element={<ProtectedRoute role="admin"><Export /></ProtectedRoute>} />
            <Route path="/admin/finance" element={<ProtectedRoute role="admin"><AdminFinance /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;