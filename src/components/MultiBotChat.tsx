
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, X, Play, Pause, Users, Settings, Volume2, VolumeX, SkipForward, RotateCcw, Download, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useChatAI } from "@/hooks/useChatAI";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

interface MultiBotMessage {
  id: string;
  sender: 'user' | 'bot';
  botId?: string;
  botName?: string;
  botAvatar?: string;
  content: string;
  timestamp: Date;
  isSystemMessage?: boolean;
  turnNumber?: number;
}

interface ConversationState {
  phase: 'setup' | 'waiting-for-user' | 'bots-responding' | 'bot-only-active' | 'paused' | 'ended';
  currentBotIndex: number;
  currentTurn: number;
  waitingForBotId?: string;
}

interface MultiBotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONVERSATION_TEMPLATES = [
  { id: 'general', name: 'General Discussion', prompt: 'Have a casual discussion about the topic' },
  { id: 'debate', name: 'Debate', prompt: 'Present different viewpoints and debate the topic respectfully' },
  { id: 'brainstorm', name: 'Brainstorming', prompt: 'Generate creative ideas and build on each other\'s suggestions' },
  { id: 'storytelling', name: 'Collaborative Storytelling', prompt: 'Create a story together, each adding to the narrative' },
  { id: 'problem-solving', name: 'Problem Solving', prompt: 'Work together to analyze and solve a problem' },
];

