import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTextToSpeechReturn {
  speak: (text: string, voiceId?: string) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  isLoading: boolean;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  }, [currentAudio]);

  const speak = useCallback(async (text: string, voiceId: string = '9BWtsMINqrJLrRacOk9x') => {
    if (!text.trim()) return;

    // Stop any currently playing audio
    stop();

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voiceId,
        }
      });

      if (error) {
        console.error('Error generating speech:', error);
        throw error;
      }

      if (data?.audioContent) {
        // Create audio from base64 data
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
          URL.revokeObjectURL(audioUrl);
        };

        setCurrentAudio(audio);
        await audio.play();
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
    } finally {
      setIsLoading(false);
    }
  }, [stop]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
};