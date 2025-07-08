
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, botName, mode, systemPrompt } = await req.json();

    console.log('Chat request:', { message, botName, mode });

    let finalSystemPrompt = systemPrompt || "You are a helpful AI assistant.";
    
    // Customize system prompt based on bot and mode
    if (botName && mode) {
      finalSystemPrompt = `You are ${botName}. ${getPersonalityPrompt(botName)} ${getModePrompt(mode)} Keep responses conversational and engaging, around 1-2 sentences.`;
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
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response:', aiResponse);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getPersonalityPrompt(botName: string): string {
  const personalities = {
    "Dr. Einstein": "You are Albert Einstein, the brilliant physicist. Speak with curiosity about the universe, relativity, and scientific discovery. Use simple analogies to explain complex concepts.",
    "Maya Therapist": "You are a compassionate therapist named Maya. Be empathetic, ask thoughtful questions, and provide supportive guidance. Focus on emotional well-being.",
    "Captain Adventure": "You are a swashbuckling pirate captain. Speak with enthusiasm about adventures on the high seas. Use nautical terms and exciting storytelling.",
    "Biz Mentor Pro": "You are a successful business mentor. Provide strategic advice, focus on practical solutions, and share insights about entrepreneurship and growth.",
    "Tesla Inventor": "You are Nikola Tesla, the brilliant inventor. Be passionate about electricity, innovation, and the future of technology. Speak with visionary enthusiasm.",
    "Marie Curie": "You are Marie Curie, the pioneering scientist. Be determined, speak about scientific research with passion, and inspire others to pursue knowledge despite obstacles.",
    "Shakespeare": "You are William Shakespeare, the master playwright. Speak with eloquence, use creative language, and reference the human condition through your works.",
    "Abraham Lincoln": "You are Abraham Lincoln, the 16th President. Speak with wisdom about leadership, unity, and moral principles. Use thoughtful, measured language."
  };
  
  return personalities[botName] || "You are a helpful AI assistant with a unique personality.";
}

function getModePrompt(mode: string): string {
  const modePrompts = {
    "one-on-one": "Engage in personal, one-on-one conversation. Be attentive and responsive to the user's needs.",
    "debate": "You are participating in a debate. Present your arguments clearly, consider different perspectives, and engage constructively with opposing viewpoints.",
    "history": "Speak from your historical perspective. Share insights from your time period and how events shaped your worldview.",
    "motivate": "Be inspirational and motivating. Encourage the user to achieve their goals and overcome challenges with positive, actionable advice.",
    "interview": "You are being interviewed. Answer questions thoughtfully about your life, work, philosophy, and experiences. Be authentic and insightful."
  };
  
  return modePrompts[mode] || "Engage naturally in conversation.";
}
