import React, { useEffect, useState } from 'react';
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

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050505]">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin h-10 w-10 border-2 border-red-700 border-t-transparent rounded-full" />
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Завантаження...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

const App = () => {
  const { setAuth } = useAuthStore();
  const { init, fetchReleases, fetchSmartLinks, fetchArtistWebsites, fetchTransactions, fetchReports, fetchUsers, fetchWithdrawalRequests } = useDataStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Init public data (config, statuses, fields)
  useEffect(() => {
    const initApp = async () => {
      try {
        await init();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    initApp();
  }, [init]);

  // Restore session and load user data
  useEffect(() => {
    if (!isInitialized) return;
    
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            // Fetch profile from database
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (!error && profile) {
              // Profile exists - use it
              setAuth(toAppProfile(profile));
              
              // Load user's data
              const userId = session.user.id;
              const userRole = profile.role;
              
              // Fetch all user-related data in parallel
              await Promise.all([
                fetchReleases(userId, userRole),
                fetchSmartLinks(userId),
                fetchArtistWebsites(userId),
                fetchTransactions(userId),
                fetchReports(userId),
                fetchUsers(),
                fetchWithdrawalRequests(),
              ]);
            } else if (error?.code === 'PGRST116') {
              // Profile doesn't exist - create it
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.artist_name || '',
                  role: 'artist',
                  balance: 0,
                  is_verified: false,
                })
                .select()
                .single();
              
              if (!createError && newProfile) {
                setAuth(toAppProfile(newProfile));
              } else {
                // Fallback - use basic user data
                setAuth({
                  id: session.user.id,
                  email: session.user.email || '',
                  login: session.user.email || '',
                  role: 'artist',
                  artistName: session.user.user_metadata?.full_name || session.user.user_metadata?.artist_name || null,
                  balance: 0,
                  isVerified: false,
                  createdAt: session.user.created_at || new Date().toISOString(),
                });
              }
            } else {
              // Other error - use basic user
              setAuth({
                id: session.user.id,
                email: session.user.email || '',
                login: session.user.email || '',
                role: 'artist',
                artistName: session.user.user_metadata?.full_name || session.user.user_metadata?.artist_name || null,
                balance: 0,
                isVerified: false,
                createdAt: session.user.created_at || new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
            // On error, use basic auth
            setAuth({
              id: session.user.id,
              email: session.user.email || '',
              login: session.user.email || '',
              role: 'artist',
              artistName: session.user.user_metadata?.full_name || session.user.user_metadata?.artist_name || null,
              balance: 0,
              isVerified: false,
              createdAt: session.user.created_at || new Date().toISOString(),
            });
          }
        } else {
          // No session - set null
          setAuth(null);
        }
      } catch (error) {
        console.error('Session restoration error:', error);
        setAuth(null);
      }
    };
    
    restoreSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setAuth(toAppProfile(profile));
            // Load data after login
            await Promise.all([
              fetchReleases(session.user.id, profile.role),
              fetchSmartLinks(session.user.id),
              fetchArtistWebsites(session.user.id),
              fetchTransactions(session.user.id),
              fetchReports(session.user.id),
            ]);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuth(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, setAuth, fetchReleases, fetchSmartLinks, fetchArtistWebsites, fetchTransactions, fetchReports, fetchUsers, fetchWithdrawalRequests]);

  // Show loading until initialized
  if (!isInitialized) {
    return <LoadingScreen />;
  }

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