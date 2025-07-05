
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AvatarUploadProps {
  currentAvatar: string;
  onAvatarChange: (avatarUrl: string) => void;
}

const AvatarUpload = ({ currentAvatar, onAvatarChange }: AvatarUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('bot-avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('bot-avatars')
        .getPublicUrl(fileName);

      onAvatarChange(data.publicUrl);
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload avatar"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    onAvatarChange("🤖");
  };

  const isImageUrl = currentAvatar.startsWith('http');

  return (
    <div className="space-y-4">
      <Label className="text-white">Bot Avatar</Label>
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          {isImageUrl ? (
            <AvatarImage src={currentAvatar} alt="Bot avatar" />
          ) : (
            <AvatarFallback className="text-2xl bg-white/10 border-white/20">
              {currentAvatar}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </div>
          
          {isImageUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              className="border-red-500/20 text-red-400 hover:bg-red-500/20"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
      
      {!isImageUrl && (
        <div className="space-y-2">
          <Label htmlFor="emoji-avatar" className="text-white text-sm">Or use emoji</Label>
          <Input
            id="emoji-avatar"
            value={currentAvatar}
            onChange={(e) => onAvatarChange(e.target.value)}
            placeholder="🤖"
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 w-20"
          />
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
