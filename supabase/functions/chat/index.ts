import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES = 50;

// Sanitize text to prevent prompt injection
function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

// Validate message structure
function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }
  
  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }
  
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  }
  
  const sanitized: Array<{ role: string; content: string }> = [];
  
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: "Each message must be an object" };
    }
    
    const { role, content } = msg as { role?: unknown; content?: unknown };
    
    if (typeof role !== 'string' || !['user', 'assistant'].includes(role)) {
      return { valid: false, error: "Message role must be 'user' or 'assistant'" };
    }
    
    if (typeof content !== 'string') {
      return { valid: false, error: "Message content must be a string" };
    }
    
    if (content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }
    
    sanitized.push({ role, content: sanitizeText(content) });
  }
  
  return { valid: true, sanitized };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = body as { messages?: unknown };
    const validation = validateMessages(messages);
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a helpful and empathetic medical AI assistant. You provide general health information, explain medical concepts, and offer guidance on health-related questions.

IMPORTANT GUIDELINES:
1. You are NOT a doctor and cannot provide medical diagnoses or prescriptions
2. Always encourage users to consult healthcare professionals for serious concerns
3. Be empathetic and supportive in your responses
4. Explain medical terms in simple, understandable language
5. When discussing symptoms or conditions, provide balanced information
6. For emergencies, always advise seeking immediate medical attention
7. Respect user privacy and be sensitive about health topics

You can help with:
- Explaining medical conditions and symptoms
- General health and wellness tips
- Understanding medical terminology
- Lifestyle and preventive health advice
- Information about medications (general, not prescriptive)
- Mental health support and resources
- Nutrition and exercise guidance

Always end responses about symptoms or conditions with a reminder to consult a healthcare professional.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...validation.sanitized!,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
