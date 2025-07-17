import { useEffect, useState } from "react";
import { 
  Plus,
  Settings,
  HelpCircle,
  User,
  Menu,
  X,
  Bot,
  MessageSquare,
  Star,
  ShoppingCart,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserActivity {
  totalBots: number;
  totalPurchases: number;
  totalReviews: number;
  totalInteractions: number;
  recentPurchases: any[];
  recentReviews: any[];
  recentInteractions: any[];
}

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const { user } = useAuth();
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

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-background border-r border-border
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Botora</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Main action button */}
        <div className="p-4">
          <Button 
            className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
            onClick={() => {/* Navigate to new chat */}}
            aria-label="Start new chat"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Activity Stats */}
        {user && (
          <div className="px-4 mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
              Quick Stats
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Bot className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-sm font-semibold">{activity.totalBots}</div>
                <div className="text-xs text-muted-foreground">Bots</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <div className="text-sm font-semibold">{activity.totalPurchases}</div>
                <div className="text-xs text-muted-foreground">Purchases</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                <div className="text-sm font-semibold">{activity.totalReviews}</div>
                <div className="text-xs text-muted-foreground">Reviews</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <MessageSquare className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <div className="text-sm font-semibold">{activity.totalInteractions}</div>
                <div className="text-xs text-muted-foreground">Chats</div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <ScrollArea className="flex-1 px-4">
          {user && (
            <>
              {/* Recent Activity Section */}
              {activity.recentInteractions.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Recent Activity
                  </div>
                  <div className="space-y-1">
                    {activity.recentInteractions.slice(0, 5).map((interaction) => (
                      <button
                        key={interaction.id}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        onClick={() => {/* Navigate to interaction */}}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate group-hover:text-foreground">
                              {interaction.interaction_type === 'chat' ? 'Chat Session' : 
                               interaction.interaction_type === 'purchase' ? 'Bot Purchase' :
                               'Bot Interaction'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(interaction.created_at)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Purchases */}
              {activity.recentPurchases.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Recent Purchases
                  </div>
                  <div className="space-y-1">
                    {activity.recentPurchases.slice(0, 3).map((purchase) => (
                      <button
                        key={purchase.id}
                        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        onClick={() => {/* Navigate to bot */}}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-lg">{purchase.bots?.avatar || '🤖'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate group-hover:text-foreground">
                              {purchase.bots?.name || 'Unknown Bot'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${purchase.amount} • {formatDate(purchase.purchased_at)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!user && (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Sign in to see your activity</p>
            </div>
          )}
        </ScrollArea>

        {/* Bottom navigation */}
        <div className="border-t border-border p-4 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => {/* Navigate to settings */}}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => {/* Navigate to help */}}
          >
            <HelpCircle className="h-4 w-4" />
            Help & Support
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => {/* Navigate to profile */}}
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
        </div>
      </aside>
    </>
  );
}

// Hamburger menu button component
export function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onToggle}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      aria-expanded={isOpen}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
    </Button>
  );
}