const MultiBotChat = ({ isOpen, onClose }: MultiBotChatProps) => {
  const [messages, setMessages] = useState<MultiBotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedBots, setSelectedBots] = useState<Tables<'bots'>[]>([]);
  const [availableBots, setAvailableBots] = useState<Tables<'bots'>[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'setup',
    currentBotIndex: 0,
    currentTurn: 0,
  });
  const [userCanInterfere, setUserCanInterfere] = useState(true);
  const [conversationSpeed, setConversationSpeed] = useState(3000);
  const [maxTurns, setMaxTurns] = useState([20]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationTopic, setConversationTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const conversationInterval = useRef<NodeJS.Timeout | null>(null);
  const botsResponseQueue = useRef<string[]>([]);
  
  const { sendMessage } = useChatAI();
  const { speak, stop, isPlaying } = useTextToSpeech();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableBots();
    }
  }, [isOpen]);

  // Handle bot response queue for user interference mode
  useEffect(() => {
    if (conversationState.phase === 'bots-responding' && botsResponseQueue.current.length > 0) {
      const nextBotId = botsResponseQueue.current.shift();
      if (nextBotId) {
        generateSingleBotResponse(nextBotId);
      }
    }
  }, [conversationState.phase, botsResponseQueue.current.length]);

  const fetchAvailableBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('is_published', true)
        .limit(10);

      if (error) throw error;
      setAvailableBots(data || []);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Error",
        description: "Failed to load available bots",
        variant: "destructive",
      });
    } finally {
      setLoadingBots(false);
    }
  };

  const addBotToConversation = (bot: Tables<'bots'>) => {
    if (selectedBots.length >= 4) {
      toast({
        title: "Maximum bots reached",
        description: "You can have maximum 4 bots in a conversation",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedBots.find(b => b.id === bot.id)) {
      setSelectedBots([...selectedBots, bot]);
    }
  };

  const removeBotFromConversation = (botId: string) => {
    setSelectedBots(selectedBots.filter(bot => bot.id !== botId));
    if (conversationState.phase !== 'setup') {
      pauseConversation();
    }
  };

  const startConversation = async () => {
    if (selectedBots.length < 2) {
      toast({
        title: "Need more bots",
        description: "Select at least 2 bots to start a conversation",
        variant: "destructive",
      });
      return;
    }

    if (!conversationTopic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a conversation topic",
        variant: "destructive",
      });
      return;
    }

    const template = CONVERSATION_TEMPLATES.find(t => t.id === selectedTemplate);
    const systemMessage: MultiBotMessage = {
      id: `system-${Date.now()}`,
      sender: 'bot',
      content: `🤖 Multi-bot conversation started! 
Topic: "${conversationTopic}"
Mode: ${template?.name}
${userCanInterfere ? 'User can participate' : `Bot-only conversation (${maxTurns[0]} turns max)`}`,
      timestamp: new Date(),
      isSystemMessage: true,
      turnNumber: 0,
    };

    setMessages([systemMessage]);
    setConversationState({
      phase: userCanInterfere ? 'waiting-for-user' : 'bot-only-active',
      currentBotIndex: 0,
      currentTurn: 1,
    });

    if (!userCanInterfere) {
      startBotOnlyConversation();
    }
  };

  const startBotOnlyConversation = () => {
    conversationInterval.current = setInterval(() => {
      if (conversationState.currentTurn > maxTurns[0]) {
        endConversation();
        return;
      }
      generateBotResponse();
    }, conversationSpeed);
  };

  const handleUserMessage = async () => {
    if (!inputMessage.trim() || conversationState.phase !== 'waiting-for-user') return;

    const userMessage: MultiBotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      turnNumber: conversationState.currentTurn,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Queue all bots to respond to user message
    botsResponseQueue.current = selectedBots.map(bot => bot.id);
    setConversationState(prev => ({
      ...prev,
      phase: 'bots-responding',
      currentBotIndex: 0,
    }));
  };

  const generateSingleBotResponse = async (botId: string) => {
    const bot = selectedBots.find(b => b.id === botId);
    if (!bot) return;

    setIsTyping(true);
    setConversationState(prev => ({ ...prev, waitingForBotId: botId }));

    try {
      const template = CONVERSATION_TEMPLATES.find(t => t.id === selectedTemplate);
      const recentMessages = messages.slice(-8).filter(msg => !msg.isSystemMessage);
      const conversationContext = recentMessages.length > 0 
        ? recentMessages.map(msg => `${msg.botName || 'User'}: ${msg.content}`).join('\n')
        : `Topic: ${conversationTopic}`;

      const prompt = `You are ${bot.name} in a multi-bot conversation about "${conversationTopic}". 
Style: ${template?.prompt}
Other participants: ${selectedBots.filter(b => b.id !== bot.id).map(b => b.name).join(', ')}${userCanInterfere ? ' and the User' : ''}.
Respond naturally and stay in character. Keep responses concise (1-2 sentences).

Recent context:
${conversationContext}`;

      const response = await sendMessage(prompt, bot.name, "multi-bot");

      const botMessage: MultiBotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        botId: bot.id,
        botName: bot.name,
        botAvatar: bot.avatar,
        content: response,
        timestamp: new Date(),
        turnNumber: conversationState.currentTurn,
      };

      setMessages(prev => [...prev, botMessage]);

      // Check if all bots have responded
      if (botsResponseQueue.current.length === 0) {
        setConversationState(prev => ({
          ...prev,
          phase: 'waiting-for-user',
          currentTurn: prev.currentTurn + 1,
          waitingForBotId: undefined,
        }));
      }
      
    } catch (error) {
      console.error('Error generating bot response:', error);
      toast({
        title: "Error",
        description: "Failed to generate bot response",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = async () => {
    if (conversationState.currentTurn > maxTurns[0]) {
      endConversation();
      return;
    }

    const currentBot = selectedBots[conversationState.currentBotIndex];
    setIsTyping(true);
    setConversationState(prev => ({ ...prev, waitingForBotId: currentBot.id }));

    try {
      const template = CONVERSATION_TEMPLATES.find(t => t.id === selectedTemplate);
      const recentMessages = messages.slice(-6).filter(msg => !msg.isSystemMessage);
      const conversationContext = recentMessages.length > 0 
        ? recentMessages.map(msg => `${msg.botName || 'User'}: ${msg.content}`).join('\n')
        : `Topic: ${conversationTopic}`;

      const prompt = `You are ${currentBot.name} in a bot-only discussion about "${conversationTopic}".
Style: ${template?.prompt}
Other bots: ${selectedBots.filter(b => b.id !== currentBot.id).map(b => b.name).join(', ')}.
Continue the conversation naturally. Keep responses engaging but concise.

Context:
${conversationContext}`;

      const response = await sendMessage(prompt, currentBot.name, "multi-bot");

      const botMessage: MultiBotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        botId: currentBot.id,
        botName: currentBot.name,
        botAvatar: currentBot.avatar,
        content: response,
        timestamp: new Date(),
        turnNumber: conversationState.currentTurn,
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationState(prev => ({
        ...prev,
        currentBotIndex: (prev.currentBotIndex + 1) % selectedBots.length,
        currentTurn: prev.currentBotIndex === selectedBots.length - 1 ? prev.currentTurn + 1 : prev.currentTurn,
        waitingForBotId: undefined,
      }));
      
    } catch (error) {
      console.error('Error generating bot response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const pauseConversation = () => {
    if (conversationInterval.current) {
      clearInterval(conversationInterval.current);
      conversationInterval.current = null;
    }
    setConversationState(prev => ({ ...prev, phase: 'paused' }));
  };

  const resumeConversation = () => {
    if (userCanInterfere) {
      setConversationState(prev => ({ ...prev, phase: 'waiting-for-user' }));
    } else {
      setConversationState(prev => ({ ...prev, phase: 'bot-only-active' }));
      startBotOnlyConversation();
    }
  };

  const endConversation = () => {
    if (conversationInterval.current) {
      clearInterval(conversationInterval.current);
      conversationInterval.current = null;
    }
    
    const endMessage: MultiBotMessage = {
      id: `system-${Date.now()}`,
      sender: 'bot',
      content: `🛑 Conversation ended after ${conversationState.currentTurn} turns`,
      timestamp: new Date(),
      isSystemMessage: true,
    };
    
    setMessages(prev => [...prev, endMessage]);
    setConversationState({ phase: 'ended', currentBotIndex: 0, currentTurn: 0 });
  };

  const resetConversation = () => {
    endConversation();
    setMessages([]);
    setConversationState({ phase: 'setup', currentBotIndex: 0, currentTurn: 0 });
    setInputMessage("");
    botsResponseQueue.current = [];
  };

  const skipCurrentBot = () => {
    if (conversationState.phase === 'bot-only-active' && conversationInterval.current) {
      clearInterval(conversationInterval.current);
      setConversationState(prev => ({
        ...prev,
        currentBotIndex: (prev.currentBotIndex + 1) % selectedBots.length,
      }));
      setTimeout(() => startBotOnlyConversation(), 500);
    }
  };

  const exportConversation = () => {
    const transcript = messages
      .filter(msg => !msg.isSystemMessage)
      .map(msg => `[${msg.timestamp.toLocaleTimeString()}] ${msg.botName || 'User'}: ${msg.content}`)
      .join('\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversationTopic.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSpeech = (text: string, botName?: string) => {
    if (isPlaying) {
      stop();
    } else {
      speak(text, botName);
    }
  };

  const getConversationProgress = () => {
    if (!userCanInterfere && maxTurns[0] > 0) {
      return (conversationState.currentTurn / maxTurns[0]) * 100;
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Multi-Bot Conversation
            </CardTitle>
            {conversationState.phase !== 'setup' && (
              <Badge variant={conversationState.phase === 'paused' ? 'secondary' : 'default'}>
                {conversationState.phase === 'waiting-for-user' && 'Waiting for you'}
                {conversationState.phase === 'bots-responding' && 'Bots responding'}
                {conversationState.phase === 'bot-only-active' && 'Bots chatting'}
                {conversationState.phase === 'paused' && 'Paused'}
                {conversationState.phase === 'ended' && 'Ended'}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex gap-4 min-h-0">
          {/* Settings Panel */}
          <div className="w-80 space-y-4 flex-shrink-0">
            <div>
              <Label htmlFor="topic">Conversation Topic</Label>
              <Input
                id="topic"
                placeholder="Enter a topic for discussion..."
                value={conversationTopic}
                onChange={(e) => setConversationTopic(e.target.value)}
                disabled={conversationState.phase !== 'setup'}
              />
            </div>

            <div>
              <Label htmlFor="template">Conversation Style</Label>
              <Select 
                value={selectedTemplate} 
                onValueChange={setSelectedTemplate}
                disabled={conversationState.phase !== 'setup'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONVERSATION_TEMPLATES.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="user-interference"
                  checked={userCanInterfere}
                  onCheckedChange={setUserCanInterfere}
                  disabled={conversationState.phase !== 'setup'}
                />
                <Label htmlFor="user-interference" className="text-sm">
                  Allow user participation
                </Label>
              </div>
              
              {!userCanInterfere && (
                <div className="space-y-2">
                  <Label className="text-sm">Max Turns: {maxTurns[0]}</Label>
                  <Slider
                    value={maxTurns}
                    onValueChange={setMaxTurns}
                    max={50}
                    min={5}
                    step={5}
                    disabled={conversationState.phase !== 'setup'}
                  />
                  {conversationState.phase !== 'setup' && (
                    <Progress value={getConversationProgress()} className="w-full" />
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-sm">Response Speed</Label>
                <Select
                  value={conversationSpeed.toString()}
                  onValueChange={(value) => setConversationSpeed(parseInt(value))}
                  disabled={conversationState.phase !== 'setup'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000">Fast (2s)</SelectItem>
                    <SelectItem value="3000">Normal (3s)</SelectItem>
                    <SelectItem value="5000">Slow (5s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bot Selection */}
            <div>
              <Label>Selected Bots ({selectedBots.length}/4)</Label>
              <div className="space-y-2 mt-2">
                {selectedBots.map((bot) => (
                  <div key={bot.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={bot.avatar} alt={bot.name} />
                        <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{bot.name}</span>
                      {conversationState.waitingForBotId === bot.id && (
                        <Badge variant="outline" className="text-xs">typing...</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBotFromConversation(bot.id)}
                      disabled={conversationState.phase !== 'setup'}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Available Bots</Label>
              <ScrollArea className="h-32 mt-2">
                <div className="space-y-1">
                  {availableBots
                    .filter(bot => !selectedBots.find(selected => selected.id === bot.id))
                    .map((bot) => (
                      <Button
                        key={bot.id}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto"
                        onClick={() => addBotToConversation(bot)}
                        disabled={selectedBots.length >= 4 || conversationState.phase !== 'setup'}
                      >
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={bot.avatar} alt={bot.name} />
                          <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                          <div className="text-sm font-medium">{bot.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {bot.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
              </ScrollArea>
            </div>

            {/* Control Buttons */}
            <div className="space-y-2">
              {conversationState.phase === 'setup' && (
                <Button onClick={startConversation} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              )}
              
              {conversationState.phase === 'paused' && (
                <Button onClick={resumeConversation} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              
              {(['waiting-for-user', 'bots-responding', 'bot-only-active'].includes(conversationState.phase)) && (
                <div className="flex gap-2">
                  <Button onClick={pauseConversation} variant="outline" className="flex-1">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  {conversationState.phase === 'bot-only-active' && (
                    <Button onClick={skipCurrentBot} variant="outline" size="sm">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {conversationState.phase !== 'setup' && (
                <div className="flex gap-2">
                  <Button onClick={resetConversation} variant="destructive" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={exportConversation} variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative flex-1">
              <ScrollArea 
                className="h-full border rounded-lg"
                onScrollCapture={handleScroll}
                ref={scrollAreaRef}
              >
                <div className="p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'bot' && !message.isSystemMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.botAvatar} alt={message.botName} />
                          <AvatarFallback>{message.botName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isSystemMessage
                            ? 'bg-muted text-center w-full'
                            : message.sender === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        {message.sender === 'bot' && !message.isSystemMessage && (
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {message.botName}
                              </Badge>
                              {message.turnNumber && (
                                <Badge variant="outline" className="text-xs">
                                  Turn {message.turnNumber}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSpeech(message.content, message.botName)}
                            >
                              {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </Button>
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>...</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Scroll to bottom button */}
              {showScrollButton && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-4 right-4 rounded-full"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* User Input */}
            {userCanInterfere && conversationState.phase === 'waiting-for-user' && (
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Type your message to join the conversation..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
                />
                <Button onClick={handleUserMessage} disabled={!inputMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {userCanInterfere && conversationState.phase === 'bots-responding' && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Bots are responding to your message... ({botsResponseQueue.current.length} remaining)
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiBotChat;
