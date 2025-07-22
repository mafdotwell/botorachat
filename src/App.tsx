import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useCrossAppAuth } from "@/hooks/useCrossAppAuth";
import Header from "@/components/Header";
import FloatingHelpBot from "@/components/FloatingHelpBot";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import MarketplaceComingSoon from "./pages/MarketplaceComingSoon";
import BotDirectory from "./pages/BotDirectory";
import BotDetails from "./pages/BotDetails";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorStudio from "./pages/CreatorStudio";
import CreateBot from "./pages/CreateBot";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import DebateRooms from "./pages/DebateRooms";
import DebateRoom from "./components/DebateRoom";
import { UserProfile } from "./components/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isHandlingAuth } = useCrossAppAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatBot, setSelectedChatBot] = useState<string>("");

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
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Header - hidden on mobile, visible on desktop */}
      <Header className="hidden md:block" />

      {/* Main content area with mobile padding */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Index isChatOpen={isChatOpen} onChatToggle={toggleChat} selectedChatBot={selectedChatBot} onChatWithBot={openChatWithBot} />} />
            <Route path="/marketplace" element={<MarketplaceComingSoon />} />
            <Route path="/bot-directory" element={<BotDirectory onChatWithBot={openChatWithBot} />} />
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
            <Route path="/debates" element={<DebateRooms />} />
            <Route path="/debate/:roomId" element={<DebateRoom />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Global Floating Help Bot */}
      <FloatingHelpBot />
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
