import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Bot, 
  Activity, 
  TrendingUp, 
  Plus, 
  Shield, 
  BarChart3,
  Eye,
  Clock,
  Star,
  Mail,
  UserCheck,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import AdminBotCreator from "@/components/AdminBotCreator";

interface AdminStats {
  totalUsers: number;
  totalBots: number;
  totalInteractions: number;
  totalRevenue: number;
  activeUsers: number;
  publishedBots: number;
}

interface AnalyticsData {
  date: string;
  interactions: number;
  users: number;
  bots: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  creator_type: string;
  showcase_items: string[];
  message: string | null;
  status: string;
  created_at: string;
  contact_preferences: any;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBots: 0,
    totalInteractions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    publishedBots: 0
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page."
        });
        return;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have admin privileges."
        });
        return;
      }

      setIsAdmin(true);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      // Fetch total bots
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('id, is_published, download_count, category');

      // Fetch total interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('bot_analytics')
        .select('id');

      // Fetch total revenue
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('amount');

      if (!usersError && usersData) {
        setStats(prev => ({ ...prev, totalUsers: usersData.length }));
      }

      if (!botsError && botsData) {
        const publishedCount = botsData.filter(bot => bot.is_published).length;
        setStats(prev => ({ 
          ...prev, 
          totalBots: botsData.length,
          publishedBots: publishedCount
        }));

        // Process category data for pie chart
        const categoryCount: { [key: string]: number } = {};
        botsData.forEach(bot => {
          if (bot.category) {
            categoryCount[bot.category] = (categoryCount[bot.category] || 0) + 1;
          }
        });

        const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const processedCategories = Object.entries(categoryCount).map(([name, value], index) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: colors[index % colors.length]
        }));

        setCategoryData(processedCategories);
      }

      if (!interactionsError && interactionsData) {
        setStats(prev => ({ ...prev, totalInteractions: interactionsData.length }));
      }

      if (!purchasesError && purchasesData) {
        const revenue = purchasesData.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);
        setStats(prev => ({ ...prev, totalRevenue: revenue }));
      }

      // Fetch analytics data for charts
      const { data: analyticsViewData, error: analyticsViewError } = await supabase
        .from('admin_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (!analyticsViewError && analyticsViewData) {
        const formattedAnalytics = analyticsViewData.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          interactions: item.total_interactions || 0,
          users: item.unique_users || 0,
          bots: item.bots_used || 0
        })).reverse();

        setAnalyticsData(formattedAnalytics);
      }

      // Fetch waitlist data
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('creator_waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (!waitlistError && waitlistData) {
        setWaitlistEntries(waitlistData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-300">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const chartConfig = {
    interactions: {
      label: "Interactions",
      color: "hsl(var(--primary))",
    },
    users: {
      label: "Users",
      color: "hsl(var(--secondary))",
    },
    bots: {
      label: "Bots",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-300">Monitor and manage your Botora platform</p>
          </div>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Shield className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-slate-400">All registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Bots</CardTitle>
              <Bot className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalBots.toLocaleString()}</div>
              <p className="text-xs text-slate-400">{stats.publishedBots} published</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Interactions</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-slate-400">Total bot interactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-slate-400">Total platform revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border-white/10">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/10">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="bots" className="text-white data-[state=active]:bg-white/10">
              <Bot className="w-4 h-4 mr-2" />
              Bot Management
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="text-white data-[state=active]:bg-white/10">
              <Mail className="w-4 h-4 mr-2" />
              Waitlist
            </TabsTrigger>
            <TabsTrigger value="create" className="text-white data-[state=active]:bg-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Create Botora Bot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Interactions Chart */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Daily Interactions</CardTitle>
                  <CardDescription className="text-slate-400">
                    Bot interactions over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.5)"
                          fontSize={12}
                        />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="interactions" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Bot Categories Chart */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Bot Categories</CardTitle>
                  <CardDescription className="text-slate-400">
                    Distribution of bots by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Usage Metrics */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Platform Usage Metrics</CardTitle>
                  <CardDescription className="text-slate-400">
                    Combined view of users, bots, and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.5)"
                          fontSize={12}
                        />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="interactions" fill="hsl(var(--primary))" />
                        <Bar dataKey="users" fill="hsl(var(--secondary))" />
                        <Bar dataKey="bots" fill="hsl(var(--accent))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bots" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Bot Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all bots on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-400 mb-4">Bot management features coming soon</p>
                  <p className="text-sm text-slate-500">
                    This section will include bot moderation, approval workflows, and performance monitoring.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Creator Waitlist
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage creator applications for the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waitlistEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-400 mb-2">No waitlist entries yet</p>
                    <p className="text-sm text-slate-500">
                      Creator applications will appear here when users sign up for the marketplace waitlist.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {waitlistEntries.map((entry) => (
                      <div key={entry.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-white font-medium">{entry.name}</h3>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  entry.status === 'pending' 
                                    ? 'border-yellow-500/50 text-yellow-300' 
                                    : entry.status === 'approved'
                                    ? 'border-green-500/50 text-green-300'
                                    : 'border-red-500/50 text-red-300'
                                }`}
                              >
                                {entry.status}
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{entry.email}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                              <span className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                {entry.creator_type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(entry.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {entry.showcase_items.length > 0 && (
                              <div className="mb-3">
                                <p className="text-slate-400 text-sm mb-1">Showcase Items:</p>
                                <div className="flex flex-wrap gap-2">
                                  {entry.showcase_items.map((item, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {entry.message && (
                              <div className="bg-white/5 rounded p-3 border border-white/10">
                                <p className="text-slate-400 text-sm mb-1">Message:</p>
                                <p className="text-slate-300 text-sm">{entry.message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <AdminBotCreator onBotCreated={fetchDashboardData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;