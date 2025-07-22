
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AuthPrompt from "@/components/AuthPrompt";

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
  variant?: "vertical" | "horizontal";
}

const BotCard = ({ bot, onChatClick, variant = "vertical" }: BotCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(bot.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptType, setAuthPromptType] = useState<"wishlist" | "chat">("wishlist");

  const formatPrice = (price: number | null, priceType: string | null) => {
    if (!price || price === 0) return "Free";
    const formattedPrice = `$${price}`;
    return priceType === 'subscription' ? `${formattedPrice}/mo` : formattedPrice;
  };
  
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setAuthPromptType("wishlist");
      setShowAuthPrompt(true);
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
    
    if (!user) {
      setAuthPromptType("chat");
      setShowAuthPrompt(true);
      return;
    }
    
    onChatClick?.(bot.id);
  };

  if (variant === "horizontal") {
    return (
      <Link to={`/bot/${bot.id}`} className="block">
        <Card className="bg-card/60 border-border/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 cursor-pointer group overflow-hidden h-20 md:h-28">
          <CardContent className="p-3 md:p-4 h-full">
            <div className="flex gap-4 h-full">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-12 h-12 md:w-20 md:h-20 ring-1 ring-border/30">
                  {bot.avatar && bot.avatar.startsWith('http') ? (
                    <AvatarImage src={bot.avatar} alt={bot.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="text-sm md:text-lg bg-muted text-muted-foreground">
                      {bot.avatar || '🤖'}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-xs md:text-sm mb-1 truncate">
                    {bot.name || "Unnamed Bot"}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1 md:mb-2">
                    By @{bot.botora_creator_id ? "Botora" : (bot.creator_username || "Unknown")}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 md:line-clamp-2">
                    {bot.description || "No description available"}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-1 md:mt-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <MessageCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span>{(bot.subscribers || 0) > 1000000 ? `${(bot.subscribers / 1000000).toFixed(1)}m` : `${(bot.subscribers || 0) / 1000}k`}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`h-5 w-5 md:h-6 md:w-6 p-0 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={handleLikeToggle}
                      disabled={isLiking}
                    >
                      <Heart className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <AuthPrompt 
          isOpen={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          trigger={authPromptType}
          botName={bot.name}
        />
      </Link>
    );
  }

  return (
    <Link to={`/bot/${bot.id}`} className="block">
      <Card className="bg-card/40 border-border/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer group overflow-hidden">
        <CardHeader className="pb-4 pt-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <Avatar className="w-20 h-20 ring-2 ring-border/20 group-hover:ring-primary/30 transition-all duration-300">
              {bot.avatar && bot.avatar.startsWith('http') ? (
                <AvatarImage src={bot.avatar} alt={bot.name} className="object-cover" />
              ) : (
                <AvatarFallback className="text-2xl bg-muted border-border/20 text-muted-foreground">
                  {bot.avatar || '🤖'}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                {bot.name || "Unnamed Bot"}
              </h3>
              <p className="text-xs text-muted-foreground">
                by {bot.botora_creator_id ? "Botora" : (bot.creator_username || "Unknown")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2 text-center leading-relaxed">
              {bot.description || "No description available"}
            </p>
            
            <div className="flex items-center justify-center gap-3">
              <Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20">
                {bot.category}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span>{bot.rating || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{(bot.subscribers || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-2">
          <div className="w-full flex items-center justify-between">
            <div className="font-semibold text-foreground">
              {formatPrice(bot.price, bot.price_type)}
            </div>
            
            <div className="flex items-center gap-1">
              {onChatClick && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                  onClick={handleChatClick}
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Chat
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={handleLikeToggle}
                disabled={isLiking}
              >
                <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      <AuthPrompt 
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        trigger={authPromptType}
        botName={bot.name}
      />
    </Link>
  );
};

export default BotCard;
