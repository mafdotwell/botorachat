
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, X, Send, Minimize2, User, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const FloatingHelpBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hi! I'm the Botora Assistant 🤖. I'm here to help you navigate and make the most of our AI personality platform. What would you like to know about?",
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('help-bot', {
        body: {
          message: inputMessage,
          currentPath: location.pathname
        }
      });

      if (error) {
        throw error;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Help bot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble right now. Please try asking your question again, or contact our support team if the issue persists.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const quickActions = [
    { label: "How to create a bot?", action: () => setInputMessage("How do I create my first bot?") },
    { label: "Browse marketplace", action: () => setInputMessage("How does the marketplace work?") },
    { label: "Chat with AI", action: () => setInputMessage("How do I chat with AI personalities?") },
    { label: "Pricing info", action: () => setInputMessage("How does pricing work?") }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40">
        <Button
          onClick={toggleChat}
          size="sm"
          className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40">
      <Card 
        className={`w-96 transition-all duration-300 shadow-2xl ${
          isMinimized ? 'h-12 md:h-14' : 'h-80 md:h-96'
        } bg-background/95 backdrop-blur-sm border-border`}
      >
        <CardHeader className="pb-2 px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Botora Assistant
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost" 
                size="sm"
                onClick={minimizeChat}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost" 
                size="sm"
                onClick={toggleChat}
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${!message.isBot ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {message.isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[250px] p-3 rounded-lg text-sm ${
                      message.isBot
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted text-muted-foreground p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">Quick help:</div>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-6 px-2"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about Botora..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FloatingHelpBot;
