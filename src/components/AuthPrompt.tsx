import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { User, Heart, MessageSquare, Crown, Zap } from "lucide-react";

interface AuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "wishlist" | "chat" | "debate" | "create" | "premium";
  botName?: string;
}

const AuthPrompt = ({ isOpen, onClose, trigger, botName }: AuthPromptProps) => {
  const navigate = useNavigate();

  const getPromptContent = () => {
    switch (trigger) {
      case "wishlist":
        return {
          icon: Heart,
          title: "Save Your Favorites",
          description: `Sign in to add ${botName || "this bot"} to your wishlist and keep track of your favorite AI personalities.`,
          benefits: ["Save unlimited bots to your wishlist", "Get notified of updates", "Sync across all devices"]
        };
      case "chat":
        return {
          icon: MessageSquare,
          title: "Start Chatting",
          description: `Create an account to have unlimited conversations with ${botName || "AI personalities"} and save your chat history.`,
          benefits: ["Unlimited conversations", "Chat history saved", "Personalized AI responses"]
        };
      case "debate":
        return {
          icon: Crown,
          title: "Join the Debate",
          description: "Sign in to participate in AI debates, vote on winners, and track your debate performance.",
          benefits: ["Participate in live debates", "Vote and provide feedback", "Track your debate wins"]
        };
      case "create":
        return {
          icon: Zap,
          title: "Create Your Bot",
          description: "Join our creator community to build and monetize your own AI personalities.",
          benefits: ["Create unlimited bots", "Monetize your creations", "Access creator analytics"]
        };
      case "premium":
        return {
          icon: Crown,
          title: "Unlock Premium Features",
          description: "Sign in to access premium bots and advanced features.",
          benefits: ["Access premium bots", "Priority chat responses", "Advanced customization"]
        };
    }
  };

  const content = getPromptContent();
  const IconComponent = content.icon;

  const handleSignIn = () => {
    navigate("/auth?tab=signin");
    onClose();
  };

  const handleSignUp = () => {
    navigate("/auth?tab=signup");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md bg-card border-border">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-foreground">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4">
          <div className="space-y-2">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <AlertDialogFooter className="flex flex-col space-y-2">
          <Button onClick={handleSignUp} className="w-full">
            Create Account
          </Button>
          <Button onClick={handleSignIn} variant="outline" className="w-full">
            Sign In
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full text-muted-foreground">
            Continue browsing
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AuthPrompt;