
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiKeyManager } from './ApiKeyManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShoppingBag, Key, LogOut, Store, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserPurchase {
  id: string;
  bot_id: string;
  purchase_type: string;
  amount: number;
  purchased_at: string;
  is_active: boolean;
  bots: {
    name: string;
    avatar: string;
    category: string;
  };
}

export const UserProfile = () => {
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          bots (
            name,
            avatar,
            category
          )
        `)
        .eq('user_id', user!.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching purchases",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out"
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <p className="text-slate-300">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/marketplace')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Store className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Browse Marketplace</h3>
                  <p className="text-slate-400">Discover new AI personalities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/creator')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Palette className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Creator Studio</h3>
                  <p className="text-slate-400">Create and manage your bots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="purchases" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-8">
            <TabsTrigger value="purchases" className="text-white data-[state=active]:bg-white/20">
              <ShoppingBag className="w-4 h-4 mr-2" />
              My Purchases
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="text-white data-[state=active]:bg-white/20">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">My Bot Purchases</CardTitle>
                <CardDescription className="text-slate-300">
                  Bots you own and can use on Echo Chat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-300">Loading purchases...</div>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-300">No purchases yet</p>
                    <p className="text-slate-400 text-sm mb-4">Visit the marketplace to get your first bot</p>
                    <Button 
                      onClick={() => navigate('/marketplace')}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                    >
                      Browse Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{purchase.bots.avatar}</div>
                          <div>
                            <h3 className="font-semibold text-white">{purchase.bots.name}</h3>
                            <p className="text-sm text-slate-400">{purchase.bots.category}</p>
                            <p className="text-xs text-slate-500">
                              Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={purchase.is_active ? "default" : "secondary"}>
                            {purchase.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              ${purchase.amount}
                            </p>
                            <p className="text-xs text-slate-400 capitalize">
                              {purchase.purchase_type}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <ApiKeyManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
