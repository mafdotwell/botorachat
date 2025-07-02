
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Hash API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash)

    // Get user's purchased bots with bot details
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        *,
        bots (
          id,
          name,
          avatar,
          category,
          personality_config,
          knowledge_sources,
          system_requirements,
          is_avr_compatible
        )
      `)
      .eq('user_id', apiKeyData.user_id)
      .eq('is_active', true)

    if (purchasesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user library' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Format response for echo.bot
    const library = purchases?.map(purchase => ({
      purchase_id: purchase.id,
      purchase_type: purchase.purchase_type,
      purchased_at: purchase.purchased_at,
      expires_at: purchase.expires_at,
      bot: purchase.bots
    })) || []

    return new Response(
      JSON.stringify({
        success: true,
        library,
        user_id: apiKeyData.user_id,
        total_bots: library.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
