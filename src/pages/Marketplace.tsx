
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid, List } from "lucide-react";
import Header from "@/components/Header";
import BotCard from "@/components/BotCard";

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["all", "education", "entertainment", "therapy", "business"];
  const sortOptions = ["popular", "rating", "price-low", "price-high", "newest"];

  const allBots = [
    {
      id: "1",
      name: "Dr. Einstein",
      avatar: "🧑‍🔬",
      category: "Education",
      rating: 4.9,
      price: "$9.99",
      description: "Physics tutor with Einstein's personality and wit, complete with interactive lab environment",
      creator: "ScienceStudio",
      downloads: 12500,
      isAvr: true
    },
    {
      id: "2", 
      name: "Maya Therapist",
      avatar: "👩‍⚕️",
      category: "Therapy",
      rating: 5.0,
      price: "$19.99/mo",
      description: "Empathetic counselor specializing in anxiety and stress management with calming virtual environments",
      creator: "WellnessAI",
      downloads: 8300,
      isAvr: true
    },
    {
      id: "3",
      name: "Captain Adventure",
      avatar: "🏴‍☠️",
      category: "Entertainment", 
      rating: 4.7,
      price: "Free",
      description: "Swashbuckling storyteller for interactive adventures on the high seas",
      creator: "GameMakers",
      downloads: 25600,
      isAvr: false
    },
    {
      id: "4",
      name: "Biz Mentor Pro",
      avatar: "💼",
      category: "Business",
      rating: 4.8,
      price: "$29.99",
      description: "Strategic business advisor with real-world experience and virtual boardroom environment",
      creator: "StartupGuru",
      downloads: 5200,
      isAvr: true
    },
    {
      id: "5",
      name: "Chef Isabella",
      avatar: "👩‍🍳",
      category: "Education",
      rating: 4.6,
      price: "$14.99",
      description: "Master chef teaching cooking techniques with interactive kitchen simulation",
      creator: "CulinaryAI",
      downloads: 9800,
      isAvr: true
    },
    {
      id: "6",
      name: "Zen Master Li",
      avatar: "🧘‍♂️",
      category: "Therapy",
      rating: 4.9,
      price: "$12.99/mo",
      description: "Meditation guide with serene virtual temples and mindfulness practices",
      creator: "MindfulTech",
      downloads: 7200,
      isAvr: true
    }
  ];

  const filteredBots = allBots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || bot.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">AI Marketplace</h1>
          <p className="text-slate-300 text-lg">Discover amazing AI personalities and AR/VR experiences</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search AI personalities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-[200px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select defaultValue="popular">
                <SelectTrigger className="w-full lg:w-[200px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="popular" className="text-white hover:bg-slate-700">Most Popular</SelectItem>
                  <SelectItem value="rating" className="text-white hover:bg-slate-700">Highest Rated</SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-slate-700">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-slate-700">Price: High to Low</SelectItem>
                  <SelectItem value="newest" className="text-white hover:bg-slate-700">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
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
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>

        {/* Load More */}
        {filteredBots.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
