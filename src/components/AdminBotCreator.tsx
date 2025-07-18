import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bot, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from "./AvatarUpload";

interface AdminBotCreatorProps {
  onBotCreated: () => void;
}

const categories = [
  "Education",
  "Entertainment", 
  "Productivity",
  "Health & Fitness",
  "Business",
  "Creative",
  "Technical",
  "Lifestyle"
];

const AdminBotCreator = ({ onBotCreated }: AdminBotCreatorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    avatar: "🤖",
    price_type: "free" as const,
    price: 0,
    is_published: true,
    is_avr_compatible: false,
    personality_config: {
      tone: "friendly",
      style: "professional",
      expertise_level: "expert"
    },
    knowledge_sources: [],
    system_requirements: {
      output_types: ["text"],
      has_voice_chat: false,
      voice_id: ""
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    setLoading(true);

    try {
      // Create bot with current user as creator but mark as Botora bot
      const botData = {
        name: formData.name,
        description: formData.description,
        category: formData.category.toLowerCase(),
        avatar: formData.avatar,
        price_type: formData.price_type,
        price: formData.price,
        is_published: formData.is_published,
        is_avr_compatible: formData.is_avr_compatible,
        personality_config: formData.personality_config,
        knowledge_sources: formData.knowledge_sources,
        system_requirements: formData.system_requirements,
        creator_id: user?.id, // Admin user creates it
        botora_creator_id: user?.id, // Mark as Botora bot
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bots')
        .insert([botData]);

      if (error) throw error;

      // Create a special creator profile entry for displaying "Botora" as creator
      // This will be handled in the display logic

      toast({
        title: "Success",
        description: "Botora bot created successfully and published to marketplace!"
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        avatar: "🤖",
        price_type: "free",
        price: 0,
        is_published: true,
        is_avr_compatible: false,
        personality_config: {
          tone: "friendly",
          style: "professional",
          expertise_level: "expert"
        },
        knowledge_sources: [],
        system_requirements: {
          output_types: ["text"],
          has_voice_chat: false,
          voice_id: ""
        }
      });

      onBotCreated();
    } catch (error) {
      console.error('Error creating bot:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create bot"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-white">Create Official Botora Bot</CardTitle>
            <CardDescription className="text-slate-400">
              Create AI personalities that will be displayed as created by "Botora"
            </CardDescription>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border-purple-500/30 w-fit">
          <Bot className="w-3 h-3 mr-1" />
          Official Botora Content
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Bot Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter official bot name"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <AvatarUpload
                currentAvatar={formData.avatar}
                onAvatarChange={(avatarUrl) => handleInputChange('avatar', avatarUrl)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)} required>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this official Botora AI personality and its capabilities"
              rows={4}
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none"
              required
            />
            <p className="text-sm text-slate-400">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Personality Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Personality Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Tone</Label>
                <Select 
                  value={formData.personality_config.tone} 
                  onValueChange={(value) => handleInputChange('personality_config', {
                    ...formData.personality_config,
                    tone: value
                  })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Style</Label>
                <Select 
                  value={formData.personality_config.style} 
                  onValueChange={(value) => handleInputChange('personality_config', {
                    ...formData.personality_config,
                    style: value
                  })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Expertise Level</Label>
                <Select 
                  value={formData.personality_config.expertise_level} 
                  onValueChange={(value) => handleInputChange('personality_config', {
                    ...formData.personality_config,
                    expertise_level: value
                  })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner-Friendly</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_avr_compatible"
                  checked={formData.is_avr_compatible}
                  onChange={(e) => handleInputChange('is_avr_compatible', e.target.checked)}
                  className="rounded border-white/20 bg-white/10"
                />
                <Label htmlFor="is_avr_compatible" className="text-white">
                  AR/VR Compatible
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="rounded border-white/20 bg-white/10"
                />
                <Label htmlFor="is_published" className="text-white">
                  Publish Immediately
                </Label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating Bot...' : 'Create Official Botora Bot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminBotCreator;