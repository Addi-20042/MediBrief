import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGE_LENGTH = 5000;
const MAX_MESSAGES = 50;

function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '').trim().slice(0, MAX_MESSAGE_LENGTH);
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) return { valid: false, error: "Messages must be an array" };
  if (messages.length === 0) return { valid: false, error: "Messages array cannot be empty" };
  if (messages.length > MAX_MESSAGES) return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  
  const sanitized: Array<{ role: string; content: string }> = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') return { valid: false, error: "Each message must be an object" };
    const { role, content } = msg as { role?: unknown; content?: unknown };
    if (typeof role !== 'string' || !['user', 'assistant'].includes(role)) return { valid: false, error: "Message role must be 'user' or 'assistant'" };
    if (typeof content !== 'string') return { valid: false, error: "Message content must be a string" };
    if (content.length > MAX_MESSAGE_LENGTH) return { valid: false, error: `Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    sanitized.push({ role, content: sanitizeText(content) });
  }
  return { valid: true, sanitized };
}

function getAiApiKey(): string {
  const key = Deno.env.get("GOOGLE_GEMINI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!key) {
    throw new Error("The AI chat service is not configured. Add GOOGLE_GEMINI_API_KEY in your Supabase project secrets.");
  }
  return key;
}

function getProviderErrorMessage(providerName: string, status: number, rawText: string): string {
  let parsedMessage = rawText;

  try {
    const parsed = JSON.parse(rawText);
    const payload = Array.isArray(parsed) ? parsed[0] : parsed;
    parsedMessage = payload?.error?.message || payload?.message || rawText;
  } catch {
    parsedMessage = rawText;
  }

  if (status === 429) {
    return `${providerName} quota exceeded or rate limited. ${parsedMessage}`;
  }

  return `${providerName} error ${status}. ${parsedMessage}`;
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

async function getStreamingResponse(messages: Array<{ role: string; content: string }>): Promise<Response> {
  const apiKey = getAiApiKey();
  const providers = [
    {
      name: "Google Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: apiKey,
      model: "gemini-2.5-flash",
    },
  ];
  let lastErrorMessage = "";

  for (const provider of providers) {
    if (!provider.key) { console.log(`Skipping ${provider.name}: no API key`); continue; }
    try {
      console.log(`Trying ${provider.name}...`);
      const response = await fetch(provider.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      });
      if (response.status === 429 || response.status === 402) {
        const t = await response.text();
        lastErrorMessage = getProviderErrorMessage(provider.name, response.status, t);
        console.log(`${provider.name} error ${response.status}, trying next...`);
        continue;
      }
      if (!response.ok) {
        const t = await response.text();
        lastErrorMessage = getProviderErrorMessage(provider.name, response.status, t);
        console.error(`${provider.name} error:`, response.status, t);
        continue;
      }
      console.log(`${provider.name} succeeded`);
      return response;
    } catch (err) {
      lastErrorMessage = err instanceof Error ? err.message : `${provider.name} request failed`;
      console.error(`${provider.name} failed:`, err);
    }
  }
  throw new Error(lastErrorMessage || "All AI providers failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // No authentication required - available to all users
    let body: unknown;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { messages } = body as { messages?: unknown };
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await getStreamingResponse(validation.sanitized!);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const message = error instanceof Error
      ? error.message
      : "An error occurred while processing your request";
    return new Response(JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
