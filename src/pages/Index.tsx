
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Star, Users, Zap, Eye, Heart, MessageSquare, Scale, Clock, Sparkles, Rocket } from "lucide-react";
import BotCard from "@/components/BotCard";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatMode, setSelectedChatMode] = useState("");

  const featuredBots = [
    {
      id: "1",
      name: "Dr. Einstein",
      avatar: "🧑‍🔬",
      category: "education",
      rating: 4.9,
      price: 9.99,
      price_type: "one_time",
      description: "Physics tutor with Einstein's personality and wit",
      creator_id: "sciencestudio",
      downloads: 12500,
      isAvr: true
    },
    {
      id: "2", 
      name: "Maya Therapist",
      avatar: "👩‍⚕️",
      category: "therapy",
      rating: 5.0,
      price: 19.99,
      price_type: "subscription",
      description: "Empathetic counselor specializing in anxiety and stress",
      creator_id: "wellnessai",
      downloads: 8300,
      isAvr: true
    },
    {
      id: "3",
      name: "Captain Adventure",
      avatar: "🏴‍☠️",
      category: "entertainment", 
      rating: 4.7,
      price: 0,
      price_type: "free",
      description: "Swashbuckling storyteller for interactive adventures",
      creator_id: "gamemakers",
      downloads: 25600,
      isAvr: false
    },
    {
      id: "4",
      name: "Biz Mentor Pro",
      avatar: "💼",
      category: "business",
      rating: 4.8,
      price: 29.99,
      price_type: "one_time",
      description: "Strategic business advisor with real-world experience",
      creator_id: "startupguru",
      downloads: 5200,
      isAvr: true
    }
  ];

  const categories = [
    { name: "Education", icon: "📚", count: 1250 },
    { name: "Entertainment", icon: "🎭", count: 890 },
    { name: "Therapy", icon: "💚", count: 640 },
    { name: "Business", icon: "💼", count: 430 }
  ];

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
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header onChatToggle={() => setIsChatOpen(!isChatOpen)} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Zap className="w-4 h-4 mr-1" />
              Next-Gen AI Marketplace
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            EchoVerse
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
              onClick={() => setIsChatOpen(true)}
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
              <div className="text-3xl font-bold text-white mb-2">15,000+</div>
              <div className="text-slate-400">AI Personalities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">5,000+</div>
              <div className="text-slate-400">Creators</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">250K+</div>
              <div className="text-slate-400">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">98%</div>
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

      {/* Featured Bots */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Featured AI Personalities</h2>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link to="/marketplace">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
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
          <p>&copy; 2024 EchoVerse. Building the future of AI personalities.</p>
        </div>
      </footer>

      {/* Chat Window */}
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        initialMode={selectedChatMode}
      />
    </div>
  );
};

export default Index;
