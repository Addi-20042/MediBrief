import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;
const MAX_NOTE_LENGTH = 2000;
const MAX_INPUT_LENGTH = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SENDER_NAME = Deno.env.get("BREVO_SENDER_NAME") ?? "MediBrief";
const DEFAULT_SENDER_EMAIL = Deno.env.get("BREVO_SENDER_EMAIL") ?? "raiarchana258@gmail.com";

type ReportType = "symptom" | "report";

interface SanitizedReport {
  type: ReportType;
  input: string;
  predictions: Array<Record<string, unknown>>;
  summary?: string;
  date: string;
}

function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

function validateEmail(email: unknown): { valid: boolean; error?: string; sanitized?: string } {
  if (typeof email !== "string") return { valid: false, error: "Email must be a string" };
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) return { valid: false, error: "Email is required" };
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email cannot exceed ${MAX_EMAIL_LENGTH} characters` };
  }
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: "Invalid email format" };
  return { valid: true, sanitized: trimmed };
}

function validateOptionalString(
  value: unknown,
  fieldName: string,
  maxLength: number,
): { valid: boolean; error?: string; sanitized?: string } {
  if (value === undefined || value === null) return { valid: true, sanitized: undefined };
  if (typeof value !== "string") return { valid: false, error: `${fieldName} must be a string` };
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  return { valid: true, sanitized: trimmed };
}

function validateReport(report: unknown): { valid: boolean; error?: string; sanitized?: SanitizedReport } {
  if (!report || typeof report !== "object") {
    return { valid: false, error: "Report is required and must be an object" };
  }

  const raw = report as Record<string, unknown>;
  if (typeof raw.type !== "string" || !["symptom", "report"].includes(raw.type)) {
    return { valid: false, error: "Report type must be 'symptom' or 'report'" };
  }
  if (typeof raw.input !== "string") {
    return { valid: false, error: "Report input must be a string" };
  }
  if (raw.input.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Report input cannot exceed ${MAX_INPUT_LENGTH} characters` };
  }
  if (!Array.isArray(raw.predictions)) {
    return { valid: false, error: "Report predictions must be an array" };
  }
  if (typeof raw.date !== "string") {
    return { valid: false, error: "Report date must be a string" };
  }

  return {
    valid: true,
    sanitized: {
      type: raw.type as ReportType,
      input: raw.input.slice(0, MAX_INPUT_LENGTH),
      predictions: raw.predictions.slice(0, 20).filter((item): item is Record<string, unknown> => !!item && typeof item === "object"),
      summary: typeof raw.summary === "string" ? raw.summary.slice(0, 2000) : undefined,
      date: raw.date,
    },
  };
}

function getPredictionName(prediction: Record<string, unknown>): string {
  if (typeof prediction.name === "string" && prediction.name.trim()) {
    return prediction.name.trim();
  }
  return "Clinical note";
}

function getPredictionDescription(prediction: Record<string, unknown>): string | undefined {
  return typeof prediction.description === "string" && prediction.description.trim()
    ? prediction.description.trim()
    : undefined;
}

