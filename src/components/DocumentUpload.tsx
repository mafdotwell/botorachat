
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface DocumentUploadProps {
  onDocumentUpload: (fileName: string, content: string, url: string) => void;
  disabled?: boolean;
}

const DocumentUpload = ({ onDocumentUpload, disabled }: DocumentUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a text, PDF, Word, or Markdown file"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('knowledge-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('knowledge-documents')
        .getPublicUrl(fileName);

      // Read file content for text files
      let content = "";
      if (file.type === 'text/plain' || file.type === 'text/markdown') {
        content = await file.text();
      } else {
        content = `Uploaded document: ${file.name}\nFile type: ${file.type}\nFile size: ${(file.size / 1024).toFixed(2)} KB`;
      }

      onDocumentUpload(file.name, content, data.publicUrl);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload document"
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      <Input
        type="file"
        accept=".txt,.pdf,.doc,.docx,.md"
        onChange={handleFileUpload}
        disabled={uploading || disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id="document-upload"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading || disabled}
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </div>
  );
};

export default DocumentUpload;
