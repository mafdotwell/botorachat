import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Activity,
  ChevronLeft,
  ChevronRight,
  Store
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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ isOpen, onToggle, isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
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
          fixed top-0 left-0 h-full bg-background border-r border-border flex flex-col
          transform transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative lg:z-auto
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          w-64
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">Botora</h2>}
          {isCollapsed && <div className="text-lg">🤖</div>}
          <div className="flex gap-1">
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            {/* Mobile close button */}
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
        </div>

        {/* Main navigation */}
        <div className="p-4 space-y-2 flex-shrink-0">
          <Button 
            className={`w-full bg-primary hover:bg-primary/90 ${isCollapsed ? 'justify-center' : 'justify-start gap-2'}`}
            onClick={() => navigate('/')}
            aria-label="Home"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && "Home"}
          </Button>
          
          <Button 
            variant="ghost"
            className={`w-full text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : 'justify-start gap-2'}`}
            onClick={() => navigate('/marketplace')}
            aria-label="Marketplace"
          >
            <Store className="h-4 w-4" />
            {!isCollapsed && "Marketplace"}
          </Button>
          
          {user && (
            <Button 
              variant="ghost"
              className={`w-full text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : 'justify-start gap-2'}`}
              onClick={() => navigate('/creator')}
              aria-label="Creator Studio"
            >
              <Bot className="h-4 w-4" />
              {!isCollapsed && "Creator Studio"}
            </Button>
          )}
        </div>

        {/* Activity Stats */}
        {user && !isCollapsed && (
          <div className="px-4 mb-4 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto px-4 min-h-0">
          {user && !isCollapsed && (
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
                        onClick={() => navigate('/')}
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
                        onClick={() => navigate('/marketplace')}
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

          {/* Collapsed state - show quick access icons */}
          {user && isCollapsed && (
            <div className="space-y-2 py-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => navigate('/')}
                aria-label="Home"
              >
                <Activity className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => navigate('/creator')}
                aria-label="Creator Studio"
              >
                <Bot className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => navigate('/marketplace')}
                aria-label="Marketplace"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          )}

          {!user && !isCollapsed && (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Sign in to see your activity</p>
            </div>
          )}

          {!user && isCollapsed && (
            <div className="text-center py-8">
              <Activity className="h-6 w-6 mx-auto text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="border-t border-border p-4 space-y-1 flex-shrink-0">
          <Button
            variant="ghost"
            className={`w-full text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : 'justify-start gap-2'}`}
            onClick={() => navigate('/profile')}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && "Settings"}
          </Button>
          <Button
            variant="ghost"
            className={`w-full text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : 'justify-start gap-2'}`}
            onClick={() => window.open('https://docs.lovable.dev/', '_blank')}
            aria-label="Help & Support"
          >
            <HelpCircle className="h-4 w-4" />
            {!isCollapsed && "Help & Support"}
          </Button>
          <Button
            variant="ghost"
            className={`w-full text-muted-foreground hover:text-foreground ${isCollapsed ? 'justify-center' : 'justify-start gap-2'}`}
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
            {!isCollapsed && "Profile"}
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