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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current time in HH:MM format (IST)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const currentHour = istNow.getUTCHours().toString().padStart(2, "0");
    const currentMinute = istNow.getUTCMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;
    const today = istNow.toISOString().split("T")[0];

    console.log(`Checking reminders for time: ${currentTime}, date: ${today}`);

    // Get all active medication reminders
    const { data: reminders, error: remindersError } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", today);

    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active reminders found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const reminder of reminders) {
      // Check if end_date has passed
      if (reminder.end_date && reminder.end_date < today) continue;

      // Check if current time matches any reminder time (within 1 minute window)
      const reminderTimes = reminder.reminder_times || [];
      const shouldSend = reminderTimes.some((time: string) => {
        const [h, m] = time.split(":");
        const [ch, cm] = currentTime.split(":");
        return h === ch && Math.abs(parseInt(m) - parseInt(cm)) <= 1;
      });

      if (!shouldSend) continue;

      // Check if already logged today for this reminder
      const { data: logs } = await supabase
        .from("medication_logs")
        .select("id")
        .eq("reminder_id", reminder.id)
        .eq("user_id", reminder.user_id)
        .gte("taken_at", `${today}T00:00:00`)
        .lte("taken_at", `${today}T23:59:59`);

      if (logs && logs.length > 0) continue;

      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(reminder.user_id);
      const email = userData?.user?.email;
      if (!email || !BREVO_API_KEY) continue;

      // Get profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", reminder.user_id)
        .maybeSingle();

      const patientName = profile?.full_name || "there";

      try {
        const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "MediBrief", email: "raiarchana2580@gmail.com" },
            to: [{ email }],
            subject: `💊 Medication Reminder: ${reminder.medication_name}`,
            htmlContent: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 12px 20px; border-radius: 12px; font-size: 24px;">💊</div>
                </div>
                <h2 style="color: #1a2332; text-align: center; margin: 0 0 8px;">Medication Reminder</h2>
                <p style="color: #64748b; text-align: center; margin: 0 0 24px;">Hi ${patientName}, it's time for your medication!</p>
                <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px; font-weight: 600; color: #0d9488; font-size: 18px;">${reminder.medication_name}</p>
                  <p style="margin: 0; color: #475569;">Dosage: <strong>${reminder.dosage}</strong></p>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated reminder from MediBrief. Stay healthy! 🌟</p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          sentCount++;
          console.log(`Email sent to ${email} for ${reminder.medication_name}`);
        } else {
          const errText = await emailResponse.text();
          errors.push(`Failed for ${email}: ${errText}`);
        }
      } catch (emailErr) {
        errors.push(`Email error: ${(emailErr as Error).message}`);
      }
    }

    return new Response(
      JSON.stringify({ message: `Processed reminders`, sent: sentCount, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reminder Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
