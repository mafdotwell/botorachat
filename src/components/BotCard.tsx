
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Eye, Heart, Download } from "lucide-react";

interface BotCardProps {
  bot: {
    id: string;
    name: string;
    avatar: string | null;
    category: string;
    rating: number;
    price: string;
    description: string | null;
    creator: string;
    downloads: number;
    isAvr: boolean;
  };
}

const BotCard = ({ bot }: BotCardProps) => {
  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl">{bot.avatar}</div>
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
            {bot.name}
          </h3>
          <p className="text-sm text-slate-400">by {bot.creator}</p>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        <p className="text-slate-300 text-sm mb-4 line-clamp-2">{bot.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-slate-400">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" />
              <span>{bot.rating}</span>
            </div>
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              <span>{bot.downloads.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-white">{bot.price}</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 p-2">
            <Heart className="w-4 h-4" />
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
