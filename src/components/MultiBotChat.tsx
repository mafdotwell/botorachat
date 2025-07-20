import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, X, Play, Pause, Users, Settings, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

interface MultiBotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiBotChat = ({ isOpen, onClose }: MultiBotChatProps) => {
  const [messages, setMessages] = useState<MultiBotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedBots, setSelectedBots] = useState<Tables<'bots'>[]>([]);
  const [availableBots, setAvailableBots] = useState<Tables<'bots'>[]>([]);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [userCanInterfere, setUserCanInterfere] = useState(true);
  const [conversationSpeed, setConversationSpeed] = useState(3000); // ms between bot messages
  const [currentBotTurn, setCurrentBotTurn] = useState(0);
  const [loadingBots, setLoadingBots] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationTopic, setConversationTopic] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationInterval = useRef<NodeJS.Timeout | null>(null);
  const { sendMessage } = useChatAI();
  const { speak, stop, isPlaying } = useTextToSpeech();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableBots();
    }
  }, [isOpen]);

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
    if (isConversationActive) {
      stopConversation();
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

    setIsConversationActive(true);
    setMessages([]);
    
    // Add system message
    const systemMessage: MultiBotMessage = {
      id: `system-${Date.now()}`,
      sender: 'bot',
      content: `🤖 Multi-bot conversation started! Topic: "${conversationTopic}"`,
      timestamp: new Date(),
      isSystemMessage: true,
    };
    setMessages([systemMessage]);

    // Start the bot conversation loop
    startBotConversationLoop();
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    if (conversationInterval.current) {
      clearInterval(conversationInterval.current);
      conversationInterval.current = null;
    }
    setCurrentBotTurn(0);
    
    const systemMessage: MultiBotMessage = {
      id: `system-${Date.now()}`,
      sender: 'bot',
      content: "🛑 Conversation ended",
      timestamp: new Date(),
      isSystemMessage: true,
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const startBotConversationLoop = () => {
    conversationInterval.current = setInterval(() => {
      if (selectedBots.length > 0) {
        generateBotResponse();
      }
    }, conversationSpeed);
  };

  const generateBotResponse = async () => {
    if (!isConversationActive || selectedBots.length === 0) return;

    const currentBot = selectedBots[currentBotTurn];
    setIsTyping(true);

    try {
      // Create context from recent messages
      const recentMessages = messages.slice(-6).filter(msg => !msg.isSystemMessage);
      const conversationContext = recentMessages.length > 0 
        ? recentMessages.map(msg => `${msg.botName || 'User'}: ${msg.content}`).join('\n')
        : `Topic: ${conversationTopic}`;

      const prompt = userCanInterfere 
        ? `You are ${currentBot.name} in a multi-bot conversation about "${conversationTopic}". Other participants: ${selectedBots.filter(b => b.id !== currentBot.id).map(b => b.name).join(', ')}. Continue the conversation naturally. Recent context:\n${conversationContext}`
        : `You are ${currentBot.name} in a bot-only discussion about "${conversationTopic}". Other bots: ${selectedBots.filter(b => b.id !== currentBot.id).map(b => b.name).join(', ')}. Continue the conversation. Context:\n${conversationContext}`;

      const response = await sendMessage(prompt, currentBot.name, "multi-bot");

      const botMessage: MultiBotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        botId: currentBot.id,
        botName: currentBot.name,
        botAvatar: currentBot.avatar,
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentBotTurn((prev) => (prev + 1) % selectedBots.length);
      
    } catch (error) {
      console.error('Error generating bot response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleUserMessage = async () => {
    if (!inputMessage.trim() || !userCanInterfere) return;

    const userMessage: MultiBotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    
    // Interrupt bot conversation briefly for user interaction
    if (conversationInterval.current) {
      clearInterval(conversationInterval.current);
      setTimeout(() => {
        if (isConversationActive) {
          startBotConversationLoop();
        }
      }, 5000); // Resume after 5 seconds
    }
  };

  const handleSpeech = (text: string, botName?: string) => {
    if (isPlaying) {
      stop();
    } else {
      speak(text, botName);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Bot Conversation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex gap-4">
          {/* Bot Selection & Settings Panel */}
          <div className="w-80 space-y-4">
            <div>
              <Label htmlFor="topic">Conversation Topic</Label>
              <Input
                id="topic"
                placeholder="Enter a topic for discussion..."
                value={conversationTopic}
                onChange={(e) => setConversationTopic(e.target.value)}
                disabled={isConversationActive}
              />
            </div>

            <div className="space-y-2">
              <Label>Settings</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="user-interference"
                  checked={userCanInterfere}
                  onCheckedChange={setUserCanInterfere}
                  disabled={isConversationActive}
                />
                <Label htmlFor="user-interference" className="text-sm">
                  Allow user interference
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Response Speed</Label>
                <Select
                  value={conversationSpeed.toString()}
                  onValueChange={(value) => setConversationSpeed(parseInt(value))}
                  disabled={isConversationActive}
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
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBotFromConversation(bot.id)}
                      disabled={isConversationActive}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Available Bots</Label>
              <ScrollArea className="h-40 mt-2">
                <div className="space-y-1">
                  {availableBots
                    .filter(bot => !selectedBots.find(selected => selected.id === bot.id))
                    .map((bot) => (
                      <Button
                        key={bot.id}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto"
                        onClick={() => addBotToConversation(bot)}
                        disabled={selectedBots.length >= 4 || isConversationActive}
                      >
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={bot.avatar} alt={bot.name} />
                          <AvatarFallback>{bot.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
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

            <div className="flex gap-2">
              {!isConversationActive ? (
                <Button onClick={startConversation} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              ) : (
                <Button onClick={stopConversation} variant="destructive" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Conversation
                </Button>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4 border rounded-lg">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && !message.isSystemMessage && (
                      <Avatar className="h-8 w-8">
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
                          <Badge variant="secondary" className="text-xs">
                            {message.botName}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeech(message.content, message.botName)}
                          >
                            {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                      <div className="text-sm">{message.content}</div>
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

            {/* User Input */}
            {userCanInterfere && (
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Type your message to join the conversation..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
                  disabled={!isConversationActive}
                />
                <Button onClick={handleUserMessage} disabled={!isConversationActive}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiBotChat;