
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Bot, BarChart3, Settings, Eye, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface CreatorBot {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  is_published: boolean;
  price: number;
  price_type: string;
  rating: number;
  download_count: number;
  created_at: string;
}

const CreatorStudio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bots, setBots] = useState<CreatorBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBots: 0,
    publishedBots: 0,
    totalDownloads: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchCreatorBots();
    fetchCreatorStats();
  }, [user, navigate]);

  const fetchCreatorBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your bots"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('is_published, download_count, price')
        .eq('creator_id', user?.id);

      if (error) throw error;

      const totalBots = data?.length || 0;
      const publishedBots = data?.filter(bot => bot.is_published).length || 0;
      const totalDownloads = data?.reduce((sum, bot) => sum + (bot.download_count || 0), 0) || 0;
      const totalEarnings = data?.reduce((sum, bot) => sum + ((bot.price || 0) * (bot.download_count || 0)), 0) || 0;

      setStats({
        totalBots,
        publishedBots,
        totalDownloads,
        totalEarnings
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      setBots(bots.filter(bot => bot.id !== botId));
      toast({
        title: "Success",
        description: "Bot deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bot"
      });
    }
  };

  const togglePublishStatus = async (botId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bots')
        .update({ is_published: !currentStatus })
        .eq('id', botId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      setBots(bots.map(bot => 
        bot.id === botId 
          ? { ...bot, is_published: !currentStatus }
          : bot
      ));

      toast({
        title: "Success",
        description: `Bot ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      console.error('Error updating bot status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bot status"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex items-center justify-center py-20">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Creator Studio</h1>
            <p className="text-slate-300">Manage your AI personalities and track performance</p>
          </div>
          <Button 
            onClick={() => navigate('/creator/new-bot')}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Bot
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Bots</p>
                  <p className="text-2xl font-bold text-white">{stats.totalBots}</p>
                </div>
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Published</p>
                  <p className="text-2xl font-bold text-white">{stats.publishedBots}</p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Downloads</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <Settings className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bots" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
            <TabsTrigger value="bots" className="text-slate-300 data-[state=active]:text-white">
              My Bots ({bots.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-slate-300 data-[state=active]:text-white">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bots">
            {bots.length === 0 ? (
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No bots created yet</h3>
                  <p className="text-slate-400 mb-6">Create your first AI personality to get started</p>
                  <Button 
                    onClick={() => navigate('/creator/new-bot')}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Bot
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <Card key={bot.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10">
                          {bot.avatar && bot.avatar.startsWith('http') ? (
                            <img 
                              src={bot.avatar} 
                              alt={bot.name} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-2xl">{bot.avatar || '🤖'}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge 
                            variant={bot.is_published ? "default" : "secondary"}
                            className={bot.is_published ? "bg-green-600" : "bg-slate-600"}
                          >
                            {bot.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{bot.name}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{bot.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                        <span>{bot.category}</span>
                        <span>{bot.download_count} downloads</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/creator/edit-bot/${bot.id}`)}
                          className="flex-1 border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublishStatus(bot.id, bot.is_published)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBot(bot.id)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
                  <p className="text-slate-400">Detailed analytics and insights will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Creator Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Settings Coming Soon</h3>
                  <p className="text-slate-400">Creator profile and preferences will be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorStudio;
