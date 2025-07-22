
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, Users, Zap, Eye, Heart, MessageSquare, Scale, Clock, Sparkles, Rocket } from "lucide-react";
import BotCard from "@/components/BotCard";
import ChatWindow from "@/components/ChatWindow";
import MultiBotChat from "@/components/MultiBotChat";
import AuthPrompt from "@/components/AuthPrompt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface IndexProps {
  isChatOpen: boolean;
  onChatToggle: () => void;
  selectedChatBot: string;
  onChatWithBot: (botId: string) => void;
}

const MULTI_BOT_EXPERIENCES = [
  {
    id: "multi-bot",
    title: "Multi-Bot Conversation",
    description: "Watch 2-4 AI personalities interact with each other",
    icon: Users,
    color: "from-indigo-500 to-purple-500"
  }
];

const Index = ({ isChatOpen, onChatToggle, selectedChatBot, onChatWithBot }: IndexProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatMode, setSelectedChatMode] = useState("");
  const [featuredBots, setFeaturedBots] = useState<any[]>([]);
  const [popularBots, setPopularBots] = useState<any[]>([]);
  const [trendingBots, setTrendingBots] = useState<any[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authPromptType, setAuthPromptType] = useState<"debate">("debate");
  const [multiBotChatOpen, setMultiBotChatOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBots: 0,
    totalCreators: 0,
    totalSubscribers: 0,
    satisfaction: 98
  });
  const [categories, setCategories] = useState([
    { name: "Education", icon: "📚", count: 0 },
    { name: "Entertainment", icon: "🎭", count: 0 },
    { name: "Therapy", icon: "💚", count: 0 },
    { name: "Business", icon: "💼", count: 0 }
  ]);

  // Fetch data from database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured bots (highest rated)
        const { data: featuredData, error: featuredError } = await supabase
          .from('bots')
          .select('*')
          .eq('is_published', true)
          .order('rating', { ascending: false })
          .limit(8);

        // Fetch popular bots (most downloads)
        const { data: popularData, error: popularError } = await supabase
          .from('bots')
          .select('*')
          .eq('is_published', true)
          .order('download_count', { ascending: false })
          .limit(8);

        // Fetch trending bots (recently created with good ratings)
        const { data: trendingData, error: trendingError } = await supabase
          .from('bots')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (featuredError || popularError || trendingError) {
          console.error('Error fetching bots:', { featuredError, popularError, trendingError });
          return;
        }

        // Collect all bot data
        const allBotsData = [
          ...(featuredData || []),
          ...(popularData || []),
          ...(trendingData || [])
        ];

        // Fetch creator profiles for all bots
        if (allBotsData.length > 0) {
          const creatorIds = [...new Set(allBotsData.map(bot => bot.creator_id))];
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

          const formatBots = (bots: any[]) => bots.map(bot => ({
            id: bot.id,
            name: bot.name || `Bot ${bot.id.slice(0, 8)}`,
            avatar: bot.avatar || '🤖',
            category: bot.category,
            rating: bot.rating || 0,
            price: bot.price || 0,
            price_type: bot.price_type || 'free',
            description: bot.description || '',
            creator_id: bot.creator_id,
            creator_username: creatorMap.get(bot.creator_id),
            subscribers: bot.download_count || 0,
            isAvr: bot.is_avr_compatible || false,
            isLiked: false,
            botora_creator_id: bot.botora_creator_id
          }));

          setFeaturedBots(formatBots(featuredData || []));
          setPopularBots(formatBots(popularData || []));
          setTrendingBots(formatBots(trendingData || []));
        }

        // Fetch stats
        const { data: allBots, error: statsError } = await supabase
          .from('bots')
          .select('download_count')
          .eq('is_published', true);

        if (!statsError && allBots) {
          const totalBots = allBots.length;
          const totalSubscribers = allBots.reduce((sum, bot) => sum + (bot.download_count || 0), 0);
          
          setStats(prev => ({
            ...prev,
            totalBots,
            totalSubscribers
          }));
        }

        // Fetch creators count
        const { data: creatorsData, error: creatorsError } = await supabase
          .from('creators')
          .select('id');

        if (!creatorsError && creatorsData) {
          setStats(prev => ({
            ...prev,
            totalCreators: creatorsData.length
          }));
        }

        // Fetch category counts
        const categoryNames = ['education', 'entertainment', 'therapy', 'business'];
        const categoryCounts = await Promise.all(
          categoryNames.map(async (categoryName) => {
            const { data, error } = await supabase
              .from('bots')
              .select('id')
              .eq('category', categoryName)
              .eq('is_published', true);
            
            return {
              name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
              count: error ? 0 : (data?.length || 0)
            };
          })
        );

        setCategories(prev => prev.map(cat => {
          const categoryData = categoryCounts.find(c => c.name === cat.name);
          return {
            ...cat,
            count: categoryData ? categoryData.count : 0
          };
        }));

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch wishlist data when user changes
  useEffect(() => {
    const fetchWishlistData = async () => {
      if (!user || (featuredBots.length === 0 && popularBots.length === 0 && trendingBots.length === 0)) return;
      
      try {
        const { data, error } = await supabase
          .from("wishlists")
          .select("bot_id")
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Error fetching wishlist:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const likedBotIds = new Set(data.map(item => item.bot_id));
          
          const updateLikes = (bots: any[]) => bots.map(bot => ({
            ...bot,
            isLiked: likedBotIds.has(bot.id)
          }));
          
          setFeaturedBots(prev => updateLikes(prev));
          setPopularBots(prev => updateLikes(prev));
          setTrendingBots(prev => updateLikes(prev));
        }
      } catch (error) {
        console.error("Error in wishlist fetch:", error);
      }
    };

    fetchWishlistData();
  }, [user, featuredBots.length, popularBots.length, trendingBots.length]);


  const chatExperiences = [
    {
      id: "one-on-one",
      title: "One-on-One Chat",
      description: "Have a personal conversation with any AI personality",
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "debate",
      title: "Debate Room",
      description: "Watch AI personalities debate topics",
      icon: Scale,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "interview",
      title: "Time Machine Interview",
      description: "Interview historical figures",
      icon: Clock,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "motivate",
      title: "Motivate Me",
      description: "Get inspired by motivational personalities",
      icon: Rocket,
      color: "from-orange-500 to-red-500"
    }
  ];

  const handleChatExperienceSelect = (mode: string) => {
    if (!user && mode === "debate") {
      setShowAuthPrompt(true);
      setAuthPromptType("debate");
      return;
    }
    setSelectedChatMode(mode);
    onChatToggle();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 bg-gradient-hero overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float delay-1000"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8 animate-fade-in">
            <Badge className="mb-4 bg-gradient-primary text-primary-foreground shadow-glow animate-glow-pulse">
              <Zap className="w-4 h-4 mr-1" />
              Next-Gen AI Personality Hub
            </Badge>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-scale-in leading-tight">
            Botora
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in delay-200 leading-relaxed px-4">
            Discover, buy, and create AI personality bots with immersive experiences. 
            The future of digital companions is here.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 animate-slide-up delay-300 px-4">
            <div className="relative group">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search for AI personalities, creators, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-card/50 border-border backdrop-blur-xl hover:border-primary/50 focus:border-primary transition-all shadow-elegant"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-500 px-4">
            <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow text-primary-foreground px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105">
              <Link to="/creator">Become a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Choose Your Experience Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">Choose Your Experience</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">Start conversations with AI personalities in different immersive modes</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            {chatExperiences.map((experience, index) => (
              <Card 
                key={experience.id}
                className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-xl shadow-elegant hover:shadow-glow group"
                onClick={() => handleChatExperienceSelect(experience.id)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-3xl bg-gradient-to-r ${experience.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-accent`}>
                    <experience.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">{experience.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{experience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              onClick={() => setMultiBotChatOpen(true)}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground px-8 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              <Users className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              Start Multi-Bot Conversation
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{stats.totalBots.toLocaleString()}+</div>
              <div className="text-slate-400 text-sm md:text-base">AI Personalities</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{stats.totalCreators.toLocaleString()}+</div>
              <div className="text-slate-400 text-sm md:text-base">Creators</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{stats.totalSubscribers.toLocaleString()}+</div>
              <div className="text-slate-400 text-sm md:text-base">Subscriptions</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{stats.satisfaction}%</div>
              <div className="text-slate-400 text-sm md:text-base">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-12 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link key={category.name} to={`/bot-directory?category=${category.name.toLowerCase()}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <CardContent className="p-4 md:p-6 text-center">
                    <div className="text-3xl md:text-4xl mb-3 md:mb-4">{category.icon}</div>
                    <h3 className="text-lg md:text-xl font-semibold text-white mb-1 md:mb-2">{category.name}</h3>
                    <p className="text-slate-400 text-sm md:text-base">{category.count} bots</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bot Sections */}
      <section className="py-12 md:py-16 px-4 space-y-8 md:space-y-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Featured */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Featured</h2>
            </div>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {featuredBots.map((bot) => (
                <div key={bot.id} className="flex-shrink-0 w-72 md:w-80">
                  <BotCard bot={bot} onChatClick={onChatWithBot} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>

          {/* Popular */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Popular</h2>
            </div>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {popularBots.map((bot) => (
                <div key={bot.id} className="flex-shrink-0 w-72 md:w-80">
                  <BotCard bot={bot} onChatClick={onChatWithBot} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Trending</h2>
            </div>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {trendingBots.map((bot) => (
                <div key={bot.id} className="flex-shrink-0 w-72 md:w-80">
                  <BotCard bot={bot} onChatClick={onChatWithBot} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Explore More AI Personalities Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Sparkles className="w-4 h-4 mr-1" />
              Discover More
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 px-4">Explore More AI Personalities</h2>
          <p className="text-lg md:text-xl text-slate-300 mb-6 md:mb-8 px-4">
            Browse our complete collection of AI personalities. Find the perfect companion for any conversation or task.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg">
            <Link to="/bot-directory">Browse All AI Personalities</Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6 px-4">Ready to Create Your AI Personality?</h2>
          <p className="text-lg md:text-xl text-slate-300 mb-6 md:mb-8 px-4">
            Join thousands of creators building the next generation of digital companions with our intuitive Creator Studio.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg">
            <Link to="/creator">Start Creating</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p className="text-sm md:text-base">&copy; 2024 Botora. Building the future of AI personalities.</p>
        </div>
      </footer>

      {/* Chat Window */}
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={onChatToggle}
        initialMode={selectedChatMode}
        initialBot={selectedChatBot}
      />

      {/* Multi-Bot Chat */}
      <MultiBotChat 
        isOpen={multiBotChatOpen} 
        onClose={() => setMultiBotChatOpen(false)}
      />

      {/* Auth Prompt */}
      <AuthPrompt 
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        trigger={authPromptType}
      />
    </div>
  );
};

export default Index;
