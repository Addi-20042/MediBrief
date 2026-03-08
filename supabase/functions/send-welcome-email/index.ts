import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

function buildWelcomeHtml(name: string): string {
  const safeName = escapeHtml(name || "there");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to MediBrief</title></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🏥 Welcome to MediBrief!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 16px;">Your AI-powered health companion</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <h2 style="color: #0d9488; margin-top: 0;">Hi ${safeName} 👋</h2>
        <p style="color: #374151; font-size: 16px;">Thank you for joining MediBrief! We're excited to help you take control of your health with AI-powered insights.</p>
        
        <h3 style="color: #374151; margin-top: 25px;">Here's what you can do:</h3>
        <div style="margin: 20px 0;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <span style="font-size: 20px; margin-right: 12px;">🔍</span>
            <div><strong style="color: #0d9488;">Symptom Analysis</strong><br><span style="color: #6b7280;">Describe your symptoms and get AI-powered health predictions</span></div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <span style="font-size: 20px; margin-right: 12px;">📄</span>
            <div><strong style="color: #0d9488;">Report Analysis</strong><br><span style="color: #6b7280;">Upload medical reports for instant AI interpretation</span></div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <span style="font-size: 20px; margin-right: 12px;">💊</span>
            <div><strong style="color: #0d9488;">Medication Reminders</strong><br><span style="color: #6b7280;">Never miss a dose with smart notifications</span></div>
          </div>
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <span style="font-size: 20px; margin-right: 12px;">📊</span>
            <div><strong style="color: #0d9488;">Health Tracking</strong><br><span style="color: #6b7280;">Monitor vitals, mood, and wellness over time</span></div>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://id-preview--3aa46046-a6bb-40a6-abc9-cb487340fe62.lovable.app/dashboard" style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Get Started →</a>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; color: #991b1b;"><strong>⚠️ Disclaimer:</strong> MediBrief provides AI-generated health insights for informational purposes only. Always consult a qualified healthcare professional for medical advice.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin: 0;">© MediBrief — Your Health, Simplified</p>
      </div>
    </div>
  </body></html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { email, name } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const html = buildWelcomeHtml(name || "");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        sender: { name: "MediBrief", email: "raiarchana2580@gmail.com" },
        to: [{ email: email.trim().toLowerCase() }],
        subject: "Welcome to MediBrief! 🏥",
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const data = await response.json();
    console.log("Welcome email sent:", data);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Welcome email error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
