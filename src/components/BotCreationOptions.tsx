
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Mic, Image, Bot, Sparkles } from "lucide-react";

interface BotCreationOptionsProps {
  onOptionSelect: (option: string) => void;
}

const BotCreationOptions = ({ onOptionSelect }: BotCreationOptionsProps) => {
  const creationOptions = [
    {
      id: "personality",
      title: "AI Personality",
      icon: Brain,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "voice",
      title: "AI Voice",
      icon: Mic,
      color: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {creationOptions.map((option) => {
        const IconComponent = option.icon;
        return (
          <Button
            key={option.id}
            onClick={() => onOptionSelect(option.id)}
            className="bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 py-3 px-4 h-auto flex items-center gap-3 w-full justify-start min-h-[60px]"
          >
            <div className={`p-2.5 rounded-lg bg-gradient-to-r ${option.color} flex-shrink-0`}>
              <IconComponent className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-base font-medium truncate">{option.title}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default BotCreationOptions;
