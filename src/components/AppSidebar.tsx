import { useEffect, useState } from "react";
import { Activity, Bot, MessageSquare, ShoppingCart, Star, TrendingUp, Calendar, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserActivity {
  totalBots: number;
  totalPurchases: number;
  totalReviews: number;
  totalInteractions: number;
  recentPurchases: any[];
  recentReviews: any[];
  recentInteractions: any[];
}

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [activity, setActivity] = useState<UserActivity>({
    totalBots: 0,
    totalPurchases: 0,
    totalReviews: 0,
    totalInteractions: 0,
    recentPurchases: [],
    recentReviews: [],
    recentInteractions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserActivity();
    }
  }, [user]);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);

      // Get user's bot count (if they're a creator)
      const { data: bots } = await supabase
        .from('bots')
        .select('id')
        .eq('creator_id', user?.id);

      // Get user's purchases
      const { data: purchases } = await supabase
        .from('purchases')
        .select(`
          id,
          amount,
          purchased_at,
          bots (name, avatar)
        `)
        .eq('user_id', user?.id)
        .order('purchased_at', { ascending: false })
        .limit(5);

      // Get user's reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          created_at,
          bots (name, avatar)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get user's interactions
      const { data: interactions } = await supabase
        .from('bot_analytics')
        .select('id, interaction_type, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get total counts
      const { count: totalPurchases } = await supabase
        .from('purchases')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id);

      const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id);

      const { count: totalInteractions } = await supabase
        .from('bot_analytics')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id);

      setActivity({
        totalBots: bots?.length || 0,
        totalPurchases: totalPurchases || 0,
        totalReviews: totalReviews || 0,
        totalInteractions: totalInteractions || 0,
        recentPurchases: purchases || [],
        recentReviews: reviews || [],
        recentInteractions: interactions || []
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-80"} collapsible="icon">
        <SidebarHeader className="border-b border-border/40 p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-foreground">Activity</h2>
                <p className="text-xs text-muted-foreground">Sign in to see your activity</p>
              </div>
            )}
          </div>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"} collapsible="icon">
      <SidebarHeader className="border-b border-border/40 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">Activity Summary</h2>
              <p className="text-xs text-muted-foreground">Your Botora journey</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 space-y-4">
        {!collapsed && (
          <>
            {/* Quick Stats */}
            <SidebarGroup>
              <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-background/50 border-border/40">
                    <CardContent className="p-3 text-center">
                      <Bot className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                      <div className="text-lg font-semibold">{activity.totalBots}</div>
                      <div className="text-xs text-muted-foreground">Bots Created</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50 border-border/40">
                    <CardContent className="p-3 text-center">
                      <ShoppingCart className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <div className="text-lg font-semibold">{activity.totalPurchases}</div>
                      <div className="text-xs text-muted-foreground">Purchases</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50 border-border/40">
                    <CardContent className="p-3 text-center">
                      <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                      <div className="text-lg font-semibold">{activity.totalReviews}</div>
                      <div className="text-xs text-muted-foreground">Reviews</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50 border-border/40">
                    <CardContent className="p-3 text-center">
                      <MessageSquare className="w-5 h-5 mx-auto mb-1 text-green-500" />
                      <div className="text-lg font-semibold">{activity.totalInteractions}</div>
                      <div className="text-xs text-muted-foreground">Chats</div>
                    </CardContent>
                  </Card>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Recent Purchases */}
            {activity.recentPurchases.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Recent Purchases</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {activity.recentPurchases.slice(0, 3).map((purchase) => (
                      <SidebarMenuItem key={purchase.id}>
                        <SidebarMenuButton className="h-auto p-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="text-xl">{purchase.bots?.avatar || '🤖'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {purchase.bots?.name || 'Unknown Bot'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ${purchase.amount} • {formatDate(purchase.purchased_at)}
                              </div>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Recent Reviews */}
            {activity.recentReviews.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Recent Reviews</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {activity.recentReviews.slice(0, 3).map((review) => (
                      <SidebarMenuItem key={review.id}>
                        <SidebarMenuButton className="h-auto p-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="text-xl">{review.bots?.avatar || '🤖'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {review.bots?.name || 'Unknown Bot'}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="flex text-yellow-400">
                                  {'★'.repeat(review.rating)}
                                </div>
                                <span>{formatDate(review.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Recent Activity */}
            {activity.recentInteractions.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Recent Activity</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {activity.recentInteractions.slice(0, 3).map((interaction) => (
                      <SidebarMenuItem key={interaction.id}>
                        <SidebarMenuButton className="h-auto p-3">
                          <div className="flex items-center gap-3 w-full">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">
                                {interaction.interaction_type === 'chat' ? 'Chat Session' : 
                                 interaction.interaction_type === 'purchase' ? 'Bot Purchase' :
                                 'Bot Interaction'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(interaction.created_at)}
                              </div>
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}