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
    const FAST2SMS_API_KEY = Deno.env.get("FAST2SMS_API_KEY");

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
      .select("*, profiles!inner(phone_number, full_name)")
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

      // Get phone number from the joined profile
      const phone = (reminder as any).profiles?.phone_number;
      if (!phone || !FAST2SMS_API_KEY) continue;

      const cleanNumber = phone.replace(/\D/g, "").replace(/^91/, "");
      if (cleanNumber.length !== 10) continue;

      const patientName = (reminder as any).profiles?.full_name || "there";
      const message = `MediBrief Reminder: Hi ${patientName}! Time to take ${reminder.medication_name} (${reminder.dosage}). Stay healthy! 💊`;

      try {
        const smsResponse = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            authorization: FAST2SMS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            route: "q",
            message,
            language: "english",
            flash: 0,
            numbers: cleanNumber,
          }),
        });

        const smsResult = await smsResponse.json();
        if (smsResult.return) {
          sentCount++;
          console.log(`SMS sent to ${cleanNumber} for ${reminder.medication_name}`);
        } else {
          errors.push(`Failed for ${cleanNumber}: ${smsResult.message}`);
        }
      } catch (smsErr) {
        errors.push(`SMS error: ${(smsErr as Error).message}`);
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
