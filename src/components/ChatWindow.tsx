
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageSquare, Users, Clock, Sparkles, X, Minimize2, Maximize2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  botName?: string;
  botAvatar?: string;
  content: string;
  timestamp: Date;
}

interface ChatMode {
  id: string;
  name: string;
  description: string;
  icon: typeof MessageSquare;
  systemPrompt: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const chatModes: ChatMode[] = [
  {
    id: "debate",
    name: "Debate Room",
    description: "Watch AI personalities debate topics from different perspectives",
    icon: Users,
    systemPrompt: "You are participating in a structured debate. Present your arguments clearly and respond to opposing viewpoints respectfully."
  },
  {
    id: "history",
    name: "Talk With History",
    description: "Converse with historical figures about their times and experiences",
    icon: Clock,
    systemPrompt: "You are a historical figure. Speak from your time period's perspective and share insights from your era."
  },
  {
    id: "motivate",
    name: "Motivate Me",
    description: "Get inspired by motivational coaches and success mentors",
    icon: Sparkles,
    systemPrompt: "You are a motivational coach. Provide encouraging, actionable advice to help users achieve their goals."
  },
  {
    id: "interview",
    name: "Time Machine Interview",
    description: "Interview famous personalities from across time and space",
    icon: MessageSquare,
    systemPrompt: "You are being interviewed about your life, work, and philosophy. Answer thoughtfully and authentically."
  }
];

const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<string>("debate");
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableBots = [
    { id: "einstein", name: "Dr. Einstein", avatar: "🧑‍🔬" },
    { id: "maya", name: "Maya Therapist", avatar: "👩‍⚕️" },
    { id: "captain", name: "Captain Adventure", avatar: "🏴‍☠️" },
    { id: "mentor", name: "Biz Mentor Pro", avatar: "💼" },
    { id: "tesla", name: "Tesla Inventor", avatar: "⚡" },
    { id: "curie", name: "Marie Curie", avatar: "🧪" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateBotResponse = async (userMessage: string, botId: string) => {
    const bot = availableBots.find(b => b.id === botId);
    if (!bot) return;

    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let response = "";
    const mode = chatModes.find(m => m.id === selectedMode);
    
    // Generate contextual responses based on mode and bot
    switch (selectedMode) {
      case "debate":
        response = generateDebateResponse(userMessage, bot.name);
        break;
      case "history":
        response = generateHistoricalResponse(userMessage, bot.name);
        break;
      case "motivate":
        response = generateMotivationalResponse(userMessage, bot.name);
        break;
      case "interview":
        response = generateInterviewResponse(userMessage, bot.name);
        break;
      default:
        response = `${bot.name}: That's an interesting point about "${userMessage}". Let me share my perspective...`;
    }

    const botMessage: ChatMessage = {
      id: Date.now().toString() + bot.id,
      sender: 'bot',
      botName: bot.name,
      botAvatar: bot.avatar,
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const generateDebateResponse = (topic: string, botName: string): string => {
    const responses = {
      "Dr. Einstein": `From a scientific perspective, we must consider the empirical evidence. When examining "${topic}", I believe we should approach this with both curiosity and skepticism...`,
      "Maya Therapist": `I think it's important to consider the human element here. In my therapeutic practice, I've seen how "${topic}" affects people on a deeply personal level...`,
      "Captain Adventure": `Ahoy! In my many adventures across the seven seas, I've encountered situations like this. Let me tell ye about "${topic}" from a swashbuckler's perspective...`,
      "Biz Mentor Pro": `From a business standpoint, "${topic}" presents both opportunities and challenges. Let's analyze the market implications and strategic considerations...`,
      "Tesla Inventor": `The future holds infinite possibilities! When I consider "${topic}", I see innovation and electrical potential in ways others might not...`,
      "Marie Curie": `Through my research in radioactivity, I've learned that persistence and scientific rigor are key. Regarding "${topic}", we must approach this systematically...`
    };
    return responses[botName as keyof typeof responses] || `${botName}: Let me share my thoughts on "${topic}"...`;
  };

  const generateHistoricalResponse = (topic: string, botName: string): string => {
    const responses = {
      "Dr. Einstein": `In my time at Princeton, we pondered such questions deeply. "${topic}" reminds me of the discussions I had with Bohr about the nature of reality...`,
      "Tesla Inventor": `Ah, in my laboratory in Colorado Springs, I dreamed of wireless power transmission. "${topic}" speaks to the very essence of human progress...`,
      "Marie Curie": `When I was working with Pierre in our laboratory shed, we faced many challenges. "${topic}" requires the same dedication to truth that guided our research...`
    };
    return responses[botName as keyof typeof responses] || `${botName}: In my era, "${topic}" was viewed quite differently than today...`;
  };

  const generateMotivationalResponse = (topic: string, botName: string): string => {
    return `${botName}: You have the power to overcome any challenge! Remember, "${topic}" is just another stepping stone on your journey to greatness. Believe in yourself and take action today!`;
  };

  const generateInterviewResponse = (topic: string, botName: string): string => {
    return `${botName}: That's a fascinating question. When I reflect on "${topic}", I think about my journey and the lessons I've learned. Let me share what shaped my perspective on this...`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || selectedBots.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate responses from selected bots with staggered timing
    for (let i = 0; i < selectedBots.length; i++) {
      setTimeout(() => {
        simulateBotResponse(inputMessage, selectedBots[i]);
      }, i * 3000); // Stagger responses by 3 seconds
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentMode = chatModes.find(mode => mode.id === selectedMode);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-white/95 border border-white/20 rounded-lg shadow-2xl backdrop-blur-sm transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <span className="font-semibold text-slate-800">Multi-Bot Chat</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-600 hover:text-slate-800"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Mode Selection */}
          <div className="p-4 border-b border-white/10">
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select chat mode" />
              </SelectTrigger>
              <SelectContent>
                {chatModes.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    <div className="flex items-center space-x-2">
                      <mode.icon className="w-4 h-4" />
                      <span>{mode.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentMode && (
              <p className="text-sm text-slate-600 mt-2">{currentMode.description}</p>
            )}
          </div>

          {/* Bot Selection */}
          <div className="p-4 border-b border-white/10">
            <p className="text-sm font-medium text-slate-700 mb-2">Select Bots for Conversation:</p>
            <div className="flex flex-wrap gap-2">
              {availableBots.map((bot) => (
                <Badge
                  key={bot.id}
                  variant={selectedBots.includes(bot.id) ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    selectedBots.includes(bot.id) 
                      ? 'bg-purple-500 hover:bg-purple-600' 
                      : 'hover:bg-slate-200'
                  }`}
                  onClick={() => {
                    setSelectedBots(prev => 
                      prev.includes(bot.id) 
                        ? prev.filter(id => id !== bot.id)
                        : [...prev, bot.id]
                    );
                  }}
                >
                  <span className="mr-1">{bot.avatar}</span>
                  {bot.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 h-80">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select bots and start a conversation!</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{message.botAvatar}</span>
                        <span className="text-sm font-medium">{message.botName}</span>
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-purple-200' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                disabled={selectedBots.length === 0}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || selectedBots.length === 0}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {selectedBots.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">Select at least one bot to start chatting</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
