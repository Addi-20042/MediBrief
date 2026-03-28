ALTER TABLE public.medication_logs
ADD COLUMN IF NOT EXISTS scheduled_time text;

CREATE TABLE IF NOT EXISTS public.medication_sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES public.medication_reminders(id) ON DELETE CASCADE,
  delivery_key TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medication_sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medication sms logs"
ON public.medication_sms_logs FOR SELECT
USING (auth.uid() = user_id);
