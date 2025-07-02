
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { CrossAppAuthService } from '@/services/crossAppAuth';
import { useToast } from '@/hooks/use-toast';

export const useCrossAppAuth = () => {
  const [isHandlingAuth, setIsHandlingAuth] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleIncomingAuth = async () => {
      try {
        const hasIncomingAuth = await CrossAppAuthService.handleIncomingAuth();
        
        if (hasIncomingAuth) {
          toast({
            title: "Welcome back!",
            description: "You've been automatically signed in from PersonaVerse."
          });
        }
      } catch (error) {
        console.error('Cross-app auth error:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to authenticate from the other app."
        });
      } finally {
        setIsHandlingAuth(false);
      }
    };

    handleIncomingAuth();
  }, [toast]);

  useEffect(() => {
    // Store session for cross-app access when user logs in
    if (session) {
      CrossAppAuthService.storeSessionForCrossApp(session);
    }
  }, [session]);

  const navigateToEchoBot = async (path?: string) => {
    await CrossAppAuthService.navigateToApp('echoBot', path, session);
  };

  const navigateToMarketplace = async (path?: string) => {
    await CrossAppAuthService.navigateToApp('marketplace', path, session);
  };

  return {
    isHandlingAuth,
    navigateToEchoBot,
    navigateToMarketplace
  };
};
