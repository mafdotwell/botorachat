
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const useHelpBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('help-bot', {
        body: {
          message,
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
  }, [location.pathname, isLoading]);

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hi! I'm the Botora Assistant 🤖. I'm here to help you navigate and make the most of our AI personality platform. What would you like to know about?",
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  return {
    messages,
    isLoading,
    sendMessage,
    initializeChat,
    setMessages
  };
};