function buildEmailHtml(
  sanitizedReport: SanitizedReport,
  doctorName: string | undefined,
  patientNote: string | undefined,
): string {
  const predictionsHtml = sanitizedReport.predictions
    .map((prediction, index) => {
      const name = escapeHtml(getPredictionName(prediction));
      const description = getPredictionDescription(prediction);

      return `
        <div style="border: 1px solid #dbe4ee; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px; background: #ffffff;">
          <p style="margin: 0 0 8px 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; font-weight: 700;">Follow-up Topic ${index + 1}</p>
          <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px;">${name}</h3>
          ${
            description
              ? `<p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${escapeHtml(description)}</p>`
              : ""
          }
        </div>
      `;
    })
    .join("");

  const analysisType = sanitizedReport.type === "symptom" ? "Symptom review" : "Medical report review";
  const inputLabel = sanitizedReport.type === "symptom" ? "Submitted Symptoms" : "Submitted Report Excerpt";

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MediBrief Health Report</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f4f7fb;">
      <div style="max-width: 680px; margin: 0 auto; padding: 24px;">
        <div style="background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);">
          <div style="padding: 28px 30px 20px; border-bottom: 3px solid #0f766e;">
            <p style="margin: 0 0 8px 0; color: #0f766e; letter-spacing: 0.14em; text-transform: uppercase; font-size: 12px; font-weight: 700;">MediBrief</p>
            <h1 style="margin: 0; color: #0f172a; font-size: 28px;">Shared Health Report</h1>
            <p style="margin: 8px 0 0 0; color: #475569; font-size: 15px;">Prepared to support review with a licensed healthcare professional.</p>
          </div>

          <div style="padding: 28px 30px 30px;">
            ${doctorName ? `<p style="margin: 0 0 18px 0;">Dear <strong>${escapeHtml(doctorName)}</strong>,</p>` : ""}
            <p style="margin: 0 0 18px 0; color: #334155;">A patient has shared their MediBrief health report with you.</p>

            ${
              patientNote
                ? `
                  <div style="background: #f8fbff; border: 1px solid #dbe4ee; border-radius: 12px; padding: 16px 18px; margin-bottom: 18px;">
                    <p style="margin: 0 0 8px 0; color: #0f766e; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;">Patient Note</p>
                    <p style="margin: 0; color: #334155;">${escapeHtml(patientNote)}</p>
                  </div>
                `
                : ""
            }

            <div style="background: #f8fbff; border: 1px solid #dbe4ee; border-radius: 12px; padding: 18px; margin-bottom: 18px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a;">Report Details</h2>
              <p style="margin: 4px 0;"><strong>Analysis Type:</strong> ${analysisType}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${escapeHtml(sanitizedReport.date)}</p>
              <p style="margin: 4px 0;"><strong>${inputLabel}:</strong> ${escapeHtml(sanitizedReport.input)}</p>
            </div>

            ${
              sanitizedReport.summary
                ? `
                  <div style="background: #f8fbff; border: 1px solid #dbe4ee; border-radius: 12px; padding: 18px; margin-bottom: 18px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a;">Health Overview</h2>
                    <p style="margin: 0; color: #334155;">${escapeHtml(sanitizedReport.summary)}</p>
                  </div>
                `
                : ""
            }

            <div style="margin-bottom: 18px;">
              <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a;">Topics for Follow-Up</h2>
              <p style="margin: 0 0 14px 0; color: #475569; font-size: 14px;">These items are presented as discussion points for clinical review.</p>
              ${
                predictionsHtml ||
                `<div style="border: 1px solid #dbe4ee; border-radius: 12px; padding: 16px 18px; background: #ffffff; color: #475569;">No follow-up topics were included in this report.</div>`
              }
            </div>

            <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 12px; padding: 16px 18px; margin-top: 24px;">
              <p style="margin: 0; font-size: 13px; color: #9a3412;"><strong>Important Note:</strong> This report is intended for informational support only and should not replace professional medical evaluation, diagnosis, or treatment.</p>
            </div>

            <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #dbe4ee; color: #64748b; font-size: 12px;">
              Generated by MediBrief
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

async function sendWithBrevo(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) return { success: false, error: "Brevo API key not configured" };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: DEFAULT_SENDER_NAME, email: DEFAULT_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo API error:", errorText);
    return { success: false, error: `Brevo error ${response.status}. ${errorText || "Failed to send email via Brevo"}` };
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
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized - invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload = body as {
      to?: unknown;
      doctorName?: unknown;
      patientNote?: unknown;
      report?: unknown;
    };

    const emailValidation = validateEmail(payload.to);
    if (!emailValidation.valid) {
      return new Response(JSON.stringify({ error: emailValidation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const doctorNameValidation = validateOptionalString(payload.doctorName, "Doctor name", MAX_NAME_LENGTH);
    if (!doctorNameValidation.valid) {
      return new Response(JSON.stringify({ error: doctorNameValidation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const patientNoteValidation = validateOptionalString(payload.patientNote, "Patient note", MAX_NOTE_LENGTH);
    if (!patientNoteValidation.valid) {
      return new Response(JSON.stringify({ error: patientNoteValidation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const reportValidation = validateReport(payload.report);
    if (!reportValidation.valid || !reportValidation.sanitized) {
      return new Response(JSON.stringify({ error: reportValidation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sanitizedReport = reportValidation.sanitized;
    const subject = `MediBrief Health Report - ${sanitizedReport.date}`;
    const emailHtml = buildEmailHtml(
      sanitizedReport,
      doctorNameValidation.sanitized,
      patientNoteValidation.sanitized,
    );

    const brevoResult = await sendWithBrevo(emailValidation.sanitized!, subject, emailHtml);
    if (brevoResult.success) {
      return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Brevo failed or not configured, trying Resend...");
    const resendResult = await sendWithResend(emailValidation.sanitized!, subject, emailHtml);
    if (!resendResult.success) {
      const combinedError = [brevoResult.error, resendResult.error].filter(Boolean).join(" | ");
      return new Response(JSON.stringify({ error: combinedError || "Failed to send email. Please try again later." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-report-email function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred while processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
