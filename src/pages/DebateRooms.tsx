import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DebateRoomCreator from '@/components/DebateRoomCreator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquare, 
  Users, 
  Bot, 
  Timer, 
  Search, 
  Filter,
  Play,
  Eye,
  Plus,
  Crown,
  Globe,
  Lock
} from 'lucide-react';

interface DebateRoom {
  id: string;
  title: string;
  topic: string;
  topic_source: string;
  mode: string;
  room_type: string;
  status: string;
  creator_id: string;
  created_at: string;
  participant_count?: number;
  vote_count?: number;
}

const DebateRooms: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<DebateRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('debate_rooms')
        .select(`
          *,
          debate_participants(count),
          debate_votes(count)
        `)
        .eq('room_type', 'public')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include counts
      const roomsWithCounts = data.map(room => ({
        ...room,
        participant_count: room.debate_participants?.length || 0,
        vote_count: room.debate_votes?.length || 0
      }));

      setRooms(roomsWithCounts);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load debate rooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = (roomId: string) => {
    setShowCreator(false);
    navigate(`/debate/${roomId}`);
    fetchRooms(); // Refresh the list
  };

  const handleJoinRoom = (roomId: string) => {
    navigate(`/debate/${roomId}`);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === 'all' || room.mode === filterMode;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    
    return matchesSearch && matchesMode && matchesStatus;
  });

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'ai_vs_ai':
        return <Bot className="h-4 w-4" />;
      case 'ai_vs_user':
        return (
          <div className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            <Users className="h-3 w-3" />
          </div>
        );
      case 'user_vs_user':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'waiting':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (showCreator) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowCreator(false)}
            className="mb-4"
          >
            ← Back to Rooms
          </Button>
        </div>
        <DebateRoomCreator onRoomCreated={handleRoomCreated} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debate Rooms</h1>
          <p className="text-muted-foreground">Join live debates or create your own</p>
        </div>
        <Button onClick={() => setShowCreator(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Room
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search debates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="ai_vs_ai">AI vs AI</SelectItem>
                <SelectItem value="ai_vs_user">AI vs User</SelectItem>
                <SelectItem value="user_vs_user">User vs User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="public" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="public">Public Rooms</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No debates found</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a debate room!
                </p>
                <Button onClick={() => setShowCreator(true)}>
                  Create Debate Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">
                          {room.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {room.topic}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {room.room_type === 'private' && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Mode and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getModeIcon(room.mode)}
                          <span className="text-sm capitalize">
                            {room.mode.replace('_', ' vs ')}
                          </span>
                        </div>
                        <Badge variant={getStatusColor(room.status)}>
                          {room.status}
                        </Badge>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{room.participant_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{room.vote_count || 0}</span>
                          </div>
                        </div>
                        <span>{formatTimeAgo(room.created_at)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {room.status === 'waiting' && (
                          <Button
                            onClick={() => handleJoinRoom(room.id)}
                            className="flex-1"
                            size="sm"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        )}
                        {room.status === 'active' && (
                          <Button
                            onClick={() => handleJoinRoom(room.id)}
                            className="flex-1"
                            size="sm"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Watch Live
                          </Button>
                        )}
                        {room.status === 'completed' && (
                          <Button
                            onClick={() => handleJoinRoom(room.id)}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Trending debates coming soon</h3>
              <p className="text-muted-foreground">
                We're working on featuring the most popular debates here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardContent className="p-12 text-center">
              <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Featured debates coming soon</h3>
              <p className="text-muted-foreground">
                Curated high-quality debates will be featured here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebateRooms;