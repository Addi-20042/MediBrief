import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported = "Notification" in window;
    setSupported(isSupported);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [supported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") return;
      try {
        new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
      } catch (e) {
        console.error("Notification error:", e);
      }
    },
    [permission]
  );

  // Check medication reminders and send browser notifications
  const checkMedicationReminders = useCallback(async () => {
    if (!user || permission !== "granted") return;

    try {
      const { data: reminders } = await supabase
        .from("medication_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (!reminders || reminders.length === 0) return;

      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;
      const today = now.toISOString().split("T")[0];

      // Check today's logs
      const { data: logs } = await supabase
        .from("medication_logs")
        .select("reminder_id")
        .eq("user_id", user.id)
        .gte("taken_at", `${today}T00:00:00`)
        .lte("taken_at", `${today}T23:59:59`);

      const loggedIds = new Set(logs?.map((l) => l.reminder_id) || []);

      for (const reminder of reminders) {
        if (loggedIds.has(reminder.id)) continue;

        const shouldNotify = (reminder.reminder_times || []).some((time: string) => {
          const [h, m] = time.split(":");
          return h === currentHour && Math.abs(parseInt(m) - parseInt(currentMinute)) <= 2;
        });

        if (shouldNotify) {
          sendNotification(`💊 Time for ${reminder.medication_name}`, {
            body: `Take ${reminder.dosage} - ${reminder.medication_name}`,
            tag: `med-${reminder.id}-${today}`,
            requireInteraction: true,
          });
        }
      }
    } catch (e) {
      console.error("Reminder check error:", e);
    }
  }, [user, permission, sendNotification]);

  // Run check every minute
  useEffect(() => {
    if (!user || permission !== "granted") return;

    checkMedicationReminders();
    const interval = setInterval(checkMedicationReminders, 60000);
    return () => clearInterval(interval);
  }, [user, permission, checkMedicationReminders]);

  return { supported, permission, requestPermission, sendNotification };
};
