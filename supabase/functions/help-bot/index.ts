
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  message: string;
  currentPath?: string;
}

const helpResponses = {
  // General greetings and help
  greeting: "Hi! I'm the Botora Assistant 🤖. I'm here to help you navigate and make the most of our AI personality platform. What would you like to know about?",
  
  // Bot creation and creator studio
  createBot: "To create your first AI bot:\n1. Click 'Become a Creator' or go to Creator Studio\n2. Fill in your bot's personality, name, and description\n3. Upload an avatar and set pricing\n4. Test your bot before publishing\n5. Publish to the marketplace!\n\nWould you like me to guide you to the Creator Studio?",
  
  // Marketplace and discovery
  marketplace: "The Botora Marketplace is where you can:\n• Browse thousands of AI personalities\n• Filter by category (Education, Entertainment, Therapy, Business)\n• Preview bots before purchasing\n• Add favorites to your wishlist\n• Chat with bots you own\n\nTip: Use the search bar to find specific types of personalities!",
  
  // Chat functionality
  chatting: "Botora offers several chat experiences:\n• **One-on-One**: Private conversations with any AI personality\n• **Debate Rooms**: Watch AI personalities debate topics\n• **Time Machine**: Interview historical figures\n• **Motivate Me**: Get inspired by motivational personalities\n\nYou can start chatting from the homepage or marketplace!",
  
  // Pricing and monetization
  pricing: "Botora uses a flexible pricing model:\n• **Free bots**: Available to everyone\n• **Paid bots**: One-time purchase or subscription\n• **Creator earnings**: Set your own prices and earn from your bots\n• **Revenue sharing**: Fair split between creators and platform\n\nCreators can monetize their AI personalities and build a business!",
  
  // Debate rooms
  debates: "Debate Rooms let you:\n• Watch AI personalities debate any topic\n• Create custom debate scenarios\n• Choose which bots participate\n• Learn from different perspectives\n• Vote on debate winners\n\nIt's like having a philosophy class with AI minds!",
  
  // Account and profile
  account: "Your Botora account includes:\n• Personal profile and preferences\n• Library of purchased bots\n• Wishlist for future purchases\n• Creator studio (if you're a creator)\n• Chat history and favorites\n\nSign in to sync across devices and access premium features!",
}

const getContextualResponse = (message: string, currentPath?: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Context-aware responses based on current page
  if (currentPath === '/marketplace') {
    if (lowerMessage.includes('how') || lowerMessage.includes('help')) {
      return `You're in the Marketplace! Here you can:\n• Browse AI personalities by category\n• Use filters to find specific types of bots\n• Preview bots before purchasing\n• Add bots to your wishlist\n• Purchase and start chatting\n\n${helpResponses.marketplace}`;
    }
  }
  
  if (currentPath === '/creator' || currentPath?.includes('creator')) {
    if (lowerMessage.includes('how') || lowerMessage.includes('help')) {
      return `You're in the Creator Studio! ${helpResponses.createBot}`;
    }
  }
  
  if (currentPath === '/debates') {
    if (lowerMessage.includes('how') || lowerMessage.includes('help')) {
      return `You're in Debate Rooms! ${helpResponses.debates}`;
    }
  }
  
  // Intent-based responses
  if (lowerMessage.includes('create') || lowerMessage.includes('make') || lowerMessage.includes('build')) {
    return helpResponses.createBot;
  }
  
  if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('marketplace')) {
    return helpResponses.marketplace;
  }
  
  if (lowerMessage.includes('chat') || lowerMessage.includes('talk') || lowerMessage.includes('conversation')) {
    return helpResponses.chatting;
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('money') || lowerMessage.includes('earn')) {
    return helpResponses.pricing;
  }
  
  if (lowerMessage.includes('debate') || lowerMessage.includes('argument') || lowerMessage.includes('discuss')) {
    return helpResponses.debates;
  }
  
  if (lowerMessage.includes('account') || lowerMessage.includes('profile') || lowerMessage.includes('sign') || lowerMessage.includes('login')) {
    return helpResponses.account;
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help') || lowerMessage.includes('start')) {
    return helpResponses.greeting;
  }
  
  // Default helpful response
  return `I can help you with:
  
🤖 **Creating AI Bots** - Learn how to build and publish your own AI personalities
🛒 **Using the Marketplace** - Discover and purchase amazing AI bots
💬 **Chat Features** - Explore different ways to interact with AI personalities
🏛️ **Debate Rooms** - Watch AI personalities debate fascinating topics
💰 **Pricing & Earnings** - Understand costs and how creators make money
👤 **Account Management** - Profile, library, and preferences

What would you like to know more about?`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, currentPath }: ChatMessage = await req.json();
    
    console.log('Help bot request:', { message, currentPath });
    
    const response = getContextualResponse(message, currentPath);
    
    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Help bot error:', error);
    return new Response(
      JSON.stringify({ 
        response: "I'm having trouble right now. Please try asking your question again, or contact our support team if the issue persists." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
