import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Store, Bot, Mic, Palette, Package, CheckCircle, Clock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MarketplaceComingSoon = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    creator_type: "",
    showcase_items: [] as string[],
    message: "",
    contact_preferences: {
      email_updates: true,
      launch_notifications: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const creatorTypes = [
    { value: "ai_creator", label: "AI Bot Creator", icon: Bot },
    { value: "voice_artist", label: "Voice Artist", icon: Mic },
    { value: "ar_vr_developer", label: "AR/VR Developer", icon: Palette },
    { value: "addon_developer", label: "Add-on Developer", icon: Package },
    { value: "content_creator", label: "Content Creator", icon: Store }
  ];

  const showcaseOptions = [
    "AI Bots & Personalities",
    "Voice Packs & Audio Content",
    "AR/VR Experiences & Assets",
    "Add-ons & Extensions",
    "Creator Tools & Resources",
    "Educational Content",
    "Entertainment Content"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.name || !formData.creator_type) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill in all required fields."
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('creator_waitlist')
        .insert([
          {
            email: formData.email,
            name: formData.name,
            creator_type: formData.creator_type,
            showcase_items: formData.showcase_items,
            message: formData.message || null,
            contact_preferences: formData.contact_preferences
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            variant: "destructive",
            title: "Already Registered",
            description: "This email is already on our waitlist. We'll notify you when the marketplace launches!"
          });
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        toast({
          title: "Welcome to the Waitlist!",
          description: "We'll notify you as soon as the Botora Marketplace launches."
        });
      }
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join waitlist. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowcaseItemChange = (item: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        showcase_items: [...prev.showcase_items, item]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        showcase_items: prev.showcase_items.filter(i => i !== item)
      }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-bold text-white mb-4">You're on the list!</h2>
            <p className="text-slate-300 mb-6">
              Thank you for joining our creator waitlist. We'll notify you as soon as the Botora Marketplace launches.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Clock className="w-4 h-4 mr-1" />
            Coming Soon
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-6">
            Botora Marketplace
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The ultimate destination for creators to showcase and monetize their AI bots, voices, AR/VR experiences, and digital creations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Bot,
              title: "AI Bots & Personalities",
              description: "Showcase your custom AI personalities and chatbots"
            },
            {
              icon: Mic,
              title: "Voice Packs & Audio",
              description: "Share voice models, sound effects, and audio content"
            },
            {
              icon: Palette,
              title: "AR/VR Experiences",
              description: "Display immersive AR and VR experiences and assets"
            },
            {
              icon: Package,
              title: "Add-ons & Extensions",
              description: "Sell plugins, tools, and functionality extensions"
            },
            {
              icon: Store,
              title: "Creator Tools",
              description: "Offer development tools and creator resources"
            },
            {
              icon: Rocket,
              title: "Launch Platform",
              description: "Comprehensive platform for creator success"
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waitlist Form */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Join the Creator Waitlist</CardTitle>
            <CardDescription className="text-slate-300">
              Be among the first to showcase your creations when we launch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Creator Type <span className="text-red-400">*</span>
                </label>
                <Select 
                  value={formData.creator_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, creator_type: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select your creator type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {creatorTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  What would you like to showcase? (Select all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {showcaseOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.showcase_items.includes(option)}
                        onCheckedChange={(checked) => handleShowcaseItemChange(option, checked as boolean)}
                        className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <label htmlFor={option} className="text-sm text-slate-300 cursor-pointer">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tell us more (Optional)
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Tell us about your creations, your goals, or anything else you'd like us to know..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email_updates"
                    checked={formData.contact_preferences.email_updates}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        contact_preferences: {
                          ...prev.contact_preferences,
                          email_updates: checked as boolean
                        }
                      }))
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <label htmlFor="email_updates" className="text-sm text-slate-300 cursor-pointer">
                    Send me updates about the marketplace development
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="launch_notifications"
                    checked={formData.contact_preferences.launch_notifications}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        contact_preferences: {
                          ...prev.contact_preferences,
                          launch_notifications: checked as boolean
                        }
                      }))
                    }
                    className="border-white/20 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <label htmlFor="launch_notifications" className="text-sm text-slate-300 cursor-pointer">
                    Notify me when the marketplace launches
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-3"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Joining Waitlist...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Join the Waitlist
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-white mb-6">Expected Timeline</h3>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm font-medium text-white">Q1 2024</div>
              <div className="text-xs text-slate-400">Waitlist Opens</div>
            </div>
            <div className="hidden md:block w-16 h-px bg-white/20"></div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-sm font-medium text-white">Q2 2024</div>
              <div className="text-xs text-slate-400">Beta Testing</div>
            </div>
            <div className="hidden md:block w-16 h-px bg-white/20"></div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Rocket className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-sm font-medium text-white">Q3 2024</div>
              <div className="text-xs text-slate-400">Public Launch</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceComingSoon;