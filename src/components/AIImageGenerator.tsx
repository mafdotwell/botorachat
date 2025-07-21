
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Upload, Wand2, Image as ImageIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AvatarUpload from "./AvatarUpload";

interface AIImageGeneratorProps {
  currentAvatar: string;
  onAvatarChange: (avatarUrl: string) => void;
}

const stylePresets = [
  { value: "realistic", label: "Realistic", description: "Photorealistic style" },
  { value: "cartoon", label: "Cartoon", description: "Animated cartoon style" },
  { value: "anime", label: "Anime", description: "Japanese anime style" },
  { value: "abstract", label: "Abstract", description: "Abstract artistic style" },
  { value: "professional", label: "Professional", description: "Clean business style" },
  { value: "artistic", label: "Artistic", description: "Creative artistic style" },
  { value: "minimalist", label: "Minimalist", description: "Simple and clean" },
  { value: "cyberpunk", label: "Cyberpunk", description: "Futuristic tech style" }
];

const AIImageGenerator = ({ currentAvatar, onAvatarChange }: AIImageGeneratorProps) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("professional");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a description for your avatar"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-avatar-image', {
        body: {
          prompt: `${prompt}, ${selectedStyle} style, avatar, profile picture, high quality`,
          style: selectedStyle
        }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setGeneratedImages(prev => [data.imageUrl, ...prev.slice(0, 7)]); // Keep last 8 images
        toast({
          title: "Success",
          description: "Avatar generated successfully!"
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate image. Please try again."
      });
    } finally {
      setGenerating(false);
    }
  };

  const useGeneratedImage = (imageUrl: string) => {
    onAvatarChange(imageUrl);
    toast({
      title: "Success",
      description: "Avatar selected successfully!"
    });
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-avatar-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download image"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
          <TabsTrigger value="upload" className="text-slate-300 data-[state=active]:text-white">
            <Upload className="w-4 h-4 mr-2" />
            Upload Avatar
          </TabsTrigger>
          <TabsTrigger value="generate" className="text-slate-300 data-[state=active]:text-white">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate with AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <AvatarUpload
            currentAvatar={currentAvatar}
            onAvatarChange={onAvatarChange}
          />
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Avatar Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Avatar Description</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the avatar you want to create (e.g., 'friendly robot with blue eyes', 'professional woman with glasses', 'cartoon cat with hat')"
                  rows={3}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Style Preset</Label>
                <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stylePresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        <div>
                          <div className="font-medium">{preset.label}</div>
                          <div className="text-sm text-slate-400">{preset.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateImage}
                disabled={generating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {generating ? 'Generating Avatar...' : 'Generate Avatar'}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Images Grid */}
          {generatedImages.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Generated Avatars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Generated avatar ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-white/10 group-hover:border-purple-500/50 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => useGeneratedImage(imageUrl)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadImage(imageUrl)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIImageGenerator;
