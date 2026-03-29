import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReminderRow = {
  id: string;
  user_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  reminder_times: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
};

const frequencyLabels: Record<string, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  thrice_daily: "Three times daily",
  weekly: "Weekly",
  as_needed: "As needed",
};

const normalizePhoneNumber = (phoneNumber: string) => {
  const trimmed = phoneNumber.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    if (digits.length < 10 || digits.length > 15) {
      throw new Error("Phone number must be a valid international number");
    }

    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  throw new Error("Invalid phone number. Use a number like +91 9876543210.");
};

const getIndiaDateTime = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value || "";

  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  const hour = getPart("hour");
  const minute = getPart("minute");

  return {
    today: `${year}-${month}-${day}`,
    currentTime: `${hour}:${minute}`,
  };
};

const getFrequencyLabel = (frequency: string) => frequencyLabels[frequency] || frequency;

const formatTimes = (times: string[]) => times.filter(Boolean).join(", ");

const getGreetingName = (fullName: string | null) => fullName?.trim().split(/\s+/)[0] || "there";

const truncateMessage = (message: string, maxLength = 320) => (
  message.length > maxLength ? `${message.slice(0, maxLength - 3)}...` : message
);

const sendTwilioSms = async (to: string, body: string) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

  if (!accountSid || !authToken || !messagingServiceSid) {
    throw new Error("Twilio credentials are not configured");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        Body: body,
        MessagingServiceSid: messagingServiceSid,
      }).toString(),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to send SMS");
  }

  return result;
};

const reserveDelivery = async (
  supabase: ReturnType<typeof createClient>,
  payload: {
    delivery_key: string;
    notification_type: string;
    phone_number: string;
    reminder_id?: string;
    user_id: string;
  },
) => {
  const { error } = await supabase.from("medication_sms_logs").insert(payload);

  if (!error) {
    return true;
  }

  if (error.code === "23505") {
    return false;
  }

  throw error;
};

const releaseDelivery = async (
  supabase: ReturnType<typeof createClient>,
  deliveryKey: string,
) => {
  await supabase.from("medication_sms_logs").delete().eq("delivery_key", deliveryKey);
};

const getAuthenticatedUserId = async (
  req: Request,
  supabaseUrl: string,
  supabaseAnonKey: string,
) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return null;
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user.id;
};

const requireMatchingUser = (
  authenticatedUserId: string | null,
  requestedUserId: string,
) => {
  if (!authenticatedUserId || authenticatedUserId !== requestedUserId) {
    throw new Error("Forbidden");
  }
};

const requireCronSecret = (req: Request) => {
  const configuredSecret = Deno.env.get("MEDICATION_REMINDER_CRON_SECRET");
  const requestSecret = req.headers.get("x-reminder-cron-secret");

  if (!configuredSecret) {
    throw new Error("MEDICATION_REMINDER_CRON_SECRET is not configured");
  }

  if (requestSecret !== configuredSecret) {
    throw new Error("Forbidden");
  }
};

const maybeSingleReminder = async (
  supabase: ReturnType<typeof createClient>,
  reminderId: string,
) => {
  const { data, error } = await supabase
    .from("medication_reminders")
    .select("*")
    .eq("id", reminderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ReminderRow | null;
};

const getUserProfile = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, phone_number")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as { full_name: string | null; phone_number: string | null } | null;
};

const buildCreatedScheduleMessage = (patientName: string | null, reminder: ReminderRow) =>
  truncateMessage(
    `MediBrief: Hi ${getGreetingName(patientName)}, ${reminder.medication_name} (${reminder.dosage}) was added. ${getFrequencyLabel(reminder.frequency)} at ${formatTimes(reminder.reminder_times)}.`,
  );

const buildLoginDigestMessage = (patientName: string | null, reminders: ReminderRow[]) => {
  const medSummary = reminders
    .map((reminder) => (
      `${reminder.medication_name} ${reminder.dosage} at ${formatTimes(reminder.reminder_times)}`
    ))
    .join("; ");

  return truncateMessage(
    `MediBrief: Hi ${getGreetingName(patientName)}, today's medication plan: ${medSummary}.`,
  );
};

const buildDueReminderMessage = (
  patientName: string | null,
  reminder: ReminderRow,
  scheduledTime: string,
) =>
  truncateMessage(
    `MediBrief: Hi ${getGreetingName(patientName)}, it's time to take ${reminder.medication_name} (${reminder.dosage}) scheduled for ${scheduledTime}.`,
  );

const getMatchedReminderTime = (reminderTimes: string[], currentTime: string) => {
  const [currentHour, currentMinute] = currentTime.split(":").map(Number);

  return reminderTimes.find((time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour === currentHour && Math.abs(minute - currentMinute) <= 1;
  }) || null;
};

