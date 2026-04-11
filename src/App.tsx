import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./lib/store";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Releases from "./pages/Releases";
import NewRelease from "./pages/NewRelease";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Moderation from "./pages/admin/Moderation";
import Users from "./pages/admin/Users";
import Statistics from "./pages/admin/Statistics";
import Statuses from "./pages/admin/Statuses";
import Fields from "./pages/admin/Fields";
import LoginCustomization from "./pages/admin/LoginCustomization";
import Settings from "./pages/admin/Settings";
import Export from "./pages/admin/Export";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'artist' }) => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  
  return <Layout>{children}</Layout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="dark" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Artist Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/releases" element={<ProtectedRoute><Releases /></ProtectedRoute>} />
          <Route path="/new-release" element={<ProtectedRoute><NewRelease /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/moderation" element={<ProtectedRoute role="admin"><Moderation /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
          <Route path="/admin/statistics" element={<ProtectedRoute role="admin"><Statistics /></ProtectedRoute>} />
          <Route path="/admin/statuses" element={<ProtectedRoute role="admin"><Statuses /></ProtectedRoute>} />
          <Route path="/admin/fields" element={<ProtectedRoute role="admin"><Fields /></ProtectedRoute>} />
          <Route path="/admin/login-customization" element={<ProtectedRoute role="admin"><LoginCustomization /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />
          <Route path="/admin/export" element={<ProtectedRoute role="admin"><Export /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;