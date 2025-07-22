import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";

import BotCard from "@/components/BotCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Bot {
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
  subscribers: number;
  isAvr: boolean;
}

interface BotDirectoryProps {
  onChatWithBot?: (botId: string) => void;
}

const BotDirectory = ({ onChatWithBot }: BotDirectoryProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    "all", 
    "Education", 
    "Entertainment", 
    "Productivity",
    "Health & Fitness", 
    "Business", 
    "Creative", 
    "Technical", 
    "Lifestyle"
  ];
  
  const sortOptions = ["popular", "rating", "price-low", "price-high", "newest"];

  useEffect(() => {
    fetchPublishedBots();
  }, []);

  const fetchPublishedBots = async () => {
    try {
      // First fetch bots
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('*')
        .eq('is_published', true)
        .order('download_count', { ascending: false });

      if (botsError) throw botsError;

      // Then fetch creator profiles for all bot creators
      const creatorIds = [...new Set(botsData?.map(bot => bot.creator_id) || [])];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', creatorIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of creator_id to username
      const creatorMap = new Map(
        profilesData?.map(profile => [profile.id, profile.username]) || []
      );

      const formattedBots = botsData?.map(bot => ({
        id: bot.id,
        name: bot.name || `Bot ${bot.id.slice(0, 8)}`,
        avatar: bot.avatar || '🤖',
        category: bot.category,
        rating: bot.rating || 0,
        price: bot.price,
        price_type: bot.price_type,
        description: bot.description || '',
        creator_id: bot.creator_id,
        creator_username: creatorMap.get(bot.creator_id),
        subscribers: bot.download_count || 0,
        isAvr: bot.is_avr_compatible || false
      })) || [];

      setBots(formattedBots);
    } catch (error: any) {
      console.error('Error fetching bots:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bots from directory"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (bot.description && bot.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || bot.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center py-20">
          <div className="text-white">Loading bot directory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mobile-container">
      
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">Bot Directory</h1>
          <p className="text-muted-foreground text-sm md:text-lg">Browse and discover amazing AI personalities</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-card/40 border-border/40 backdrop-blur-sm mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI personalities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px] bg-background/50 border-border text-foreground">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select defaultValue="popular">
                <SelectTrigger className="w-full lg:w-[200px] bg-background/50 border-border text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {selectedCategory !== "all" && (
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Active filters:</span>
              <Badge 
                variant="secondary" 
                className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer"
                onClick={() => setSelectedCategory("all")}
              >
                {selectedCategory} ✕
              </Badge>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-400">
            Showing {filteredBots.length} results
          </p>
        </div>

        {/* Bot Grid */}
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
          {filteredBots.map((bot) => (
            <BotCard key={bot.id} bot={bot} onChatClick={onChatWithBot} />
          ))}
        </div>

        {/* Load More */}
        {filteredBots.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Load More Results
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredBots.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No AI personalities found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotDirectory;