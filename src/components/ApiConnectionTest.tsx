
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testEchoBotConnection } from '@/utils/apiClient';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiConnectionTestProps {
  apiKey: string;
}

export const ApiConnectionTest = ({ apiKey }: ApiConnectionTestProps) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const testResult = await testEchoBotConnection(apiKey);
      setResult(testResult);
    } catch (error: any) {
      setResult({ 
        success: false, 
        error: error.message || 'Connection test failed' 
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          API Connection Test
        </CardTitle>
        <CardDescription className="text-slate-300">
          Test the connection between PersonaVerse and echo.bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runTest}
          disabled={testing}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {result && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Connected" : "Failed"}
              </Badge>
            </div>

            {result.success ? (
              <div className="text-sm text-slate-300">
                <p>✅ API key verified successfully</p>
                <p>✅ User library accessible</p>
                <p>✅ Found {result.data?.total_bots || 0} purchased bots</p>
              </div>
            ) : (
              <div className="text-sm text-red-300">
                <p>❌ Connection failed: {result.error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
