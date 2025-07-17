
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useCrossAppAuth } from "@/hooks/useCrossAppAuth";
import { AppSidebar, SidebarToggle } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import BotDetails from "./pages/BotDetails";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorStudio from "./pages/CreatorStudio";
import CreateBot from "./pages/CreateBot";
import Auth from "./pages/Auth";
import { UserProfile } from "./components/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isHandlingAuth } = useCrossAppAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  if (isHandlingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-pulse mb-4">🔄</div>
          <div>Authenticating across apps...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <h1 className="text-lg font-semibold">Botora</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/bot/:id" element={<BotDetails />} />
            <Route path="/creator/:id" element={<CreatorProfile />} />
            <Route path="/creator" element={
              <ProtectedRoute>
                <CreatorStudio />
              </ProtectedRoute>
            } />
            <Route path="/creator/new-bot" element={
              <ProtectedRoute>
                <CreateBot />
              </ProtectedRoute>
            } />
            <Route path="/creator/edit-bot/:id" element={
              <ProtectedRoute>
                <CreateBot />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
