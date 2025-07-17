
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Search, ExternalLink, Palette, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onChatToggle?: () => void;
}

const Header = ({ onChatToggle }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-white">Botora</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/marketplace" className="text-slate-300 hover:text-white transition-colors">
              Marketplace
            </Link>
            {user && (
              <Link to="/creator" className="text-slate-300 hover:text-white transition-colors flex items-center">
                <Palette className="w-4 h-4 mr-1" />
                Creator Studio
              </Link>
            )}
            <Link to="/docs" className="text-slate-300 hover:text-white transition-colors">
              Documentation
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {onChatToggle && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-300 hover:text-white hover:bg-white/10"
                onClick={onChatToggle}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Wishlist</span>
            </Button>
            
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-300 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
