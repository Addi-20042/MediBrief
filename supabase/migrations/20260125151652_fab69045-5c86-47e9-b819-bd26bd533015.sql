-- Health Metrics Table for tracking daily health data
CREATE TABLE public.health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  blood_sugar DECIMAL(5,2),
  sleep_hours DECIMAL(3,1),
  water_intake INTEGER,
  steps INTEGER,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Medication Reminders Table
CREATE TABLE public.medication_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('once_daily', 'twice_daily', 'thrice_daily', 'weekly', 'as_needed')),
  reminder_times TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medication Logs Table (track when medications are taken)
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_id UUID REFERENCES public.medication_reminders(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  skipped BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for health_metrics
CREATE POLICY "Users can view own health metrics" 
ON public.health_metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics" 
ON public.health_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health metrics" 
ON public.health_metrics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health metrics" 
ON public.health_metrics FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for medication_reminders
CREATE POLICY "Users can view own medication reminders" 
ON public.medication_reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication reminders" 
ON public.medication_reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication reminders" 
ON public.medication_reminders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication reminders" 
ON public.medication_reminders FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for medication_logs
CREATE POLICY "Users can view own medication logs" 
ON public.medication_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs" 
ON public.medication_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication logs" 
ON public.medication_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_health_metrics_updated_at
BEFORE UPDATE ON public.health_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_reminders_updated_at
BEFORE UPDATE ON public.medication_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();