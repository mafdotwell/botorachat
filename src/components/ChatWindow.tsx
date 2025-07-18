
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, ArrowLeft, Loader2, Minimize2, Maximize2, Square } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatAI } from "@/hooks/useChatAI";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  botName?: string;
  botAvatar?: string;
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: string;
}

type ChatSize = 'small' | 'medium' | 'full';

const ChatWindow = ({ isOpen, onClose, initialMode = "one-on-one" }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedBot, setSelectedBot] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [showBotSelector, setShowBotSelector] = useState(true);
  const [availableBots, setAvailableBots] = useState<Tables<'bots'>[]>([]);
  const [loadingBots, setLoadingBots] = useState(true);
  const [chatSize, setChatSize] = useState<ChatSize>('full');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useChatAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch bots from database
  useEffect(() => {
    const fetchBots = async () => {
    try {
      setLoadingBots(true);
      const { data: botsData, error: botsError } = await supabase
        .from('bots')
        .select('*')
        .eq('is_published', true)
        .order('download_count', { ascending: false })
        .limit(20);

      if (botsError) {
        console.error('Error fetching bots:', botsError);
      } else {
        // Format bots with proper fallbacks
        const formattedBots = botsData?.map(bot => ({
          ...bot,
          name: bot.name || `Bot ${bot.id.slice(0, 8)}`
        })) || [];
        setAvailableBots(formattedBots);
      }
      } catch (error) {
        console.error('Error fetching bots:', error);
      } finally {
        setLoadingBots(false);
      }
    };

    if (isOpen) {
      fetchBots();
    }
  }, [isOpen]);

  const getAIResponse = async (userMessage: string, botId: string) => {
    const bot = availableBots.find(b => b.id === botId);
    if (!bot) return;

    setIsTyping(true);
    
    try {
      const response = await sendMessage(userMessage, bot.name, initialMode);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString() + bot.id,
        sender: 'bot',
        botName: bot.name,
        botAvatar: bot.avatar || '🤖',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + bot.id,
        sender: 'bot',
        botName: bot.name,
        botAvatar: bot.avatar || '🤖',
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedBot) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage("");

    getAIResponse(messageToSend, selectedBot);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectBot = (botId: string) => {
    setSelectedBot(botId);
    setShowBotSelector(false);
    setMessages([]);
  };

  const selectedBotData = availableBots.find(bot => bot.id === selectedBot);

  const getSizeClasses = () => {
    switch (chatSize) {
      case 'small':
        return 'fixed bottom-4 right-4 w-80 h-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]';
      case 'medium':
        return 'fixed bottom-4 right-4 w-96 h-[32rem] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]';
      case 'full':
      default:
        return 'fixed inset-0';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${getSizeClasses()} bg-white z-50 flex flex-col rounded-lg shadow-xl border`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          {!showBotSelector && selectedBotData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBotSelector(true)}
              className="text-slate-600 hover:text-slate-800 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          {selectedBotData && !showBotSelector && (
            <>
              <Avatar className="w-6 h-6 sm:w-8 sm:h-8 shrink-0">
                {selectedBotData.avatar && selectedBotData.avatar.startsWith('http') ? (
                  <AvatarImage src={selectedBotData.avatar} alt={selectedBotData.name} />
                ) : (
                  <AvatarFallback className="text-sm sm:text-lg">
                    {selectedBotData.avatar || '🤖'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{selectedBotData.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate">{selectedBotData.description}</p>
              </div>
            </>
          )}
          {showBotSelector && (
            <h2 className="font-semibold text-slate-800 text-sm sm:text-base">Choose a Character</h2>
          )}
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          {/* Size controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatSize('small')}
            className={`text-slate-600 hover:text-slate-800 ${chatSize === 'small' ? 'bg-slate-100' : ''}`}
            title="Small"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatSize('medium')}
            className={`text-slate-600 hover:text-slate-800 ${chatSize === 'medium' ? 'bg-slate-100' : ''}`}
            title="Medium"
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatSize('full')}
            className={`text-slate-600 hover:text-slate-800 ${chatSize === 'full' ? 'bg-slate-100' : ''}`}
            title="Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showBotSelector ? (
          /* Bot Selection Screen */
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              {loadingBots ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  <span className="ml-2 text-slate-600">Loading personalities...</span>
                </div>
              ) : availableBots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">No personality bots available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {availableBots.map((bot) => (
                    <div
                      key={bot.id}
                      onClick={() => selectBot(bot.id)}
                      className="p-3 sm:p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8 sm:w-12 sm:h-12 shrink-0">
                          {bot.avatar && bot.avatar.startsWith('http') ? (
                            <AvatarImage src={bot.avatar} alt={bot.name} />
                          ) : (
                            <AvatarFallback className="text-lg sm:text-2xl">
                              {bot.avatar || '🤖'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">{bot.name}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">{bot.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{bot.category}</span>
                            {bot.price && bot.price > 0 ? (
                              <span className="text-xs text-green-600 font-medium">${bot.price}</span>
                            ) : (
                              <span className="text-xs text-blue-600 font-medium">Free</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 px-3 sm:px-4">
              <div className="max-w-3xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6">
                {messages.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <Avatar className="w-16 h-16 sm:w-24 sm:h-24 mb-4 mx-auto">
                      {selectedBotData?.avatar && selectedBotData.avatar.startsWith('http') ? (
                        <AvatarImage src={selectedBotData.avatar} alt={selectedBotData.name} />
                      ) : (
                        <AvatarFallback className="text-2xl sm:text-4xl">
                          {selectedBotData?.avatar || '🤖'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">
                      Chat with {selectedBotData?.name}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 px-4">
                      {selectedBotData?.description}
                    </p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.sender === 'bot' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
                            {message.botAvatar && message.botAvatar.startsWith('http') ? (
                              <AvatarImage src={message.botAvatar} alt={message.botName} />
                            ) : (
                              <AvatarFallback className="text-xs sm:text-sm">
                                {message.botAvatar || '🤖'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="text-xs sm:text-sm font-medium text-slate-700">{message.botName}</span>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
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
            <div className="border-t bg-white p-3 sm:p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex space-x-2 sm:space-x-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedBotData?.name}...`}
                    className="flex-1 rounded-full border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
