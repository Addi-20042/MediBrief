import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FAST2SMS_API_KEY = Deno.env.get("FAST2SMS_API_KEY");
    if (!FAST2SMS_API_KEY) {
      throw new Error("FAST2SMS_API_KEY not configured");
    }

    const { phone_number, message, type } = await req.json();

    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: "phone_number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number - remove +91 prefix if present, keep only digits
    const cleanNumber = phone_number.replace(/\D/g, "").replace(/^91/, "");

    if (cleanNumber.length !== 10) {
      return new Response(
        JSON.stringify({ error: "Invalid Indian phone number. Must be 10 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Fast2SMS Quick SMS route
    const smsResponse = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: cleanNumber,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResult.return) {
      console.error("Fast2SMS error:", smsResult);
      return new Response(
        JSON.stringify({ error: smsResult.message || "Failed to send SMS" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "SMS sent successfully", request_id: smsResult.request_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SMS Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
