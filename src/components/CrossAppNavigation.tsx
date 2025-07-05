
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Bot } from 'lucide-react';
import { useCrossAppAuth } from '@/hooks/useCrossAppAuth';
import { useAuth } from '@/hooks/useAuth';

interface CrossAppNavigationProps {
  variant?: 'button' | 'link' | 'card';
  showBadge?: boolean;
}

export const CrossAppNavigation = ({ 
  variant = 'button', 
  showBadge = true 
}: CrossAppNavigationProps) => {
  const { user } = useAuth();
  const { navigateToEchoBot } = useCrossAppAuth();

  if (!user) return null;

  const handleNavigateToEchoBot = () => {
    navigateToEchoBot('/chat');
  };

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Echo Chat</h3>
              <p className="text-sm text-slate-300">Start chatting with your AI personalities</p>
            </div>
          </div>
          <Button
            onClick={handleNavigateToEchoBot}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            Open Chat App
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
        {showBadge && (
          <Badge className="mt-3 bg-green-500/20 text-green-300 border-green-500/30">
            Seamless SSO Integration
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'link') {
    return (
      <button
        onClick={handleNavigateToEchoBot}
        className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
      >
        <span>Open Echo Chat</span>
        <ExternalLink className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Button
      onClick={handleNavigateToEchoBot}
      variant="outline"
      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
    >
      <Bot className="w-4 h-4 mr-2" />
      Chat with Bots
      <ExternalLink className="w-4 h-4 ml-2" />
    </Button>
  );
};
