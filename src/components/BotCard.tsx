
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Eye, Heart, Users, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    avatar: string | null;
    category: string;
    rating: number | null;
    price: number | null;
    price_type: string | null;
    description: string | null;
    creator_id: string;
    creator_username?: string;
    subscribers?: number;
    isAvr: boolean;
    isLiked?: boolean;
    botora_creator_id?: string | null;
  };
  onChatClick?: (botId: string) => void;
}

const BotCard = ({ bot, onChatClick }: BotCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(bot.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);

  const formatPrice = (price: number | null, priceType: string | null) => {
    if (!price || price === 0) return "Free";
    const formattedPrice = `$${price}`;
    return priceType === 'subscription' ? `${formattedPrice}/mo` : formattedPrice;
  };
  
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add bots to your wishlist",
        variant: "destructive",
      });
      return;
    }
    
    setIsLiking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('toggle-wishlist', {
        body: { botId: bot.id },
      });
      
      if (error) throw error;
      
      setIsLiked(data.isLiked);
      toast({
        title: data.isLiked ? "Added to wishlist" : "Removed from wishlist",
        description: data.isLiked 
          ? `${bot.name} has been added to your wishlist` 
          : `${bot.name} has been removed from your wishlist`,
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast({
        title: "Action failed",
        description: "Could not update your wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChatClick?.(bot.id);
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <Avatar className="w-12 h-12">
            {bot.avatar && bot.avatar.startsWith('http') ? (
              <AvatarImage src={bot.avatar} alt={bot.name} />
            ) : (
              <AvatarFallback className="text-2xl bg-white/10 border-white/20">
                {bot.avatar || '🤖'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex gap-2">
            {bot.isAvr && (
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                AR/VR
              </Badge>
            )}
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              {bot.category}
            </Badge>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
            {bot.name || "Unnamed Bot"}
          </h3>
          <p className="text-sm text-slate-400">
            by {bot.botora_creator_id ? "Botora" : (bot.creator_username || "Unknown Creator")}
          </p>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{bot.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-slate-400">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
              <span>{bot.rating || 0}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{(bot.subscribers || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-white">{formatPrice(bot.price, bot.price_type)}</div>
        <div className="flex gap-2">
          {onChatClick && (
            <Button 
              variant="default" 
              size="sm" 
              className="text-white hover:bg-primary/90 px-3"
              onClick={handleChatClick}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`${isLiked ? 'text-red-500' : 'text-slate-400'} hover:text-white hover:bg-white/10 p-2`}
            onClick={handleLikeToggle}
            disabled={isLiking}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 p-2">
            <Link to={`/bot/${bot.id}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BotCard;
