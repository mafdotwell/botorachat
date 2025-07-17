
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Users, Heart, Eye, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import Header from "@/components/Header";
import BotCard from "@/components/BotCard";

const CreatorProfile = () => {
  const { id } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - in real app this would come from API
  const creator = {
    id: "sciencestudio",
    name: "ScienceStudio",
    avatar: "SS",
    tagline: "Making science accessible through AI personalities",
    bio: "Passionate about educational technology and making complex scientific concepts accessible to everyone. I specialize in creating AI personalities based on historical scientific figures with immersive AR/VR experiences.",
    location: "San Francisco, CA",
    website: "https://sciencestudio.ai",
    joinDate: "March 2023",
    stats: {
      followers: 12500,
      following: 342,
      totalDownloads: 45600,
      totalRating: 4.8,
      botsPublished: 23
    },
    badges: [
      { name: "Top Seller", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
      { name: "AR/VR Pioneer", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
      { name: "Verified Creator", color: "bg-green-500/20 text-green-300 border-green-500/30" }
    ],
    bots: [
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
        subscribers: 12500,
        isAvr: true
      },
      {
        id: "5",
        name: "Chef Isabella",
        avatar: "👩‍🍳",
        category: "education",
        rating: 4.6,
        price: 14.99,
        price_type: "one_time",
        description: "Master chef teaching cooking techniques with interactive kitchen simulation",
        creator_id: "sciencestudio",
        subscribers: 9800,
        isAvr: true
      },
      {
        id: "7",
        name: "Tesla Inventor",
        avatar: "⚡",
        category: "education",
        rating: 4.7,
        price: 12.99,
        price_type: "one_time",
        description: "Nikola Tesla's genius mind for electrical engineering and innovation",
        creator_id: "sciencestudio",
        subscribers: 8200,
        isAvr: true
      },
      {
        id: "8",
        name: "Curie Chemist",
        avatar: "🧪",
        category: "education",
        rating: 4.8,
        price: 8.99,
        price_type: "one_time",
        description: "Marie Curie's pioneering spirit in chemistry and physics",
        creator_id: "sciencestudio",
        subscribers: 7400,
        isAvr: false
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-4xl">
                    {creator.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">{creator.name}</h1>
                  <p className="text-slate-300 mb-4">{creator.tagline}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                    {creator.badges.map((badge, index) => (
                      <Badge key={index} className={badge.color}>
                        {badge.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {creator.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {creator.joinDate}
                    </div>
                  </div>

                  {creator.website && (
                    <div className="flex items-center text-purple-400 hover:text-purple-300 cursor-pointer mb-4">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      <span className="text-sm">{creator.website}</span>
                    </div>
                  )}

                  <Button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`w-full md:w-auto ${
                      isFollowing 
                        ? 'bg-slate-600 hover:bg-slate-700' 
                        : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{creator.stats.followers.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{creator.stats.botsPublished}</div>
                    <div className="text-slate-400 text-sm">Bots Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{creator.stats.totalDownloads.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">Total Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{creator.stats.totalRating}</div>
                    <div className="text-slate-400 text-sm flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      Avg Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{creator.stats.following}</div>
                    <div className="text-slate-400 text-sm">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">98%</div>
                    <div className="text-slate-400 text-sm">Satisfaction</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">About</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{creator.bio}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="bots" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
            <TabsTrigger value="bots" className="text-slate-300 data-[state=active]:text-white">
              AI Personalities ({creator.bots.length})
            </TabsTrigger>
            <TabsTrigger value="collections" className="text-slate-300 data-[state=active]:text-white">
              Collections (3)
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-slate-300 data-[state=active]:text-white">
              Reviews (47)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {creator.bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Science Legends",
                  description: "AI personalities of famous scientists throughout history",
                  botCount: 8,
                  thumbnail: "🧑‍🔬"
                },
                {
                  name: "Culinary Masters",
                  description: "Chef personalities from around the world",
                  botCount: 5,
                  thumbnail: "👨‍🍳"
                },
                {
                  name: "Innovation Pioneers",
                  description: "Inventors and innovators who changed the world",
                  botCount: 10,
                  thumbnail: "💡"
                }
              ].map((collection, index) => (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4 text-center">{collection.thumbnail}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{collection.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{collection.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{collection.botCount} bots</span>
                      <Eye className="w-4 h-4 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {[
                {
                  user: "PhysicsStudent123",
                  rating: 5,
                  comment: "ScienceStudio creates the most engaging educational bots. The AR features are incredible!",
                  bot: "Dr. Einstein",
                  date: "2 days ago"
                },
                {
                  user: "TeacherMike",
                  rating: 5,
                  comment: "My students absolutely love these personalities. Makes learning so much more fun.",
                  bot: "Tesla Inventor",
                  date: "1 week ago"
                },
                {
                  user: "CuriousLearner",
                  rating: 4,
                  comment: "Great quality and attention to detail. Looking forward to more historical figures!",
                  bot: "Curie Chemist",
                  date: "2 weeks ago"
                }
              ].map((review, index) => (
                <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-600 text-white">
                          {review.user.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white font-medium">{review.user}</span>
                          <div className="flex">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <span className="text-slate-400 text-sm">{review.date}</span>
                        </div>
                        <p className="text-slate-300 mb-2">{review.comment}</p>
                        <div className="text-purple-400 text-sm">Review for: {review.bot}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorProfile;
