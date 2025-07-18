import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { debateRoomId, messages, feedbackType } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Prepare messages for analysis
    const messageContext = messages.map((msg: any) => 
      `${msg.side} (${msg.round_type}): ${msg.content}`
    ).join('\n\n');

    let systemPrompt = '';
    let analysisPrompt = '';

    switch (feedbackType) {
      case 'ai_summary':
        systemPrompt = 'You are an expert debate analyst. Provide a comprehensive summary of the debate.';
        analysisPrompt = `Analyze this debate and provide a summary including:
        1. Main arguments from both sides
        2. Strongest points made
        3. Overall quality of the debate
        4. Key takeaways
        
        Debate content:
        ${messageContext}`;
        break;
        
      case 'scoring':
        systemPrompt = 'You are a professional debate judge. Provide fair scoring and evaluation.';
        analysisPrompt = `Score this debate on the following criteria (1-10 scale):
        1. Argument strength
        2. Evidence quality
        3. Rebuttal effectiveness
        4. Persuasiveness
        5. Overall presentation
        
        Provide scores for both pro and con sides with brief explanations.
        
        Debate content:
        ${messageContext}`;
        break;
        
      case 'tone_analysis':
        systemPrompt = 'You are a communication expert analyzing debate tone and style.';
        analysisPrompt = `Analyze the tone and communication style in this debate:
        1. Respectfulness level
        2. Emotional intensity
        3. Persuasive techniques used
        4. Communication effectiveness
        5. Areas for improvement
        
        Debate content:
        ${messageContext}`;
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Store feedback in database
    const { error: insertError } = await supabaseClient
      .from('debate_feedback')
      .insert({
        debate_room_id: debateRoomId,
        feedback_type: feedbackType,
        content: { analysis, timestamp: new Date().toISOString() }
      });

    if (insertError) {
      console.error('Error storing feedback:', insertError);
    }

    return new Response(JSON.stringify({ 
      feedback: analysis,
      type: feedbackType 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in debate feedback:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});