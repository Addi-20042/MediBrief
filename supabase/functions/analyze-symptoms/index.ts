import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!symptoms || symptoms.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide symptoms to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
- "Emergency": Life-threatening, requires immediate medical attention (chest pain with SOB, severe headache with neurological symptoms, etc.)
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
  "generalAdvice": "Comprehensive health advice based on the symptom pattern, including lifestyle modifications and monitoring suggestions",
  "disclaimer": "This AI analysis is for educational purposes only. It does not constitute medical advice. Please consult a qualified healthcare professional for accurate diagnosis and treatment."
}

Provide 4-7 possible conditions ranked by likelihood. Be thorough, accurate, and clinically relevant.`;

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
          { role: "user", content: `Perform a comprehensive differential diagnosis analysis for the following symptoms. Consider all relevant factors including onset, duration, severity, and any patterns mentioned:\n\nSymptoms: ${symptoms}\n\nProvide a thorough analysis with accurate probability assessments and clinically relevant recommendations.` },
        ],
        temperature: 0.2,
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
      throw new Error("Failed to analyze symptoms");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    let result;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonString.trim());
    } catch {
      // If parsing fails, create a structured response from the text
      result = {
        conditions: [{
          name: "Analysis Result",
          probability: "Unknown",
          matchingSymptoms: symptoms.split(",").map((s: string) => s.trim()),
          description: content,
          recommendations: ["Please consult a healthcare professional for accurate diagnosis"],
          urgency: "Routine"
        }],
        generalAdvice: "Based on your symptoms, we recommend consulting a healthcare professional for a thorough evaluation and accurate diagnosis.",
        disclaimer: "This AI analysis is for educational purposes only. It does not constitute medical advice. Please consult a qualified healthcare professional for accurate diagnosis and treatment."
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing symptoms:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
