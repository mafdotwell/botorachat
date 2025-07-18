
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useCrossAppAuth } from "@/hooks/useCrossAppAuth";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import BotDetails from "./pages/BotDetails";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorStudio from "./pages/CreatorStudio";
import CreateBot from "./pages/CreateBot";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import { UserProfile } from "./components/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isHandlingAuth } = useCrossAppAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatBot, setSelectedChatBot] = useState<string>("");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const openChatWithBot = (botId: string) => {
    setSelectedChatBot(botId);
    setIsChatOpen(true);
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
    <div className="h-screen flex w-full bg-background overflow-hidden">
      <AppSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onChatToggle={toggleChat}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSidebarToggle={toggleSidebar} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Index isChatOpen={isChatOpen} onChatToggle={toggleChat} selectedChatBot={selectedChatBot} onChatWithBot={openChatWithBot} />} />
            <Route path="/marketplace" element={<Marketplace onChatWithBot={openChatWithBot} />} />
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
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
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
