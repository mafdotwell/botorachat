import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Initialize Supabase client with auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    // Get the user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Parse the request body
    const { botId } = await req.json();

    if (!botId) {
      throw new Error("Missing bot ID");
    }

    // Check if the bot exists in the user's wishlist
    const { data: existingItems, error: selectError } = await supabaseClient
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("bot_id", botId)
      .limit(1);

    if (selectError) {
      throw new Error(`Error checking wishlist: ${selectError.message}`);
    }

    let result;
    let isAdded = false;

    if (existingItems && existingItems.length > 0) {
      // Bot already in wishlist - remove it
      const { error: deleteError } = await supabaseClient
        .from("wishlists")
        .delete()
        .eq("id", existingItems[0].id);

      if (deleteError) {
        throw new Error(`Error removing from wishlist: ${deleteError.message}`);
      }
      
      result = { message: "Removed from wishlist", isLiked: false };
    } else {
      // Bot not in wishlist - add it
      const { error: insertError } = await supabaseClient
        .from("wishlists")
        .insert([{ user_id: user.id, bot_id: botId }]);

      if (insertError) {
        throw new Error(`Error adding to wishlist: ${insertError.message}`);
      }
      
      result = { message: "Added to wishlist", isLiked: true };
      isAdded = true;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});