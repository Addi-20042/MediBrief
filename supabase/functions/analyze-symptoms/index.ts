import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MIN_SYMPTOMS_LENGTH = 10;
const MAX_SYMPTOMS_LENGTH = 3000;

function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '').trim();
}

function validateSymptoms(symptoms: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof symptoms !== 'string') return { valid: false, error: "Symptoms must be a string" };
  const trimmed = symptoms.trim();
  if (trimmed.length === 0) return { valid: false, error: "Please provide symptoms to analyze" };
  if (trimmed.length < MIN_SYMPTOMS_LENGTH) return { valid: false, error: `Please provide at least ${MIN_SYMPTOMS_LENGTH} characters describing your symptoms` };
  if (trimmed.length > MAX_SYMPTOMS_LENGTH) return { valid: false, error: `Symptoms description cannot exceed ${MAX_SYMPTOMS_LENGTH} characters` };
  return { valid: true, sanitized: sanitizeText(trimmed) };
}

// Try multiple AI providers with failover
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const providers = [
    {
      name: "Google Gemini Direct",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: Deno.env.get("GOOGLE_GEMINI_API_KEY"),
      model: "gemini-2.0-flash",
    },
    {
      name: "Lovable AI Gateway",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      key: Deno.env.get("LOVABLE_API_KEY"),
      model: "google/gemini-3-flash-preview",
    },
  ];

  for (const provider of providers) {
    if (!provider.key) {
      console.log(`Skipping ${provider.name}: no API key`);
      continue;
    }

    try {
      console.log(`Trying ${provider.name}...`);
      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      });

      if (response.status === 429) {
        console.log(`${provider.name} rate limited, trying next...`);
        continue;
      }
      if (response.status === 402) {
        console.log(`${provider.name} payment required, trying next...`);
        continue;
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${provider.name} error:`, response.status, errorText);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        console.log(`${provider.name} succeeded`);
        return content;
      }
      console.log(`${provider.name} returned no content`);
    } catch (err) {
      console.error(`${provider.name} failed:`, err);
    }
  }

  throw new Error("All AI providers failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let body: unknown;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { symptoms } = body as { symptoms?: unknown };
    const validation = validateSymptoms(symptoms);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `You are an advanced medical AI diagnostic assistant with expertise in clinical symptom analysis and differential diagnosis. You are trained on extensive medical literature and clinical guidelines. You are NOT a doctor and your predictions are for educational purposes only.

CRITICAL ANALYSIS FRAMEWORK:
1. Parse each symptom carefully, considering:
   - Duration and onset (acute vs chronic)
   - Severity and intensity
   - Location and radiation
   - Associated symptoms and patterns
   - Aggravating and alleviating factors

2. Apply evidence-based differential diagnosis methodology:
   - Consider common conditions first (Occam's razor)
   - Don't miss critical "can't miss" diagnoses
   - Account for age-appropriate conditions
   - Consider both primary and secondary causes

3. For EACH condition, calculate probability based on:
   - Symptom overlap percentage
   - Pathophysiological correlation
   - Epidemiological likelihood
   - Clinical presentation patterns

PROBABILITY CALCULATION GUIDELINES:
- "High" (70-90%): Strong symptom correlation, multiple matching symptoms, classic presentation
- "Medium" (40-69%): Moderate correlation, some matching symptoms, possible presentation
- "Low" (15-39%): Weak correlation, few matching symptoms, atypical presentation

URGENCY CLASSIFICATION:
- "Emergency": Life-threatening, requires immediate medical attention
- "Urgent": Needs medical attention within 24-48 hours
- "Routine": Can be addressed at next available appointment
- "Self-care": Can be managed at home with monitoring

IMPORTANT GUIDELINES:
- Always remind users to consult a healthcare professional for proper diagnosis
- Be thorough and accurate in your analysis
- Provide actionable, specific recommendations
- Consider drug interactions if medications are mentioned
- Flag any red flag symptoms immediately

Respond with a JSON object in this EXACT format:
{
  "conditions": [
    {
      "name": "Condition Name",
      "probability": "High/Medium/Low",
      "matchingSymptoms": ["symptom1", "symptom2"],
      "description": "Detailed description including pathophysiology and why symptoms match",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"],
      "urgency": "Emergency/Urgent/Routine/Self-care"
    }
  ],
  "generalAdvice": "Comprehensive health advice based on the symptom pattern",
  "disclaimer": "This AI analysis is for educational purposes only. It does not constitute medical advice. Please consult a qualified healthcare professional for accurate diagnosis and treatment."
}

Provide 4-7 possible conditions ranked by likelihood. Be thorough, accurate, and clinically relevant.`;

    const userPrompt = `Perform a comprehensive differential diagnosis analysis for the following symptoms. Consider all relevant factors including onset, duration, severity, and any patterns mentioned:\n\nSymptoms: ${validation.sanitized}\n\nProvide a thorough analysis with accurate probability assessments and clinically relevant recommendations.`;

    const content = await callAI(systemPrompt, userPrompt);

    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonString.trim());
    } catch {
      result = {
        conditions: [{
          name: "Analysis Result",
          probability: "Unknown",
          matchingSymptoms: validation.sanitized!.split(",").map((s: string) => s.trim()),
          description: content,
          recommendations: ["Please consult a healthcare professional for accurate diagnosis"],
          urgency: "Routine"
        }],
        generalAdvice: "Based on your symptoms, we recommend consulting a healthcare professional for a thorough evaluation.",
        disclaimer: "This AI analysis is for educational purposes only."
      };
    }

    return new Response(JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    return new Response(JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
