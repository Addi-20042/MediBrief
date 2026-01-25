import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportEmailRequest {
  to: string;
  doctorName?: string;
  patientNote?: string;
  report: {
    type: string;
    input: string;
    predictions: any[];
    summary?: string;
    date: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, doctorName, patientNote, report }: ReportEmailRequest = await req.json();

    if (!to || !report) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, report" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format the predictions for the email
    const predictionsHtml = report.predictions
      .map((pred: any, index: number) => {
        const name = pred.name || pred;
        const probability = pred.probability || pred.likelihood || "Unknown";
        const description = pred.description || "";
        
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <strong>${index + 1}. ${name}</strong>
              ${description ? `<br><span style="color: #6b7280; font-size: 14px;">${description}</span>` : ""}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
              <span style="background: ${
                probability === "High" || (typeof probability === "number" && probability >= 70)
                  ? "#fee2e2"
                  : probability === "Medium" || (typeof probability === "number" && probability >= 40)
                  ? "#fef3c7"
                  : "#dcfce7"
              }; color: ${
                probability === "High" || (typeof probability === "number" && probability >= 70)
                  ? "#dc2626"
                  : probability === "Medium" || (typeof probability === "number" && probability >= 40)
                  ? "#d97706"
                  : "#16a34a"
              }; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                ${typeof probability === "number" ? `${probability}%` : probability}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical AI Health Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🏥 Medical AI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Health Analysis Report</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            ${doctorName ? `<p style="margin-bottom: 20px;">Dear <strong>${doctorName}</strong>,</p>` : ""}
            
            <p>A patient has shared their health analysis report with you from Medical AI.</p>
            
            ${patientNote ? `
              <div style="background: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-weight: 600; color: #0d9488;">Patient's Note:</p>
                <p style="margin: 10px 0 0 0; color: #374151;">${patientNote}</p>
              </div>
            ` : ""}
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #374151;">Report Details</h2>
              <p style="margin: 5px 0;"><strong>Analysis Type:</strong> ${report.type === "symptom" ? "Symptom-Based Analysis" : "Medical Report Analysis"}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${report.date}</p>
              ${report.type === "symptom" ? `<p style="margin: 5px 0;"><strong>Symptoms Reported:</strong> ${report.input}</p>` : ""}
            </div>
            
            <h2 style="font-size: 18px; color: #374151; margin-top: 30px;">Predicted Conditions</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Condition</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600;">Likelihood</th>
                </tr>
              </thead>
              <tbody>
                ${predictionsHtml}
              </tbody>
            </table>
            
            ${report.summary ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-weight: 600; color: #92400e;">AI Summary:</p>
                <p style="margin: 10px 0 0 0; color: #78350f;">${report.summary}</p>
              </div>
            ` : ""}
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 12px; color: #991b1b;">
                <strong>⚠️ Medical Disclaimer:</strong> This AI-generated report is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Please review this information in context of the patient's full medical history.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="text-align: center; color: #6b7280; font-size: 12px;">
              Generated by Medical AI<br>
              <a href="#" style="color: #0d9488;">www.medical-ai.app</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // For now, we'll log the email content and return success
    // In production, you would integrate with Resend, SendGrid, etc.
    console.log("Email would be sent to:", to);
    console.log("Email HTML generated successfully");

    // Check if RESEND_API_KEY is available
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Send email via Resend
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Medical AI <noreply@resend.dev>",
          to: [to],
          subject: `Health Analysis Report - ${report.date}`,
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        console.error("Resend API error:", errorData);
        throw new Error("Failed to send email via Resend");
      }

      const resendData = await resendResponse.json();
      console.log("Email sent via Resend:", resendData);
    } else {
      console.log("RESEND_API_KEY not configured - email not sent");
      // Return success anyway for demo purposes
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: resendApiKey ? "Email sent successfully" : "Email logged (Resend not configured)" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-report-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
