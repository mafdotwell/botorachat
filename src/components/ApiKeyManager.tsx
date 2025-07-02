
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Plus, Trash2, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ApiKey {
  id: string;
  key_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching API keys",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    return 'pv_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const hashApiKey = async (key: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        variant: "destructive",
        title: "Key name required",
        description: "Please enter a name for your API key"
      });
      return;
    }

    setIsCreating(true);
    try {
      const newKey = generateApiKey();
      const keyHash = await hashApiKey(newKey);

      const { error } = await supabase
        .from('api_keys')
        .insert({
          key_name: newKeyName.trim(),
          key_hash: keyHash,
          user_id: user!.id
        });

      if (error) throw error;

      setGeneratedKey(newKey);
      setNewKeyName('');
      await fetchApiKeys();

      toast({
        title: "API key created",
        description: "Your new API key has been generated. Make sure to copy it!"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create API key",
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      await fetchApiKeys();
      toast({
        title: "API key deleted",
        description: "The API key has been permanently deleted"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete API key",
        description: error.message
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key copied successfully"
    });
  };

  if (loading) {
    return <div className="text-white">Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Keys</h2>
          <p className="text-slate-300">Manage your API keys for echo.bot integration</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New API Key</DialogTitle>
              <DialogDescription className="text-slate-300">
                Create a new API key to access your purchased bots on echo.bot
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName" className="text-white">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Echo Bot Production"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Button 
                onClick={createApiKey} 
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                {isCreating ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {generatedKey && (
        <Card className="bg-green-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-300 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              New API Key Generated
            </CardTitle>
            <CardDescription className="text-green-200">
              Copy this key now - you won't be able to see it again!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg">
              <code className="flex-1 text-green-300 font-mono text-sm break-all">
                {generatedKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generatedKey)}
                className="border-green-500/30 text-green-300 hover:bg-green-500/10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => setGeneratedKey(null)}
              variant="outline"
              className="mt-3 border-slate-600 text-slate-300"
            >
              I've copied the key
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-8 text-center">
              <Key className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-300">No API keys yet</p>
              <p className="text-slate-400 text-sm">Create your first API key to connect with echo.bot</p>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id} className="bg-white/5 border-white/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-white">{key.key_name}</h3>
                      <Badge variant={key.is_active ? "default" : "secondary"} className="text-xs">
                        {key.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-slate-400">
                      <p>Created: {new Date(key.created_at).toLocaleDateString()}</p>
                      {key.last_used_at && (
                        <p>Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteApiKey(key.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
