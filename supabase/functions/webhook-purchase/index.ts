
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { 
      user_id, 
      bot_id, 
      purchase_type, 
      amount, 
      stripe_payment_id,
      expires_at 
    } = await req.json()

    if (!user_id || !bot_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id,
        bot_id,
        purchase_type,
        amount,
        stripe_payment_id,
        expires_at,
        is_active: true
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Purchase creation error:', purchaseError)
      return new Response(
        JSON.stringify({ error: 'Failed to create purchase record' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update bot download count
    await supabase
      .from('bots')
      .update({ download_count: supabase.raw('download_count + 1') })
      .eq('id', bot_id)

    // Get bot details for the response
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('name, creator_id')
      .eq('id', bot_id)
      .single()

    // Update creator sales count if bot exists
    if (!botError && bot) {
      await supabase
        .from('creators')
        .update({ total_sales: supabase.raw('total_sales + 1') })
        .eq('id', bot.creator_id)
    }

    console.log('Purchase webhook processed:', {
      purchase_id: purchase.id,
      user_id,
      bot_id,
      bot_name: bot?.name || 'Unknown'
    })

    return new Response(
      JSON.stringify({
        success: true,
        purchase_id: purchase.id,
        message: 'Purchase processed successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
