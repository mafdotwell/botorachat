import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Eye, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import BotCreationOptions from "@/components/BotCreationOptions";
import TagManager from "@/components/TagManager";
import AIImageGenerator from "@/components/AIImageGenerator";
import DocumentUpload from "@/components/DocumentUpload";
import VoiceSelector from "@/components/VoiceSelector";
import type { Json } from "@/integrations/supabase/types";

const priceTypes = [
  { value: "free", label: "Free" },
  { value: "one_time", label: "One-time Purchase" },
  { value: "subscription", label: "Subscription" }
];

interface KnowledgeSource {
  id: string;
  type: string;
  title: string;
  content: string;
  url?: string;
}

interface BotFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatar: string;
  price_type: string;
  price: number;
  is_published: boolean;
  is_avr_compatible: boolean;
  has_voice_chat: boolean;
  voice_id: string;
  tone: string;
  personality_config: any;
  knowledge_sources: KnowledgeSource[];
  system_requirements: any;
}

const CreateBot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [creationMode, setCreationMode] = useState<string | null>(null);
  const [formData, setFormData] = useState<BotFormData>({
    name: "",
    description: "",
    category: "general",
    tags: [],
    avatar: "🤖",
    price_type: "free",
    price: 0,
    is_published: false,
    is_avr_compatible: false,
    has_voice_chat: false,
    voice_id: "",
    tone: "friendly",
    personality_config: {},
    knowledge_sources: [],
    system_requirements: {}
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isEditing) {
      fetchBotData();
    }
  }, [user, navigate, id, isEditing]);

  const fetchBotData = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user?.id)
        .single();

      if (error) throw error;

      // Parse knowledge_sources from Json to KnowledgeSource[]
      const knowledgeSources: KnowledgeSource[] = Array.isArray(data.knowledge_sources) 
        ? (data.knowledge_sources as any[]).map((source: any) => ({
            id: source.id || Date.now().toString(),
            type: source.type || "text",
            title: source.title || "",
            content: source.content || "",
            url: source.url || ""
          }))
        : [];

      // Parse voice settings from system_requirements
      const systemReqs = data.system_requirements as any;
      const hasVoiceChat = (systemReqs && typeof systemReqs === 'object' && systemReqs.has_voice_chat) 
        ? systemReqs.has_voice_chat 
        : false;

      const voiceId = (systemReqs && typeof systemReqs === 'object' && systemReqs.voice_id) 
        ? systemReqs.voice_id 
        : "";

      setFormData({
        name: data.name,
        description: data.description || "",
        category: data.category || "general",
        tags: data.tags || [],
        avatar: data.avatar || "🤖",
        price_type: data.price_type || "free",
        price: data.price || 0,
        is_published: data.is_published,
        is_avr_compatible: data.is_avr_compatible,
        has_voice_chat: hasVoiceChat,
        voice_id: voiceId,
        tone: data.tone || "friendly",
        personality_config: data.personality_config || {},
        knowledge_sources: knowledgeSources,
        system_requirements: data.system_requirements || {}
      });

      // Set creation mode to complete for editing
      setCreationMode("complete");
    } catch (error) {
      console.error('Error fetching bot:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bot data"
      });
      navigate('/creator');
    }
  };

  const generateDescription = async () => {
    if (formData.tags.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add some tags first"
      });
      return;
    }

    setGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-bot-description', {
        body: {
          tags: formData.tags,
          tone: formData.tone,
          existingDescription: formData.description
        }
      });

      if (error) throw error;

      if (data.description) {
        handleInputChange('description', data.description);
        toast({
          title: "Success",
          description: "AI description generated successfully!"
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate description. Please try again."
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const validateRequiredFields = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = "Bot name is required";
    }
    
    if (formData.tags.length === 0) {
      errors.tags = "At least one tag is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }
    
    setLoading(true);

    try {
      // Convert knowledge_sources to Json format for database
      const knowledgeSourcesJson: Json = formData.knowledge_sources.map(source => ({
        id: source.id,
        type: source.type,
        title: source.title,
        content: source.content,
        url: source.url || ""
      }));

      // Include has_voice_chat and voice_id in system_requirements
      const systemRequirements = {
        ...formData.system_requirements,
        has_voice_chat: formData.has_voice_chat,
        voice_id: formData.voice_id
      };

      const botData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        avatar: formData.avatar,
        price_type: formData.price_type,
        price: formData.price,
        is_published: formData.is_published,
        is_avr_compatible: formData.is_avr_compatible,
        tone: formData.tone,
        personality_config: formData.personality_config,
        knowledge_sources: knowledgeSourcesJson,
        system_requirements: systemRequirements,
        creator_id: user?.id,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error } = await supabase
          .from('bots')
          .update(botData)
          .eq('id', id)
          .eq('creator_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bots')
          .insert([botData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Bot ${isEditing ? 'updated' : 'created'} successfully${!isEditing ? '. You can publish it from Creator Studio to make it visible in the marketplace.' : ''}`
      });

      navigate('/creator');
    } catch (error) {
      console.error('Error saving bot:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} bot`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BotFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOutputTypeChange = (outputTypeId: string, checked: boolean) => {
    // This function can be removed as output_types is not part of our current form
    console.log("Output type change:", outputTypeId, checked);
  };

  const addKnowledgeSource = () => {
    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      type: "text",
      title: "",
      content: "",
      url: ""
    };
    
    setFormData(prev => ({
      ...prev,
      knowledge_sources: [...prev.knowledge_sources, newSource]
    }));
  };

  const addDocumentKnowledgeSource = (fileName: string, content: string, url: string) => {
    const newSource: KnowledgeSource = {
      id: Date.now().toString(),
      type: "document",
      title: fileName,
      content: content,
      url: url
    };
    
    setFormData(prev => ({
      ...prev,
      knowledge_sources: [...prev.knowledge_sources, newSource]
    }));
  };

  const updateKnowledgeSource = (id: string, field: keyof KnowledgeSource, value: string) => {
    setFormData(prev => ({
      ...prev,
      knowledge_sources: prev.knowledge_sources.map(source =>
        source.id === id ? { ...source, [field]: value } : source
      )
    }));
  };

  const removeKnowledgeSource = (id: string) => {
    setFormData(prev => ({
      ...prev,
      knowledge_sources: prev.knowledge_sources.filter(source => source.id !== id)
    }));
  };

  if (!creationMode && !isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/creator')}
              className="text-slate-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Creator Studio
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Create Your AI Bot</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Choose how you want to create your AI personality. Start with focused creation or build everything at once.
            </p>
          </div>

          <BotCreationOptions onOptionSelect={setCreationMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => isEditing ? navigate('/creator') : setCreationMode(null)}
            className="text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEditing ? 'Back to Creator Studio' : 'Back to Options'}
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              {isEditing ? 'Edit Bot' : 'Create New Bot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Bot Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter bot name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-400">{validationErrors.name}</p>
                  )}
                </div>

                <TagManager
                  selectedTags={formData.tags}
                  onTagsChange={(tags) => handleInputChange('tags', tags)}
                />
                {validationErrors.tags && (
                  <p className="text-sm text-red-400">{validationErrors.tags}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateDescription}
                      disabled={generatingDescription || formData.tags.length === 0}
                      className="border-white/20 text-white hover:bg-white/10 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {generatingDescription ? 'Generating...' : 'Generate with AI'}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={formData.tags.length > 0 ? `Describe your ${formData.tags[0].toLowerCase()} bot's personality and capabilities` : "Add tags first, then describe your bot's personality and capabilities"}
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none"
                    required
                  />
                  <div className="flex justify-between items-center">
                    {validationErrors.description && (
                      <p className="text-sm text-red-400">{validationErrors.description}</p>
                    )}
                    <p className="text-sm text-slate-400 ml-auto">
                      {formData.description.length}/500 characters
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/20" />

              {/* Visual Identity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Visual Identity</h3>
                <AIImageGenerator
                  currentAvatar={formData.avatar}
                  onAvatarChange={(avatarUrl) => handleInputChange('avatar', avatarUrl)}
                />
              </div>

              <Separator className="bg-white/20" />

              {/* Personality & Voice */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Personality & Voice</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Tone</Label>
                    <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="humorous">Humorous</SelectItem>
                        <SelectItem value="analytical">Analytical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="mt-1">
                      <Switch
                        id="voice-chat"
                        checked={formData.has_voice_chat}
                        onCheckedChange={(checked) => handleInputChange('has_voice_chat', checked)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="voice-chat" className="text-white font-medium cursor-pointer">
                        Voice Chat
                      </Label>
                      <p className="text-sm text-slate-400">Enable voice conversations</p>
                    </div>
                  </div>
                </div>

                {formData.has_voice_chat && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <VoiceSelector
                      selectedVoiceId={formData.voice_id}
                      onVoiceChange={(voiceId) => handleInputChange('voice_id', voiceId)}
                    />
                  </div>
                )}
              </div>

              <Separator className="bg-white/20" />

              {/* Publishing Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Publishing Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="mt-1">
                      <Switch
                        id="is-published"
                        checked={formData.is_published}
                        onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="is-published" className="text-white font-medium cursor-pointer">
                        Publish Bot
                      </Label>
                      <p className="text-sm text-slate-400">
                        {formData.is_published 
                          ? "Your bot is public and visible in the marketplace" 
                          : "Your bot is private and only visible to you"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_type" className="text-white">Price Type</Label>
                    <Select value={formData.price_type} onValueChange={(value) => handleInputChange('price_type', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.price_type !== 'free' && (
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white">
                      Price ($USD) {formData.price_type === 'subscription' && '/ month'}
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>

              <Separator className="bg-white/20" />

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : (isEditing ? 'Update Bot' : 'Create Bot')}
                </Button>
                
                {formData.name && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateBot;
