import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebateRoom, Side, RoundType } from '@/hooks/useDebateRoom';
import { useToast } from '@/components/ui/use-toast';
import { Timer, Users, Bot, MessageSquare, Vote, Play, Pause, Send, Crown } from 'lucide-react';

const DebateRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { toast } = useToast();
  const {
    loading,
    currentRoom,
    participants,
    messages,
    votes,
    fetchDebateRoom,
    joinDebateRoom,
    sendMessage,
    generateAIResponse,
    submitVote
  } = useDebateRoom();

  const [currentRound, setCurrentRound] = useState<RoundType>('opening');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userSide, setUserSide] = useState<Side | null>(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showVoting, setShowVoting] = useState(false);
  const [selectedVote, setSelectedVote] = useState<Side | 'tie' | null>(null);

  useEffect(() => {
    if (roomId) {
      fetchDebateRoom(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      handleRoundEnd();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleJoinDebate = async (side: Side) => {
    if (!roomId) return;
    
    try {
      await joinDebateRoom(roomId, side);
      setUserSide(side);
    } catch (error) {
      console.error('Failed to join debate:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !userSide || !roomId) return;

    const userParticipant = participants.find(p => p.side === userSide && p.participant_type === 'user');
    if (!userParticipant) return;

    try {
      await sendMessage(currentMessage, currentRound, userParticipant.id);
      setCurrentMessage('');
      
      // Generate AI response if needed
      if (currentRoom?.mode === 'ai_vs_user') {
        const aiSide = userSide === 'pro' ? 'con' : 'pro';
        const aiResponse = await generateAIResponse(aiSide, currentRound);
        
        const aiParticipant = participants.find(p => p.side === aiSide && p.participant_type === 'ai');
        if (aiParticipant) {
          await sendMessage(aiResponse, currentRound, aiParticipant.id);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleStartRound = () => {
    setIsTimerActive(true);
    setTimeLeft(120);
  };

  const handleRoundEnd = () => {
    const rounds: RoundType[] = ['opening', 'rebuttal', 'closing'];
    const currentIndex = rounds.indexOf(currentRound);
    
    if (currentIndex < rounds.length - 1) {
      setCurrentRound(rounds[currentIndex + 1]);
      setTimeLeft(120);
    } else {
      setShowVoting(true);
      toast({
        title: "Debate Completed",
        description: "The debate has ended. Time to vote!",
      });
    }
  };

  const handleVote = async () => {
    if (!selectedVote) return;
    
    try {
      await submitVote(selectedVote);
      toast({
        title: "Vote Submitted",
        description: "Thank you for your vote!",
      });
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMessagesForRound = (round: RoundType) => {
    return messages.filter(m => m.round_type === round);
  };

  const getVoteResults = () => {
    const proVotes = votes.filter(v => v.side_voted === 'pro').length;
    const conVotes = votes.filter(v => v.side_voted === 'con').length;
    const tieVotes = votes.filter(v => v.side_voted === 'tie').length;
    return { pro: proVotes, con: conVotes, tie: tieVotes };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading debate room...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p>Debate room not found.</p>
      </div>
    );
  }

  const userParticipant = participants.find(p => p.side === userSide && p.participant_type === 'user');
  const canParticipate = userParticipant && currentRoom.status === 'active';
  const voteResults = getVoteResults();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {currentRoom.title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{currentRoom.topic}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={currentRoom.status === 'active' ? 'default' : 'secondary'}>
                {currentRoom.status}
              </Badge>
              <Badge variant="outline">{currentRoom.mode.replace('_', ' vs ')}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Join Options */}
      {!userSide && currentRoom.status === 'waiting' && (
        <Card>
          <CardHeader>
            <CardTitle>Join the Debate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleJoinDebate('pro')}
                className="h-20 flex flex-col items-center justify-center"
                variant="outline"
              >
                <Crown className="h-6 w-6 mb-2" />
                Join Pro Side
              </Button>
              <Button
                onClick={() => handleJoinDebate('con')}
                className="h-20 flex flex-col items-center justify-center"
                variant="outline"
              >
                <Crown className="h-6 w-6 mb-2" />
                Join Con Side
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer and Round Info */}
      {currentRoom.status === 'active' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                <span className="font-medium capitalize">{currentRound} Round</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-mono">{formatTime(timeLeft)}</span>
                {userSide === 'pro' && ( // Assuming pro side controls the timer
                  <Button
                    size="sm"
                    onClick={isTimerActive ? () => setIsTimerActive(false) : handleStartRound}
                    variant="outline"
                  >
                    {isTimerActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
            <Progress value={(120 - timeLeft) / 120 * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Debate Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="default">Pro</Badge>
              Arguments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {getMessagesForRound(currentRound)
                  .filter(m => {
                    const participant = participants.find(p => p.id === m.participant_id);
                    return participant?.side === 'pro';
                  })
                  .map((message) => {
                    const participant = participants.find(p => p.id === message.participant_id);
                    return (
                      <div key={message.id} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {participant?.participant_type === 'ai' ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          <span className="text-sm font-medium">
                            {participant?.participant_type === 'ai' ? 'AI' : 'User'}
                          </span>
                          <Badge variant="outline" className="text-xs">{message.round_type}</Badge>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Con</Badge>
              Arguments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {getMessagesForRound(currentRound)
                  .filter(m => {
                    const participant = participants.find(p => p.id === m.participant_id);
                    return participant?.side === 'con';
                  })
                  .map((message) => {
                    const participant = participants.find(p => p.id === message.participant_id);
                    return (
                      <div key={message.id} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {participant?.participant_type === 'ai' ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          <span className="text-sm font-medium">
                            {participant?.participant_type === 'ai' ? 'AI' : 'User'}
                          </span>
                          <Badge variant="outline" className="text-xs">{message.round_type}</Badge>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Message Input */}
      {canParticipate && !showVoting && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={`Enter your ${currentRound} argument...`}
                className="flex-1"
                rows={3}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voting */}
      {showVoting && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Vote for the Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={selectedVote === 'pro' ? 'default' : 'outline'}
                  onClick={() => setSelectedVote('pro')}
                  className="h-20"
                >
                  <div className="text-center">
                    <Badge variant="default" className="mb-2">Pro</Badge>
                    <div className="text-sm">Vote Pro</div>
                  </div>
                </Button>
                <Button
                  variant={selectedVote === 'tie' ? 'default' : 'outline'}
                  onClick={() => setSelectedVote('tie')}
                  className="h-20"
                >
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">Tie</Badge>
                    <div className="text-sm">It's a Tie</div>
                  </div>
                </Button>
                <Button
                  variant={selectedVote === 'con' ? 'default' : 'outline'}
                  onClick={() => setSelectedVote('con')}
                  className="h-20"
                >
                  <div className="text-center">
                    <Badge variant="destructive" className="mb-2">Con</Badge>
                    <div className="text-sm">Vote Con</div>
                  </div>
                </Button>
              </div>
              
              <Button
                onClick={handleVote}
                disabled={!selectedVote}
                className="w-full"
              >
                Submit Vote
              </Button>

              {votes.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Current Results</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pro: {voteResults.pro} votes</span>
                      <span>Con: {voteResults.con} votes</span>
                      <span>Tie: {voteResults.tie} votes</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DebateRoom;