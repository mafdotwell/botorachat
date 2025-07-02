
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Heart, Download, Share, Play, MessageSquare, Eye, User } from "lucide-react";
import Header from "@/components/Header";

const BotDetails = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Mock data - in real app this would come from API
  const bot = {
    id: "1",
    name: "Dr. Einstein",
    avatar: "🧑‍🔬",
    category: "Education",
    rating: 4.9,
    reviewCount: 1247,
    price: "$9.99",
    originalPrice: "$14.99",
    description: "Meet Dr. Einstein, your personal physics tutor with the wit and wisdom of Albert Einstein himself. This AI personality combines deep scientific knowledge with Einstein's characteristic humor and philosophical insights.",
    creator: {
      name: "ScienceStudio",
      avatar: "SS",
      followers: 12500,
      bots: 23
    },
    downloads: 12500,
    isAvr: true,
    features: [
      "Interactive physics problem solving",
      "Thought experiments and visualizations", 
      "AR laboratory environment",
      "Personalized learning paths",
      "Real-time Q&A sessions"
    ],
    screenshots: [
      "Einstein in AR lab environment",
      "Interactive chalkboard demonstrations",
      "3D molecular visualizations",
      "Virtual relativity experiments"
    ],
    sampleConversation: [
      { role: "user", message: "Can you explain time dilation?" },
      { role: "bot", message: "Ah, time dilation! *adjusts imaginary suspenders* You know, when I was thinking about this, I imagined myself riding alongside a beam of light. Time, my friend, is not the absolute constant we once believed it to be..." },
      { role: "user", message: "That's fascinating! Can you give me a simple example?" },
      { role: "bot", message: "Of course! Imagine you have a twin who travels to space at very high speeds. When they return, they will have aged less than you! Time literally moves slower for them. It's not science fiction - it's the universe showing us its sense of humor!" }
    ],
    requirements: {
      device: "Any device with web browser",
      ar: "Apple Vision Pro, Meta Quest, or ARCore/ARKit device",
      storage: "250 MB"
    },
    userReviews: [
      {
        id: 1,
        user: "PhysicsStudent123",
        rating: 5,
        comment: "Absolutely incredible! Einstein's personality really comes through and the AR lab is mind-blowing.",
        date: "2 days ago"
      },
      {
        id: 2,
        user: "TeacherMike",
        rating: 5,
        comment: "My students love this bot. It makes physics concepts so much more engaging and understandable.",
        date: "1 week ago"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-slate-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-white">Marketplace</Link>
            <span>/</span>
            <span className="text-white">{bot.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{bot.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
                      {bot.isAvr && (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          AR/VR
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {bot.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4 text-slate-300">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1 fill-current" />
                        <span>{bot.rating}</span>
                        <span className="ml-1">({bot.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-5 h-5 mr-1" />
                        <span>{bot.downloads.toLocaleString()} downloads</span>
                      </div>
                    </div>

                    <p className="text-slate-300 mb-6">{bot.description}</p>

                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => setShowPreview(true)}
                        className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Try Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsLiked(!isLiked)}
                        className={`border-white/20 ${isLiked ? 'text-red-400 border-red-400' : 'text-white'} hover:bg-white/10`}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                      </Button>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
                <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white">Overview</TabsTrigger>
                <TabsTrigger value="preview" className="text-slate-300 data-[state=active]:text-white">Preview</TabsTrigger>
                <TabsTrigger value="reviews" className="text-slate-300 data-[state=active]:text-white">Reviews</TabsTrigger>
                <TabsTrigger value="specs" className="text-slate-300 data-[state=active]:text-white">Specs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
                    <ul className="space-y-2 mb-6">
                      {bot.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-slate-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-white mb-4">Screenshots</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {bot.screenshots.map((screenshot, index) => (
                        <div key={index} className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                          <Eye className="w-8 h-8 mb-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Sample Conversation</h3>
                    <div className="space-y-4">
                      {bot.sampleConversation.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white/10 text-slate-300'
                          }`}>
                            <div className="text-xs opacity-75 mb-1">
                              {message.role === 'user' ? 'You' : bot.name}
                            </div>
                            {message.message}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <p className="text-cyan-300 text-sm">
                        💡 This is just a sample! The full experience includes AR visualizations, interactive experiments, and personalized responses.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">Reviews</h3>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Write Review
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      {bot.userReviews.map((review) => (
                        <div key={review.id} className="border-b border-white/10 pb-6 last:border-b-0">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-purple-600 text-white text-sm">
                                {review.user.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white font-medium">{review.user}</div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                  ))}
                                </div>
                                <span className="text-slate-400 text-sm">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-300">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">System Requirements</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Device Compatibility</h4>
                        <p className="text-slate-300">{bot.requirements.device}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">AR/VR Support</h4>
                        <p className="text-slate-300">{bot.requirements.ar}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Storage Required</h4>
                        <p className="text-slate-300">{bot.requirements.storage}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{bot.price}</span>
                    {bot.originalPrice && (
                      <span className="text-lg text-slate-400 line-through">{bot.originalPrice}</span>
                    )}
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    33% OFF
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    Buy Now
                  </Button>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Add to Cart
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center text-slate-300 text-sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    30-day money-back guarantee
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={`/creator/${bot.creator.name}`} className="block hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                        {bot.creator.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-medium">{bot.creator.name}</div>
                      <div className="text-slate-400 text-sm">{bot.creator.bots} bots published</div>
                    </div>
                  </div>
                </Link>
                
                <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                  <span>{bot.creator.followers.toLocaleString()} followers</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-400" />
                    <span>4.8 avg rating</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <User className="w-4 h-4 mr-2" />
                  Follow Creator
                </Button>
              </CardContent>
            </Card>

            {/* Similar Bots */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Similar Personalities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Tesla Inventor", avatar: "⚡", price: "$12.99" },
                  { name: "Curie Chemist", avatar: "🧪", price: "$8.99" },
                  { name: "Newton Physicist", avatar: "🍎", price: "$10.99" }
                ].map((similar, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="text-2xl">{similar.avatar}</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{similar.name}</div>
                      <div className="text-slate-400 text-xs">{similar.price}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotDetails;
