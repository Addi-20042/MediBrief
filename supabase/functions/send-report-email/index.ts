import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const MAX_NOTE_LENGTH = 2000;
const MAX_INPUT_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

function validateEmail(email: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof email !== 'string') return { valid: false, error: "Email must be a string" };
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) return { valid: false, error: "Email is required" };
  if (trimmed.length > MAX_EMAIL_LENGTH) return { valid: false, error: `Email cannot exceed ${MAX_EMAIL_LENGTH} characters` };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: "Invalid email format" };
  return { valid: true, sanitized: trimmed };
}

function validateOptionalString(value: unknown, fieldName: string, maxLength: number): { valid: boolean; error?: string; sanitized?: string } {
  if (value === undefined || value === null) return { valid: true, sanitized: undefined };
  if (typeof value !== 'string') return { valid: false, error: `${fieldName} must be a string` };
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  return { valid: true, sanitized: trimmed };
}

function validateReport(report: unknown): { valid: boolean; error?: string; sanitized?: any } {
  if (!report || typeof report !== 'object') return { valid: false, error: "Report is required and must be an object" };
  const r = report as Record<string, unknown>;
  if (typeof r.type !== 'string' || !['symptom', 'report'].includes(r.type)) return { valid: false, error: "Report type must be 'symptom' or 'report'" };
  if (typeof r.input !== 'string') return { valid: false, error: "Report input must be a string" };
  if (r.input.length > MAX_INPUT_LENGTH) return { valid: false, error: `Report input cannot exceed ${MAX_INPUT_LENGTH} characters` };
  if (!Array.isArray(r.predictions)) return { valid: false, error: "Report predictions must be an array" };
  if (typeof r.date !== 'string') return { valid: false, error: "Report date must be a string" };
  return {
    valid: true,
    sanitized: {
      type: r.type, input: r.input.slice(0, MAX_INPUT_LENGTH),
      predictions: r.predictions.slice(0, 20),
      summary: typeof r.summary === 'string' ? r.summary.slice(0, 2000) : undefined,
      date: r.date,
    }
  };
}

function buildEmailHtml(
  sanitizedReport: any,
  doctorName: string | undefined,
  patientNote: string | undefined
): string {
  const predictionsHtml = sanitizedReport.predictions.map((pred: any, index: number) => {
    const name = escapeHtml(String(pred.name || pred));
    const probability = pred.probability || pred.likelihood || "Unknown";
    const description = pred.description ? escapeHtml(String(pred.description)) : "";
    return `<tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${index + 1}. ${name}</strong>
        ${description ? `<br><span style="color: #6b7280; font-size: 14px;">${description}</span>` : ""}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        <span style="background: ${probability === "High" || (typeof probability === "number" && probability >= 70) ? "#fee2e2" : probability === "Medium" || (typeof probability === "number" && probability >= 40) ? "#fef3c7" : "#dcfce7"}; color: ${probability === "High" || (typeof probability === "number" && probability >= 70) ? "#dc2626" : probability === "Medium" || (typeof probability === "number" && probability >= 40) ? "#d97706" : "#16a34a"}; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
          ${typeof probability === "number" ? `${probability}%` : escapeHtml(String(probability))}
        </span>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Medical AI Health Report</title></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🏥 MediBrief</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Health Analysis Report</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        ${doctorName ? `<p style="margin-bottom: 20px;">Dear <strong>${escapeHtml(doctorName)}</strong>,</p>` : ""}
        <p>A patient has shared their health analysis report with you from MediBrief.</p>
        ${patientNote ? `<div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; font-weight: 600; color: #0d9488;">Patient's Note:</p><p style="margin: 10px 0 0 0; color: #374151;">${escapeHtml(patientNote)}</p></div>` : ""}
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #374151;">Report Details</h2>
          <p style="margin: 5px 0;"><strong>Analysis Type:</strong> ${sanitizedReport.type === "symptom" ? "Symptom-Based Analysis" : "Medical Report Analysis"}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${escapeHtml(sanitizedReport.date)}</p>
          ${sanitizedReport.type === "symptom" ? `<p style="margin: 5px 0;"><strong>Symptoms Reported:</strong> ${escapeHtml(sanitizedReport.input)}</p>` : ""}
        </div>
        <h2 style="font-size: 18px; color: #374151; margin-top: 30px;">Predicted Conditions</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead><tr style="background: #f3f4f6;"><th style="padding: 12px; text-align: left;">Condition</th><th style="padding: 12px; text-align: center;">Likelihood</th></tr></thead>
          <tbody>${predictionsHtml}</tbody>
        </table>
        ${sanitizedReport.summary ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; font-weight: 600; color: #92400e;">AI Summary:</p><p style="margin: 10px 0 0 0; color: #78350f;">${escapeHtml(sanitizedReport.summary)}</p></div>` : ""}
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 30px;">
          <p style="margin: 0; font-size: 12px; color: #991b1b;"><strong>⚠️ Medical Disclaimer:</strong> This AI-generated report is for informational purposes only and should not be used as a substitute for professional medical advice.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">Generated by MediBrief</p>
      </div>
    </div>
  </body></html>`;
}

async function sendWithBrevo(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) return { success: false, error: "Brevo API key not configured" };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "MediBrief", email: "raiarchana2580@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo API error:", errorText);
    return { success: false, error: "Failed to send email via Brevo" };
  }

  const data = await response.json();
  console.log("Email sent via Brevo:", data);
  return { success: true };
}

async function sendWithResend(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { success: false, error: "Resend API key not configured" };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "MediBrief <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Resend API error:", errorText);
    return { success: false, error: "Failed to send email via Resend" };
  }

  const data = await response.json();
  console.log("Email sent via Resend:", data);
  return { success: true };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    let body: unknown;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const { to, doctorName, patientNote, report } = body as any;

    const emailValidation = validateEmail(to);
    if (!emailValidation.valid) return new Response(JSON.stringify({ error: emailValidation.error }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const doctorNameValidation = validateOptionalString(doctorName, "Doctor name", MAX_NAME_LENGTH);
    if (!doctorNameValidation.valid) return new Response(JSON.stringify({ error: doctorNameValidation.error }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const patientNoteValidation = validateOptionalString(patientNote, "Patient note", MAX_NOTE_LENGTH);
    if (!patientNoteValidation.valid) return new Response(JSON.stringify({ error: patientNoteValidation.error }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const reportValidation = validateReport(report);
    if (!reportValidation.valid) return new Response(JSON.stringify({ error: reportValidation.error }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });

    const sanitizedReport = reportValidation.sanitized;
    const subject = `Health Analysis Report - ${escapeHtml(sanitizedReport.date)}`;
    const emailHtml = buildEmailHtml(sanitizedReport, doctorNameValidation.sanitized, patientNoteValidation.sanitized);

    // Try Brevo first (supports any recipient), fall back to Resend
    let result = await sendWithBrevo(emailValidation.sanitized!, subject, emailHtml);
    
    if (!result.success) {
      console.log("Brevo failed or not configured, trying Resend...");
      result = await sendWithResend(emailValidation.sanitized!, subject, emailHtml);
    }

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error || "Failed to send email. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error in send-report-email function:", error);
    return new Response(JSON.stringify({ error: error.message || "An error occurred while processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
