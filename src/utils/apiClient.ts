
import { supabase } from '@/integrations/supabase/client';

export class EchoBotApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.baseUrl = 'https://uxlmkhntolnyvhmdenxr.supabase.co/functions/v1';
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, data?: any) {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  async verifyBotAccess(botId: string) {
    return this.makeRequest('verify-bot-access', { bot_id: botId });
  }

  async getUserLibrary() {
    return this.makeRequest('user-library');
  }

  async syncInventory(lastSync?: string) {
    return this.makeRequest('sync-inventory', { last_sync: lastSync });
  }
}

// Helper function to test API connectivity from PersonaVerse
export const testEchoBotConnection = async (apiKey: string) => {
  try {
    const client = new EchoBotApiClient(apiKey);
    const result = await client.getUserLibrary();
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Function to handle purchase webhooks
export const processPurchaseWebhook = async (purchaseData: {
  user_id: string;
  bot_id: string;
  purchase_type: string;
  amount: number;
  stripe_payment_id?: string;
  expires_at?: string;
}) => {
  try {
    const response = await supabase.functions.invoke('webhook-purchase', {
      body: purchaseData
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error: any) {
    console.error('Purchase webhook error:', error);
    throw error;
  }
};
