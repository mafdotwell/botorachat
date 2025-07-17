import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    const { botId, billingCycle } = await req.json();

    if (!botId) {
      throw new Error("Missing bot ID");
    }

    // Get bot details
    const { data: botData, error: botError } = await supabaseClient
      .from("bots")
      .select("name, subscription_price, subscription_duration, billing_interval")
      .eq("id", botId)
      .single();

    if (botError || !botData) {
      throw new Error(`Error getting bot details: ${botError?.message || "Bot not found"}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
    }

    const cycle = billingCycle || botData.billing_interval || 'monthly';
    const interval = cycle === 'yearly' ? 'year' : 'month';
    const intervalCount = 1;
    
    const unitAmount = Math.round(
      cycle === 'yearly' 
        ? botData.subscription_price * 10 // 16.7% discount for yearly
        : botData.subscription_price * 100
    );

    // Create a subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${botData.name} Subscription (${cycle})`,
              description: `Access to ${botData.name}`,
            },
            unit_amount: unitAmount, // Price in cents
            recurring: {
              interval,
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get("origin")}/subscription-success?bot_id=${botId}`,
      cancel_url: `${req.headers.get("origin")}/bot/${botId}`,
      metadata: {
        bot_id: botId,
        user_id: user.id,
        billing_cycle: cycle
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${errorMessage}`);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});