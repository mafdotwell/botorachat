import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDebateRoom, DebateMode, TopicSource } from '@/hooks/useDebateRoom';
import { Users, Bot, MessageSquare, Timer, Vote, BarChart3, Lock, Globe } from 'lucide-react';

interface DebateRoomCreatorProps {
  onRoomCreated?: (roomId: string) => void;
}

const DebateRoomCreator: React.FC<DebateRoomCreatorProps> = ({ onRoomCreated }) => {
  const { createDebateRoom, loading, getAvailableTopics } = useDebateRoom();
  
  const [title, setTitle] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicSource, setTopicSource] = useState<TopicSource>('trending');
  const [mode, setMode] = useState<DebateMode>('ai_vs_user');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);

  const availableTopics = getAvailableTopics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTopic = '';
    switch (topicSource) {
      case 'trending':
      case 'custom':
        finalTopic = selectedTopic;
        break;
      case 'user_input':
        finalTopic = customTopic;
        break;
    }

    if (!title || !finalTopic) {
      return;
    }

    try {
      const room = await createDebateRoom({
        title,
        topic: finalTopic,
        topic_source: topicSource,
        mode,
        room_type: roomType,
        settings: {
          chat_enabled: chatEnabled,
          voice_enabled: voiceEnabled,
          voting_enabled: votingEnabled,
          feedback_enabled: feedbackEnabled
        }
      });

      if (onRoomCreated && room) {
        onRoomCreated(room.id);
      }
    } catch (error) {
      console.error('Failed to create debate room:', error);
    }
  };

  const getModeIcon = (debateMode: DebateMode) => {
    switch (debateMode) {
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
    }
  };

  const getModeDescription = (debateMode: DebateMode) => {
    switch (debateMode) {
      case 'ai_vs_ai':
        return 'Watch two AI bots debate each other';
      case 'ai_vs_user':
        return 'Debate against an AI opponent';
      case 'user_vs_user':
        return 'Debate against other users';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Create Debate Room
        </CardTitle>
        <CardDescription>
          Set up a new debate with customizable rules and participants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Debate Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter debate title..."
                required
              />
            </div>

            {/* Topic Selection */}
            <div>
              <Label>Topic Source</Label>
              <Select value={topicSource} onValueChange={(value: TopicSource) => setTopicSource(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending Topics</SelectItem>
                  <SelectItem value="custom">Custom Topic</SelectItem>
                  <SelectItem value="user_input">Your Own Topic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(topicSource === 'trending' || topicSource === 'custom') && (
              <div>
                <Label>Select Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {topicSource === 'user_input' && (
              <div>
                <Label htmlFor="custom-topic">Your Topic</Label>
                <Textarea
                  id="custom-topic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter your debate topic..."
                  required
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Debate Mode */}
          <div>
            <Label>Debate Mode</Label>
            <div className="grid grid-cols-1 gap-3 mt-2">
              {(['ai_vs_ai', 'ai_vs_user', 'user_vs_user'] as DebateMode[]).map((debateMode) => (
                <Card
                  key={debateMode}
                  className={`cursor-pointer transition-colors ${
                    mode === debateMode ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setMode(debateMode)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getModeIcon(debateMode)}
                        <div>
                          <div className="font-medium capitalize">
                            {debateMode.replace('_', ' vs ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getModeDescription(debateMode)}
                          </div>
                        </div>
                      </div>
                      {mode === debateMode && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Room Settings */}
          <div className="space-y-4">
            <Label>Room Settings</Label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {roomType === 'public' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                <Label htmlFor="room-type">Room Type</Label>
              </div>
              <Select value={roomType} onValueChange={(value: 'public' | 'private') => setRoomType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="chat">Chat</Label>
                </div>
                <Switch
                  id="chat"
                  checked={chatEnabled}
                  onCheckedChange={setChatEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <Label htmlFor="voice">Voice</Label>
                </div>
                <Switch
                  id="voice"
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  <Label htmlFor="voting">Voting</Label>
                </div>
                <Switch
                  id="voting"
                  checked={votingEnabled}
                  onCheckedChange={setVotingEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <Label htmlFor="feedback">Feedback</Label>
                </div>
                <Switch
                  id="feedback"
                  checked={feedbackEnabled}
                  onCheckedChange={setFeedbackEnabled}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Debate Structure Info */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Debate Structure</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Opening statements (2 minutes each)</div>
              <div>• Rebuttal round (2 minutes each)</div>
              <div>• Closing arguments (2 minutes each)</div>
              <div>• Timer enforced per round</div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Room...' : 'Create Debate Room'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DebateRoomCreator;