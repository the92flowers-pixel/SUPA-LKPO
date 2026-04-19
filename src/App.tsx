import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, toAppProfile } from '@/lib/supabase';
import { useAuthStore, useDataStore } from '@/lib/store';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Releases from '@/pages/Releases';
import NewRelease from '@/pages/NewRelease';
import Finances from '@/pages/Finances';
import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
import SmartLinkPage from '@/pages/SmartLinkPage';
import ArtistWebsitePage from '@/pages/ArtistWebsitePage';
import NotFound from '@/pages/NotFound';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import Moderation from '@/pages/admin/Moderation';
import AllReleases from '@/pages/admin/AllReleases';
import AdminFinance from '@/pages/admin/AdminFinance';
import AdminReports from '@/pages/admin/AdminReports';
import SmartLinksManagement from '@/pages/admin/SmartLinksManagement';
import ArtistWebsitesManagement from '@/pages/admin/ArtistWebsitesManagement';
import Users from '@/pages/admin/Users';
import Statistics from '@/pages/admin/Statistics';
import Statuses from '@/pages/admin/Statuses';
import Fields from '@/pages/admin/Fields';
import LabelSocials from '@/pages/admin/LabelSocials';
import LoginCustomization from '@/pages/admin/LoginCustomization';
import Settings from '@/pages/admin/Settings';
import Export from '@/pages/admin/Export';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin h-8 w-8 border-2 border-red-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

const App = () => {
  const { setAuth } = useAuthStore();
  const { init, fetchReleases, fetchSmartLinks, fetchArtistWebsites, fetchTransactions, fetchReports, fetchWithdrawalRequests, fetchUsers } = useDataStore();

  // Init public data (config, statuses, fields)
  useEffect(() => {
    init();
  }, [init]);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setAuth(toAppProfile(profile));
        }
      }
    };
    restoreSession();
  }, [setAuth]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/s/:slug" element={<SmartLinkPage />} />
        <Route path="/a/:slug" element={<ArtistWebsitePage />} />

        {/* Artist Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/releases" element={<ProtectedRoute><Releases /></ProtectedRoute>} />
        <Route path="/new-release" element={<ProtectedRoute><NewRelease /></ProtectedRoute>} />
        <Route path="/finances" element={<ProtectedRoute><Finances /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/moderation" element={<ProtectedRoute role="admin"><Moderation /></ProtectedRoute>} />
        <Route path="/admin/releases" element={<ProtectedRoute role="admin"><AllReleases /></ProtectedRoute>} />
        <Route path="/admin/finance" element={<ProtectedRoute role="admin"><AdminFinance /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;