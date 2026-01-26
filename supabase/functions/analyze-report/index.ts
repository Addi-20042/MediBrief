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

    const systemPrompt = `You are an expert medical AI assistant specialized in analyzing medical reports, lab results, and diagnostic tests. You have extensive training in clinical pathology, radiology, and laboratory medicine. You are NOT a doctor and your analysis is for educational purposes only.

COMPREHENSIVE ANALYSIS FRAMEWORK:

1. REPORT TYPE IDENTIFICATION:
   - Laboratory tests (CBC, metabolic panels, lipid profiles, etc.)
   - Imaging reports (X-ray, CT, MRI, ultrasound)
   - Pathology reports
   - Vital signs and physical examination findings
   - Specialty test results

2. KEY FINDINGS ANALYSIS:
   For each finding, evaluate:
   - Normal vs abnormal status with reference ranges
   - Clinical significance and severity
   - Trending (if multiple values provided)
   - Correlation with other findings
   - Potential causes of abnormalities

3. DIFFERENTIAL DIAGNOSIS:
   - List possible conditions based on findings
   - Calculate probability using:
     * Number of supporting findings
     * Severity of abnormalities
     * Clinical patterns and correlations
   - Consider both common and serious conditions

PROBABILITY ASSESSMENT:
- "High" (70-90%): Multiple findings strongly support this condition
- "Medium" (40-69%): Some findings suggest this condition
- "Low" (15-39%): Findings are consistent but not definitive

URGENCY CLASSIFICATION:
- "Emergency": Critical values requiring immediate attention
- "Urgent": Significant abnormalities needing prompt follow-up
- "Routine": Minor deviations for scheduled review
- "Follow-up": Normal with recommended monitoring

INTERPRETATION GUIDELINES:
- Always provide context for medical values
- Explain implications in plain language
- Highlight critical or panic values immediately
- Suggest appropriate follow-up testing
- Consider medication effects on lab values

IMPORTANT: Always remind users to discuss results with their healthcare provider for proper interpretation.

Respond with a JSON object in this EXACT format:
{
  "summary": "Comprehensive plain language summary of the report findings, highlighting the most important results and their implications for the patient's health",
  "keyFindings": [
    {
      "category": "Category (e.g., Blood Tests, Imaging, Vitals, Liver Function, Kidney Function)",
      "finding": "Specific finding with value and reference range",
      "status": "Normal/Abnormal/Borderline/Critical",
      "interpretation": "Detailed explanation of what this finding means and its clinical significance"
    }
  ],
  "possibleConditions": [
    {
      "name": "Condition Name",
      "likelihood": "High/Medium/Low",
      "relatedFindings": ["finding1", "finding2"],
      "description": "Detailed description of the condition and why the findings suggest it"
    }
  ],
  "recommendations": ["Specific actionable recommendation 1", "Specific actionable recommendation 2"],
  "urgency": "Emergency/Urgent/Routine/Follow-up",
  "disclaimer": "This AI analysis is for educational purposes only. Please consult your healthcare provider for proper interpretation and medical advice."
}

Be thorough, accurate, and provide clinically relevant analysis.`;

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
          { role: "user", content: `Analyze this medical report comprehensively. Extract all relevant values, identify abnormalities, and provide a thorough clinical interpretation:\n\n${reportText}\n\nProvide a detailed analysis with accurate interpretations and actionable recommendations.` },
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
        recommendations: ["Please consult your healthcare provider for proper interpretation of your medical report"],
        urgency: "Follow-up",
        disclaimer: "This AI analysis is for educational purposes only. Please consult your healthcare provider for proper interpretation and medical advice."
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
