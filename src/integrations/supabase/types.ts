export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          last_used_at: string | null
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          last_used_at?: string | null
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          last_used_at?: string | null
          permissions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      bot_analytics: {
        Row: {
          bot_id: string | null
          created_at: string | null
          id: string
          interaction_data: Json | null
          interaction_type: string
          user_id: string | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          user_id?: string | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_analytics_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          avatar: string | null
          billing_interval: string | null
          botora_creator_id: string | null
          category: string
          created_at: string | null
          creator_id: string
          custom_instructions: string | null
          description: string | null
          download_count: number | null
          id: string
          is_avr_compatible: boolean | null
          is_published: boolean | null
          knowledge_files: Json | null
          knowledge_sources: Json | null
          memory_enabled: boolean | null
          name: string
          original_price: number | null
          output_modes: Json | null
          personality_config: Json | null
          price: number | null
          price_type: string | null
          rating: number | null
          reference_urls: string[] | null
          review_count: number | null
          status: string | null
          subscription_duration: number | null
          subscription_price: number | null
          system_requirements: Json | null
          tags: string[] | null
          tone: string | null
          updated_at: string | null
          voice_settings: Json | null
        }
        Insert: {
          avatar?: string | null
          billing_interval?: string | null
          botora_creator_id?: string | null
          category: string
          created_at?: string | null
          creator_id: string
          custom_instructions?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_avr_compatible?: boolean | null
          is_published?: boolean | null
          knowledge_files?: Json | null
          knowledge_sources?: Json | null
          memory_enabled?: boolean | null
          name: string
          original_price?: number | null
          output_modes?: Json | null
          personality_config?: Json | null
          price?: number | null
          price_type?: string | null
          rating?: number | null
          reference_urls?: string[] | null
          review_count?: number | null
          status?: string | null
          subscription_duration?: number | null
          subscription_price?: number | null
          system_requirements?: Json | null
          tags?: string[] | null
          tone?: string | null
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Update: {
          avatar?: string | null
          billing_interval?: string | null
          botora_creator_id?: string | null
          category?: string
          created_at?: string | null
          creator_id?: string
          custom_instructions?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_avr_compatible?: boolean | null
          is_published?: boolean | null
          knowledge_files?: Json | null
          knowledge_sources?: Json | null
          memory_enabled?: boolean | null
          name?: string
          original_price?: number | null
          output_modes?: Json | null
          personality_config?: Json | null
          price?: number | null
          price_type?: string | null
          rating?: number | null
          reference_urls?: string[] | null
          review_count?: number | null
          status?: string | null
          subscription_duration?: number | null
          subscription_price?: number | null
          system_requirements?: Json | null
          tags?: string[] | null
          tone?: string | null
          updated_at?: string | null
          voice_settings?: Json | null
        }
        Relationships: []
      }
      creators: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string
          id: string
          rating: number | null
          social_links: Json | null
          total_sales: number | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name: string
          id: string
          rating?: number | null
          social_links?: Json | null
          total_sales?: number | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          rating?: number | null
          social_links?: Json | null
          total_sales?: number | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_creator: boolean | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_creator?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_creator?: boolean | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number | null
          auto_renew: boolean | null
          billing_cycle: string | null
          bot_id: string
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          purchase_type: string | null
          purchased_at: string | null
          stripe_payment_id: string | null
          subscription_status: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          bot_id: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          purchase_type?: string | null
          purchased_at?: string | null
          stripe_payment_id?: string | null
          subscription_status?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          auto_renew?: boolean | null
          billing_cycle?: string | null
          bot_id?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          purchase_type?: string | null
          purchased_at?: string | null
          stripe_payment_id?: string | null
          subscription_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          bot_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          bot_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          bot_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_analytics: {
        Row: {
          bots_used: number | null
          date: string | null
          interaction_types: Json | null
          total_interactions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_unique_username: {
        Args: { base_email: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "creator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "creator", "user"],
    },
  },
} as const
