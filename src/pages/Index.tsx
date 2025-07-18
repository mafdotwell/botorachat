
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, Users, Zap, Eye, Heart, MessageSquare, Scale, Clock, Sparkles, Rocket } from "lucide-react";
import BotCard from "@/components/BotCard";
import ChatWindow from "@/components/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface IndexProps {
  isChatOpen: boolean;
  onChatToggle: () => void;
  selectedChatBot: string;
  onChatWithBot: (botId: string) => void;
}

const Index = ({ isChatOpen, onChatToggle, selectedChatBot, onChatWithBot }: IndexProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatMode, setSelectedChatMode] = useState("");
  const [featuredBots, setFeaturedBots] = useState<any[]>([]);
  const [popularBots, setPopularBots] = useState<any[]>([]);
  const [trendingBots, setTrendingBots] = useState<any[]>([]);
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
    setSelectedChatMode(mode);
    onChatToggle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Zap className="w-4 h-4 mr-1" />
              Next-Gen AI Personality Hub
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Botora
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Discover, buy, and create AI personality bots with immersive AR/VR experiences. 
            The future of digital companions is here.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search for AI personalities, creators, or AVR content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-slate-400 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-6 text-lg">
              <Link to="/marketplace">Explore Marketplace</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg">
              <Link to="/creator">Become a Creator</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Choose Your Experience Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Experience</h2>
            <p className="text-xl text-slate-300">Start conversations with AI personalities in different modes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {chatExperiences.map((experience) => (
              <Card 
                key={experience.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm group"
                onClick={() => handleChatExperienceSelect(experience.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${experience.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <experience.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{experience.title}</h3>
                  <p className="text-slate-400 text-sm">{experience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              onClick={onChatToggle}
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-3"
            >
              <Users className="w-5 h-5 mr-2" />
              Start Multi-Bot Conversation
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalBots.toLocaleString()}+</div>
              <div className="text-slate-400">AI Personalities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalCreators.toLocaleString()}+</div>
              <div className="text-slate-400">Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalSubscribers.toLocaleString()}+</div>
              <div className="text-slate-400">Subscriptions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">{stats.satisfaction}%</div>
              <div className="text-slate-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.name} to={`/marketplace?category=${category.name.toLowerCase()}`}>
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                    <p className="text-slate-400">{category.count} bots</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bot Sections */}
      <section className="py-16 px-4 space-y-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Featured */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Featured</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {featuredBots.map((bot) => (
                <div key={bot.id} className="flex-shrink-0 w-80">
                  <BotCard bot={bot} onChatClick={onChatWithBot} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>

          {/* Popular */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Popular</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {popularBots.map((bot) => (
                <div key={bot.id} className="flex-shrink-0 w-80">
                  <BotCard bot={bot} onChatClick={onChatWithBot} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Trending</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {trendingBots.map((bot) => (
                <div key={bot.id} className="flex-shrink-0 w-80">
                  <BotCard bot={bot} onChatClick={onChatWithBot} variant="horizontal" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Create Your AI Personality?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of creators building the next generation of digital companions with our intuitive Creator Studio.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-6 text-lg">
            <Link to="/creator">Start Creating</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2024 Botora. Building the future of AI personalities.</p>
        </div>
      </footer>

      {/* Chat Window */}
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={onChatToggle}
        initialMode={selectedChatMode}
        initialBot={selectedChatBot}
      />
    </div>
  );
};

export default Index;
