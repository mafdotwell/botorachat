
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export interface CrossAppAuthConfig {
  echoBot: {
    domain: string;
    redirectUrl: string;
  };
  marketplace: {
    domain: string;
    redirectUrl: string;
  };
}

// Configuration for cross-app domains
const CROSS_APP_CONFIG: CrossAppAuthConfig = {
  echoBot: {
    domain: 'chat.yourapp.com', // Replace with actual echo.bot domain
    redirectUrl: 'https://chat.yourapp.com/auth/callback'
  },
  marketplace: {
    domain: 'marketplace.yourapp.com', // Replace with actual marketplace domain
    redirectUrl: 'https://marketplace.yourapp.com/auth/callback'
  }
};

export class CrossAppAuthService {
  private static readonly TOKEN_KEY = 'cross_app_token';
  private static readonly SESSION_KEY = 'cross_app_session';
  
  /**
   * Generate a secure token for cross-app authentication
   */
  static async generateCrossAppToken(session: Session): Promise<string> {
    const tokenData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user_id: session.user.id,
      timestamp: Date.now()
    };
    
    // In production, this should be encrypted/signed
    return btoa(JSON.stringify(tokenData));
  }
  
  /**
   * Validate and extract session from cross-app token
   */
  static async validateCrossAppToken(token: string): Promise<Session | null> {
    try {
      const tokenData = JSON.parse(atob(token));
      
      // Check if token is expired (5 minutes max)
      if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
        return null;
      }
      
      // Validate with Supabase
      const { data: { session }, error } = await supabase.auth.setSession({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      });
      
      if (error || !session) {
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Invalid cross-app token:', error);
      return null;
    }
  }
  
  /**
   * Navigate to another app with authentication
   */
  static async navigateToApp(
    targetApp: 'echoBot' | 'marketplace', 
    path: string = '/',
    session?: Session
  ): Promise<void> {
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    
    if (!currentSession) {
      console.error('No active session for cross-app navigation');
      return;
    }
    
    const token = await this.generateCrossAppToken(currentSession);
    const config = CROSS_APP_CONFIG[targetApp];
    const targetUrl = `https://${config.domain}${path}?auth_token=${encodeURIComponent(token)}`;
    
    window.open(targetUrl, '_blank');
  }
  
  /**
   * Handle incoming authentication from another app
   */
  static async handleIncomingAuth(): Promise<boolean> {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('auth_token');
    
    if (!authToken) {
      return false;
    }
    
    const session = await this.validateCrossAppToken(authToken);
    if (!session) {
      return false;
    }
    
    // Set the session in current app
    const { error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
    
    if (error) {
      console.error('Failed to set cross-app session:', error);
      return false;
    }
    
    // Clean up URL
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    return true;
  }
  
  /**
   * Store session for cross-app access
   */
  static storeSessionForCrossApp(session: Session): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user
      }));
    } catch (error) {
      console.warn('Failed to store cross-app session:', error);
    }
  }
  
  /**
   * Get stored session for cross-app access
   */
  static getStoredSession(): Session | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to retrieve cross-app session:', error);
      return null;
    }
  }
  
  /**
   * Clear cross-app session data
   */
  static clearCrossAppSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
