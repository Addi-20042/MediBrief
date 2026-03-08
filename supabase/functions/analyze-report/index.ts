import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MIN_REPORT_LENGTH = 20;
const MAX_REPORT_LENGTH = 50000;

function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '').trim();
}

function validateReportText(reportText: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof reportText !== 'string') return { valid: false, error: "Report text must be a string" };
  const trimmed = reportText.trim();
  if (trimmed.length === 0) return { valid: false, error: "Please provide report text to analyze" };
  if (trimmed.length < MIN_REPORT_LENGTH) return { valid: false, error: `Please provide at least ${MIN_REPORT_LENGTH} characters of report text` };
  if (trimmed.length > MAX_REPORT_LENGTH) return { valid: false, error: `Report text cannot exceed ${MAX_REPORT_LENGTH} characters` };
  return { valid: true, sanitized: sanitizeText(trimmed) };
}

async function extractTextFromPdfViaVision(pdfBase64: string): Promise<string> {
  const providers = [
    {
      name: "Lovable AI Gateway",
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      key: Deno.env.get("LOVABLE_API_KEY"),
      model: "google/gemini-2.5-flash",
    },
    {
      name: "Google Gemini Direct",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: Deno.env.get("GOOGLE_GEMINI_API_KEY"),
      model: "gemini-2.0-flash",
    },
  ];

  for (const provider of providers) {
    if (!provider.key) continue;
    try {
      console.log(`[PDF OCR] Trying ${provider.name}...`);

      // Use Gemini native API for vision with PDF
      if (provider.name === "Google Gemini Direct") {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${provider.key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Extract ALL text from this medical report PDF. Return ONLY the extracted text content, preserving the structure (headings, values, units, reference ranges). Do not add any commentary." },
                  { inline_data: { mime_type: "application/pdf", data: pdfBase64 } },
                ],
              }],
            }),
          }
        );
        if (response.ok) {
          const result = await response.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.length > 20) {
            console.log(`[PDF OCR] ${provider.name} extracted ${text.length} chars`);
            return text;
          }
        }
      }

      // For Lovable AI Gateway - use OpenAI-compatible format with image_url for PDF pages
      if (provider.name === "Lovable AI Gateway") {
        const response = await fetch(provider.url, {
          method: "POST",
          headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: provider.model,
            messages: [{
              role: "user",
              content: [
                { type: "text", text: "Extract ALL text from this medical report PDF. Return ONLY the extracted text content, preserving the structure (headings, values, units, reference ranges). Do not add any commentary." },
                { type: "image_url", image_url: { url: `data:application/pdf;base64,${pdfBase64}` } },
              ],
            }],
            temperature: 0.1,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text && text.length > 20) {
            console.log(`[PDF OCR] ${provider.name} extracted ${text.length} chars`);
            return text;
          }
        } else {
          const errText = await response.text();
          console.error(`[PDF OCR] ${provider.name} error:`, response.status, errText);
        }
      }
    } catch (err) {
      console.error(`[PDF OCR] ${provider.name} failed:`, err);
    }
  }
  throw new Error("Could not extract text from PDF. Please try pasting the report text manually.");
}

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
    if (!provider.key) { console.log(`Skipping ${provider.name}: no API key`); continue; }
    try {
      console.log(`Trying ${provider.name}...`);
      const response = await fetch(provider.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${provider.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
          temperature: 0.2,
        }),
      });
      if (response.status === 429 || response.status === 402) { console.log(`${provider.name} error ${response.status}, trying next...`); continue; }
      if (!response.ok) { const t = await response.text(); console.error(`${provider.name} error:`, response.status, t); continue; }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) { console.log(`${provider.name} succeeded`); return content; }
    } catch (err) { console.error(`${provider.name} failed:`, err); }
  }
  throw new Error("All AI providers failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: unknown;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { reportText, pdfBase64 } = body as { reportText?: unknown; pdfBase64?: string };

    let finalText: string;

    // If PDF base64 is provided, extract text from it first
    if (pdfBase64 && typeof pdfBase64 === 'string' && pdfBase64.length > 0) {
      console.log(`Received PDF base64 (${pdfBase64.length} chars), extracting text...`);
      try {
        finalText = await extractTextFromPdfViaVision(pdfBase64);
      } catch (err) {
        return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Failed to extract text from PDF" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    } else {
      // Use provided text
      const validation = validateReportText(reportText);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      finalText = validation.sanitized!;
    }

    const systemPrompt = `You are an expert medical AI assistant specialized in analyzing medical reports, lab results, and diagnostic tests. You are NOT a doctor and your analysis is for educational purposes only.

COMPREHENSIVE ANALYSIS FRAMEWORK:
1. REPORT TYPE IDENTIFICATION: Laboratory tests, imaging reports, pathology reports, vital signs, specialty tests
2. KEY FINDINGS ANALYSIS: Normal vs abnormal status, clinical significance, trending, correlation, potential causes
3. DIFFERENTIAL DIAGNOSIS: List possible conditions, calculate probability, consider common and serious conditions

PROBABILITY ASSESSMENT:
- "High" (70-90%): Multiple findings strongly support this condition
- "Medium" (40-69%): Some findings suggest this condition
- "Low" (15-39%): Findings are consistent but not definitive

URGENCY CLASSIFICATION:
- "Emergency": Critical values requiring immediate attention
- "Urgent": Significant abnormalities needing prompt follow-up
- "Routine": Minor deviations for scheduled review
- "Follow-up": Normal with recommended monitoring

IMPORTANT: Always remind users to discuss results with their healthcare provider.

Respond with a JSON object in this EXACT format:
{
  "summary": "Comprehensive plain language summary",
  "keyFindings": [{"category": "Category", "finding": "Finding with value", "status": "Normal/Abnormal/Borderline/Critical", "interpretation": "What this means"}],
  "possibleConditions": [{"name": "Condition", "likelihood": "High/Medium/Low", "relatedFindings": ["finding1"], "description": "Description"}],
  "recommendations": ["Recommendation 1"],
  "urgency": "Emergency/Urgent/Routine/Follow-up",
  "disclaimer": "This AI analysis is for educational purposes only."
}`;

    const userPrompt = `Analyze this medical report comprehensively:\n\n${finalText}\n\nProvide a detailed analysis with accurate interpretations and actionable recommendations.`;
    const content = await callAI(systemPrompt, userPrompt);

    let result;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonString.trim());
    } catch {
      result = {
        summary: content, keyFindings: [], possibleConditions: [],
        recommendations: ["Please consult your healthcare provider for proper interpretation"],
        urgency: "Follow-up",
        disclaimer: "This AI analysis is for educational purposes only."
      };
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error analyzing report:", error);
    return new Response(JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
