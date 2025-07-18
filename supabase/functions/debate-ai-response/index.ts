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
    const { debateRoomId, side, roundType, topic, previousMessages } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get previous messages context
    let context = '';
    if (previousMessages && previousMessages.length > 0) {
      context = previousMessages.map((msg: any) => 
        `${msg.side === side ? 'Your previous argument' : 'Opponent\'s argument'}: ${msg.content}`
      ).join('\n\n');
    }

    // Create debate-specific prompt based on round type
    let systemPrompt = '';
    switch (roundType) {
      case 'opening':
        systemPrompt = `You are participating in a formal debate. You are arguing the ${side} side of the topic: "${topic}". 
        This is your opening statement. Present your strongest arguments clearly and persuasively. 
        Keep your response between 100-200 words. Be respectful but passionate about your position.`;
        break;
      case 'rebuttal':
        systemPrompt = `You are participating in a formal debate. You are arguing the ${side} side of the topic: "${topic}". 
        This is your rebuttal round. Address the opponent's arguments and strengthen your position. 
        ${context ? `Context of previous arguments:\n${context}\n\n` : ''}
        Keep your response between 100-200 words. Be analytical and counter opposing points.`;
        break;
      case 'closing':
        systemPrompt = `You are participating in a formal debate. You are arguing the ${side} side of the topic: "${topic}". 
        This is your closing statement. Summarize your strongest points and make a compelling final argument. 
        ${context ? `Context of previous arguments:\n${context}\n\n` : ''}
        Keep your response between 100-200 words. Be persuasive and conclusive.`;
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
          { role: 'user', content: `Generate a ${roundType} argument for the ${side} side of: "${topic}"` }
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in debate AI response:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});