const sendScheduleCreatedSms = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
  reminderId: string,
) => {
  const reminder = await maybeSingleReminder(supabase, reminderId);
  if (!reminder) {
    return { sent: 0, skipped: "Reminder not found" };
  }

  if (reminder.user_id !== userId) {
    throw new Error("Forbidden");
  }

  const profile = await getUserProfile(supabase, userId);
  if (!profile?.phone_number) {
    return { sent: 0, skipped: "Phone number missing" };
  }

  const phoneNumber = normalizePhoneNumber(profile.phone_number);
  const deliveryKey = `schedule_created:${reminder.id}`;
  const reserved = await reserveDelivery(supabase, {
    delivery_key: deliveryKey,
    notification_type: "schedule_created",
    phone_number: phoneNumber,
    reminder_id: reminder.id,
    user_id: userId,
  });

  if (!reserved) {
    return { sent: 0, skipped: "Already sent" };
  }

  try {
    await sendTwilioSms(phoneNumber, buildCreatedScheduleMessage(profile.full_name, reminder));
    return { sent: 1 };
  } catch (error) {
    await releaseDelivery(supabase, deliveryKey);
    throw error;
  }
};

const sendLoginDigestSms = async (
  supabase: ReturnType<typeof createClient>,
  userId: string,
) => {
  const { today } = getIndiaDateTime();
  const profile = await getUserProfile(supabase, userId);

  if (!profile?.phone_number) {
    return { sent: 0, skipped: "Phone number missing" };
  }

  const { data, error } = await supabase
    .from("medication_reminders")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const reminders = (data || []) as ReminderRow[];

  if (reminders.length === 0) {
    return { sent: 0, skipped: "No active reminders" };
  }

  const phoneNumber = normalizePhoneNumber(profile.phone_number);
  const deliveryKey = `login_digest:${userId}:${today}`;
  const reserved = await reserveDelivery(supabase, {
    delivery_key: deliveryKey,
    notification_type: "login_digest",
    phone_number: phoneNumber,
    user_id: userId,
  });

  if (!reserved) {
    return { sent: 0, skipped: "Already sent today" };
  }

  try {
    await sendTwilioSms(phoneNumber, buildLoginDigestMessage(profile.full_name, reminders));
    return { sent: 1 };
  } catch (error) {
    await releaseDelivery(supabase, deliveryKey);
    throw error;
  }
};

const sendScheduledDueSms = async (
  supabase: ReturnType<typeof createClient>,
) => {
  const { today, currentTime } = getIndiaDateTime();
  const { data, error } = await supabase
    .from("medication_reminders")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", today);

  if (error) {
    throw error;
  }

  const reminders = (data || []) as ReminderRow[];
  let sent = 0;
  const errors: string[] = [];

  for (const reminder of reminders) {
    if (reminder.end_date && reminder.end_date < today) {
      continue;
    }

    const matchedTime = getMatchedReminderTime(reminder.reminder_times || [], currentTime);
    if (!matchedTime) {
      continue;
    }

    const { data: logs, error: logsError } = await supabase
      .from("medication_logs")
      .select("id, scheduled_time")
      .eq("user_id", reminder.user_id)
      .eq("reminder_id", reminder.id)
      .gte("taken_at", `${today}T00:00:00`)
      .lte("taken_at", `${today}T23:59:59`);

    if (logsError) {
      errors.push(`Medication log lookup failed for ${reminder.id}`);
      continue;
    }

    const alreadyLogged = (logs || []).some((log) => (
      log.scheduled_time === matchedTime ||
      (!log.scheduled_time && reminder.reminder_times.length === 1)
    ));

    if (alreadyLogged) {
      continue;
    }

    const profile = await getUserProfile(supabase, reminder.user_id);
    if (!profile?.phone_number) {
      continue;
    }

    const phoneNumber = normalizePhoneNumber(profile.phone_number);
    const deliveryKey = `scheduled_due:${reminder.id}:${today}:${matchedTime}`;
    const reserved = await reserveDelivery(supabase, {
      delivery_key: deliveryKey,
      notification_type: "scheduled_due",
      phone_number: phoneNumber,
      reminder_id: reminder.id,
      user_id: reminder.user_id,
    });

    if (!reserved) {
      continue;
    }

    try {
      await sendTwilioSms(phoneNumber, buildDueReminderMessage(profile.full_name, reminder, matchedTime));
      sent += 1;
    } catch (error) {
      await releaseDelivery(supabase, deliveryKey);
      errors.push((error as Error).message);
    }
  }

  return { sent, errors };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authenticatedUserId = await getAuthenticatedUserId(req, SUPABASE_URL, SUPABASE_ANON_KEY);

    let body: Record<string, string> = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const trigger = body.trigger || "scheduled_due";

    if (trigger === "schedule_created") {
      if (!body.user_id || !body.reminder_id) {
        return new Response(
          JSON.stringify({ error: "user_id and reminder_id are required for schedule_created" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      requireMatchingUser(authenticatedUserId, body.user_id);
      const result = await sendScheduleCreatedSms(supabase, body.user_id, body.reminder_id);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (trigger === "login_digest") {
      if (!body.user_id) {
        return new Response(
          JSON.stringify({ error: "user_id is required for login_digest" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      requireMatchingUser(authenticatedUserId, body.user_id);
      const result = await sendLoginDigestSms(supabase, body.user_id);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    requireCronSecret(req);
    const result = await sendScheduledDueSms(supabase);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Reminder Error:", error);
    const message = (error as Error).message || "Internal server error";
    const status = message === "Forbidden" ? 403 : 500;
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
