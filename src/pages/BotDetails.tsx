import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, Users, Share, Play, MessageSquare, Eye, User, AlertCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define types for our bot data
type BotData = Database['public']['Tables']['bots']['Row'] & {
  creator?: Database['public']['Tables']['creators']['Row'];
};

type Review = Database['public']['Tables']['reviews']['Row'] & {
  user_name?: string;
  user_avatar?: string;
};

// Sample conversation interface for preview
interface ConversationMessage {
  role: 'user' | 'bot';
  message: string;
}

// Define the structure for features and screenshots
interface BotFeature {
  title: string;
}

const BotDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bot, setBot] = useState<BotData | null>(null);
  const [creator, setCreator] = useState<Database['public']['Tables']['creators']['Row'] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarBots, setSimilarBots] = useState<BotData[]>([]);

  // Fetch bot details
  useEffect(() => {
    const fetchBotDetails = async () => {
      if (!id) {
        setError("No bot ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch the bot details
        const { data: botData, error: botError } = await supabase
          .from('bots')
          .select('*')
          .eq('id', id)
          .single();

        if (botError) {
          console.error("Error fetching bot:", botError);
          setError("Failed to load bot details");
          setLoading(false);
          return;
        }

        if (!botData) {
          setError("Bot not found");
          setLoading(false);
          return;
        }

        setBot(botData);

        // Fetch creator details
        if (botData.creator_id) {
          const { data: creatorData } = await supabase
            .from('creators')
            .select('*')
            .eq('id', botData.creator_id)
            .single();
          
          setCreator(creatorData || null);
        }

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('bot_id', id)
          .order('created_at', { ascending: false });
        
        if (reviewsData) {
          // Fetch user names for reviews
          const reviewsWithUserInfo = await Promise.all(reviewsData.map(async (review) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', review.user_id)
              .single();
            
            return {
              ...review,
              user_name: userData?.full_name || 'Anonymous User',
              user_avatar: userData?.avatar_url
            };
          }));
          
          setReviews(reviewsWithUserInfo);
        }

        // Fetch similar bots (same category)
        if (botData.category) {
          const { data: similarBotsData } = await supabase
            .from('bots')
            .select('*')
            .eq('category', botData.category)
            .neq('id', id)
            .eq('is_published', true)
            .limit(3);
          
          setSimilarBots(similarBotsData || []);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchBotDetails();
  }, [id, navigate]);

  // Sample conversation for preview (this would normally come from the bot's configuration)
  const sampleConversation: ConversationMessage[] = [
    { role: "user", message: "Can you introduce yourself?" },
    { role: "bot", message: bot?.custom_instructions || "Hello! I'm an AI personality designed to assist you with various tasks and engage in conversation." },
    { role: "user", message: "What can you help me with?" },
    { role: "bot", message: "I can provide information, answer questions, and have conversations about various topics based on my design and training." }
  ];

  // Example features and screenshots (in a real app, these would come from the database)
  const features = [
    "Interactive AI personality",
    "Natural conversation flow",
    "Knowledge on various topics",
    "Personalized responses",
    "Real-time Q&A capability"
  ];

  const screenshots = [
    "Conversation interface",
    "Knowledge base visualization",
    "Interactive examples",
    "User preference settings"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p>Loading bot details...</p>
        </div>
      </div>
    );
  }

  if (error || !bot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {error || "Bot not found"}
            </h2>
            <p className="text-slate-300 mb-6">
              We couldn't find the bot you're looking for. It might have been removed or doesn't exist.
            </p>
            <Button onClick={() => navigate('/marketplace')} variant="default">
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format price for display
  const formattedPrice = typeof bot.price === 'number' 
    ? `$${bot.price.toFixed(2)}` 
    : bot.price || 'Free';

  // Format original price if available
  const formattedOriginalPrice = bot.original_price !== null && typeof bot.original_price === 'number' 
    ? `$${bot.original_price.toFixed(2)}` 
    : undefined;

  // Calculate discount percentage if both prices are available
  const discountPercentage = bot.original_price && bot.price && bot.original_price > bot.price
    ? Math.round(((bot.original_price - bot.price) / bot.original_price) * 100)
    : 0;

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
                  <div className="w-24 h-24 flex items-center justify-center bg-white/10 rounded-lg overflow-hidden">
                    {bot.avatar ? (
                      <Avatar className="w-full h-full">
                        <AvatarImage src={bot.avatar} alt={bot.name || "Bot avatar"} />
                        <AvatarFallback className="text-4xl">{bot.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="text-6xl">🤖</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
                      {bot.is_avr_compatible && (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          AR/VR
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {bot.category}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-6 mb-4 text-slate-300">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1 fill-current" />
                        <span>{bot.rating || "N/A"}</span>
                        <span className="ml-1">({bot.review_count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-1" />
                        <span>{(bot.download_count || 0).toLocaleString()} subscribers</span>
                      </div>
                    </div>

                    <p className="text-slate-300 mb-6">{bot.description}</p>

                    <div className="flex flex-wrap items-center gap-4">
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
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-slate-300">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-semibold text-white mb-4">Screenshots</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {screenshots.map((screenshot, index) => (
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
                      {sampleConversation.map((message, index) => (
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
                        💡 This is just a sample! Subscribe to the bot for full access.
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
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review.id} className="border-b border-white/10 pb-6 last:border-b-0">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="w-8 h-8">
                                {review.user_avatar ? (
                                  <AvatarImage src={review.user_avatar} />
                                ) : (
                                  <AvatarFallback className="bg-purple-600 text-white text-sm">
                                    {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <div className="text-white font-medium">{review.user_name}</div>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[...Array(review.rating || 0)].map((_, i) => (
                                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                  <span className="text-slate-400 text-sm">
                                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-slate-300">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <p>No reviews yet. Be the first to review this bot!</p>
                        </div>
                      )}
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
                        <p className="text-slate-300">Any device with a web browser</p>
                      </div>
                      {bot.is_avr_compatible && (
                        <div>
                          <h4 className="text-white font-medium mb-2">AR/VR Support</h4>
                          <p className="text-slate-300">Apple Vision Pro, Meta Quest, or ARCore/ARKit devices</p>
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-medium mb-2">Required Storage</h4>
                        <p className="text-slate-300">Minimal (web-based)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{formattedPrice}</span>
                    {formattedOriginalPrice && discountPercentage > 0 && (
                      <span className="text-lg text-slate-400 line-through">{formattedOriginalPrice}</span>
                    )}
                  </div>
                  {discountPercentage > 0 && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    Subscribe Now
                  </Button>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Start Free Trial
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
                {creator ? (
                  <>
                    <Link to={`/creator/${creator.id}`} className="block hover:opacity-80 transition-opacity">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                            {creator.display_name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{creator.display_name}</div>
                          <div className="text-slate-400 text-sm">Bot Creator</div>
                        </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      {creator.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          <span>{creator.rating} rating</span>
                        </div>
                      )}
                      {creator.total_sales !== undefined && (
                        <span>{creator.total_sales.toLocaleString()} sales</span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-center py-4">
                    Creator information not available
                  </div>
                )}

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
                {similarBots.length > 0 ? (
                  similarBots.map((similarBot) => (
                    <Link to={`/bot/${similarBot.id}`} key={similarBot.id}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg overflow-hidden">
                          {similarBot.avatar ? (
                            <Avatar className="w-full h-full">
                              <AvatarImage src={similarBot.avatar} alt={similarBot.name || "Bot avatar"} />
                              <AvatarFallback>{similarBot.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="text-xl">🤖</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{similarBot.name}</div>
                          <div className="text-slate-400 text-xs">
                            {typeof similarBot.price === 'number' ? `$${similarBot.price.toFixed(2)}` : (similarBot.price || 'Free')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-2">
                    No similar bots found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotDetails;