
import { supabase } from "@/integrations/supabase/client";

export const useChatAI = () => {
  const sendMessage = async (message: string, botName: string, mode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message,
          botName,
          mode,
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      return data.response;
    } catch (error) {
      console.error('Error calling chat AI:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  };

  return { sendMessage };
};
