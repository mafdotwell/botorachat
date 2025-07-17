
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
    <header className="border-b border-white/10 backdrop-blur-md bg-black/20 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/968a6fad-b2c2-479b-ab85-0fa7f903d03b.png" 
              alt="Botora Logo" 
              className="w-10 h-10 rounded-lg bg-white/10 p-1"
            />
            <span className="text-2xl font-bold text-white">Botora</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {user && (
              <Link to="/creator" className="text-slate-300 hover:text-white transition-colors flex items-center">
                <Palette className="w-4 h-4 mr-1" />
                Creator Studio
              </Link>
            )}
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
