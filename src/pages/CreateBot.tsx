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
import { ArrowLeft, Save, Eye, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import AvatarUpload from "@/components/AvatarUpload";
import DocumentUpload from "@/components/DocumentUpload";
import type { Json } from "@/integrations/supabase/types";

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
  avatar: string;
  price_type: string;
  price: number;
  is_published: boolean;
  is_avr_compatible: boolean;
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
  const [formData, setFormData] = useState<BotFormData>({
    name: "",
    description: "",
    category: "",
    avatar: "🤖",
    price_type: "free",
    price: 0,
    is_published: false,
    is_avr_compatible: false,
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

      setFormData({
        name: data.name,
        description: data.description || "",
        category: data.category,
        avatar: data.avatar || "🤖",
        price_type: data.price_type || "free",
        price: data.price || 0,
        is_published: data.is_published,
        is_avr_compatible: data.is_avr_compatible,
        personality_config: data.personality_config || {},
        knowledge_sources: knowledgeSources,
        system_requirements: data.system_requirements || {}
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const botData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        avatar: formData.avatar,
        price_type: formData.price_type,
        price: formData.price,
        is_published: formData.is_published,
        is_avr_compatible: formData.is_avr_compatible,
        personality_config: formData.personality_config,
        knowledge_sources: knowledgeSourcesJson,
        system_requirements: formData.system_requirements,
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
        description: `Bot ${isEditing ? 'updated' : 'created'} successfully`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
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

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-2xl">
              {isEditing ? 'Edit Bot' : 'Create New Bot'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                <div className="space-y-2">
                  <AvatarUpload
                    currentAvatar={formData.avatar}
                    onAvatarChange={(avatarUrl) => handleInputChange('avatar', avatarUrl)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your bot's personality and capabilities"
                  rows={4}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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

              <Separator className="bg-white/20" />

              {/* Knowledge Base */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Knowledge Base</h3>
                  <div className="flex gap-2">
                    <DocumentUpload
                      onDocumentUpload={addDocumentKnowledgeSource}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKnowledgeSource}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Text Source
                    </Button>
                  </div>
                </div>
                
                {formData.knowledge_sources.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/20 rounded-lg">
                    <p className="text-slate-400">No knowledge sources added yet</p>
                    <p className="text-sm text-slate-500 mt-1">Add knowledge sources to enhance your bot's capabilities</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.knowledge_sources.map((source, index) => (
                      <Card key={source.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="text-white font-medium">Knowledge Source #{index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeKnowledgeSource(source.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label className="text-white">Type</Label>
                              <Select 
                                value={source.type} 
                                onValueChange={(value) => updateKnowledgeSource(source.id, 'type', value)}
                              >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text Document</SelectItem>
                                  <SelectItem value="url">Website URL</SelectItem>
                                  <SelectItem value="faq">FAQ</SelectItem>
                                  <SelectItem value="manual">User Manual</SelectItem>
                                  <SelectItem value="document">Uploaded Document</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-white">Title</Label>
                              <Input
                                value={source.title}
                                onChange={(e) => updateKnowledgeSource(source.id, 'title', e.target.value)}
                                placeholder="Knowledge source title"
                                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                              />
                            </div>
                          </div>
                          
                          {source.type === 'url' && (
                            <div className="space-y-2 mb-4">
                              <Label className="text-white">URL</Label>
                              <Input
                                value={source.url || ''}
                                onChange={(e) => updateKnowledgeSource(source.id, 'url', e.target.value)}
                                placeholder="https://example.com"
                                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                              />
                            </div>
                          )}

                          {source.type === 'document' && source.url && (
                            <div className="space-y-2 mb-4">
                              <Label className="text-white">Document</Label>
                              <div className="flex items-center gap-2 p-2 bg-white/5 rounded border border-white/10">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-300">{source.title}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(source.url, '_blank')}
                                  className="text-cyan-400 hover:text-cyan-300 ml-auto"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label className="text-white">Content</Label>
                            <Textarea
                              value={source.content}
                              onChange={(e) => updateKnowledgeSource(source.id, 'content', e.target.value)}
                              placeholder="Enter the knowledge content that your bot should learn from..."
                              rows={4}
                              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 resize-none"
                              readOnly={source.type === 'document'}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-white/20" />

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Pricing</h3>
                
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

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">AR/VR Compatible</Label>
                    <p className="text-sm text-slate-400">Enable immersive AR/VR experiences</p>
                  </div>
                  <Switch
                    checked={formData.is_avr_compatible}
                    onCheckedChange={(checked) => handleInputChange('is_avr_compatible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Publish Bot</Label>
                    <p className="text-sm text-slate-400">Make your bot visible in the marketplace</p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                  />
                </div>
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
