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
    const { reportText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!reportText || reportText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide report text to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a medical AI assistant specialized in analyzing medical reports. You are NOT a doctor and your analysis is for educational purposes only.

When given medical report text, you must:
1. Extract key medical information (test results, diagnoses, medications)
2. Summarize the report in simple, understandable language
3. Identify potential health concerns or abnormal findings
4. Suggest possible conditions based on the findings
5. Provide recommendations

IMPORTANT: Always remind users to consult their healthcare provider for interpretation.

Respond with a JSON object in this exact format:
{
  "summary": "Plain language summary of the report",
  "keyFindings": [
    {
      "category": "Category (e.g., Blood Tests, Imaging, Vitals)",
      "finding": "The finding",
      "status": "Normal/Abnormal/Borderline",
      "interpretation": "What this means"
    }
  ],
  "possibleConditions": [
    {
      "name": "Condition Name",
      "likelihood": "High/Medium/Low",
      "relatedFindings": ["finding1", "finding2"],
      "description": "Brief description"
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "urgency": "Emergency/Urgent/Routine/Follow-up",
  "disclaimer": "Medical disclaimer"
}`;

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
          { role: "user", content: `Analyze this medical report and provide a comprehensive summary:\n\n${reportText}` },
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
      throw new Error("Failed to analyze report");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON from the response
    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonString.trim());
    } catch {
      result = {
        summary: content,
        keyFindings: [],
        possibleConditions: [],
        recommendations: ["Please consult your healthcare provider for interpretation"],
        urgency: "Follow-up",
        disclaimer: "This is for educational purposes only and not medical advice."
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
