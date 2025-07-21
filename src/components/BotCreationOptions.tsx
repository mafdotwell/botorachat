
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
      title: "Create Personality/Behavior",
      description: "Design AI personality traits, conversation style, and expertise areas",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      features: ["Personality traits", "Conversation style", "Expertise areas", "Behavioral guidelines"]
    },
    {
      id: "voice",
      title: "Create Voice/Tone",
      description: "Configure voice settings, speaking style, and emotional range",
      icon: Mic,
      color: "from-blue-500 to-cyan-500",
      features: ["Voice selection", "Tone customization", "Speaking pace", "Language style"]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {creationOptions.map((option) => {
        const IconComponent = option.icon;
        return (
          <Card key={option.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg group-hover:text-purple-300 transition-colors">
                    {option.title}
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-slate-400">
                {option.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-slate-300">
                    <Sparkles className="w-3 h-3 text-purple-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => onOptionSelect(option.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BotCreationOptions;
