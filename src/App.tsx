import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./lib/store";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewRelease from "./pages/NewRelease";
import Moderation from "./pages/admin/Moderation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'artist' }) => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  
  return <Layout>{children}</Layout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" theme="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Artist Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/new-release" element={<ProtectedRoute><NewRelease /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><div>Профіль (Динамічна форма)</div></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin/moderation" element={<ProtectedRoute role="admin"><Moderation /></ProtectedRoute>} />
          <Route path="/admin/statistics" element={<ProtectedRoute role="admin"><div>Керування статистикою</div></ProtectedRoute>} />
          <Route path="/admin/statuses" element={<ProtectedRoute role="admin"><div>Управління статусами</div></ProtectedRoute>} />
          <Route path="/admin/fields" element={<ProtectedRoute role="admin"><div>Управління полями</div></ProtectedRoute>} />
          <Route path="/admin/login-customization" element={<ProtectedRoute role="admin"><div>Кастомізація входу</div></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><div>Налаштування сайту</div></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;