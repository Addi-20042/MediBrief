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

    const systemPrompt = `You are a medical AI assistant specialized in analyzing symptoms and predicting potential health conditions. You are NOT a doctor and your predictions are for educational purposes only.

When given symptoms, you must:
1. Analyze the symptoms carefully
2. Consider various possible conditions that match these symptoms
3. Rank conditions by likelihood based on symptom match
4. Provide detailed information about each condition

IMPORTANT: Always remind users to consult a healthcare professional for proper diagnosis.

Respond with a JSON object in this exact format:
{
  "conditions": [
    {
      "name": "Condition Name",
      "probability": "High/Medium/Low",
      "matchingSymptoms": ["symptom1", "symptom2"],
      "description": "Brief description of the condition",
      "recommendations": ["recommendation1", "recommendation2"],
      "urgency": "Emergency/Urgent/Routine/Self-care"
    }
  ],
  "generalAdvice": "General health advice based on symptoms",
  "disclaimer": "Medical disclaimer"
}

Provide 3-7 possible conditions based on symptom relevance. Be thorough and accurate.`;

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
          { role: "user", content: `Analyze these symptoms and predict possible conditions: ${symptoms}` },
        ],
        temperature: 0.3,
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
          recommendations: ["Please consult a healthcare professional"],
          urgency: "Routine"
        }],
        generalAdvice: "Please consult a healthcare professional for accurate diagnosis.",
        disclaimer: "This is for educational purposes only and not medical advice."
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
