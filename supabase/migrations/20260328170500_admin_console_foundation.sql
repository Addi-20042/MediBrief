CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  is_active boolean NOT NULL DEFAULT true,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_account_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS account_status_reason text,
  ADD COLUMN IF NOT EXISTS account_status_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_status_changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.predictions
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_reason text,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.medication_reminders
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_user_id ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_hidden ON public.predictions(is_hidden);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(is_account_active);

CREATE OR REPLACE FUNCTION public.is_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = target_user_id
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_account_active(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT is_account_active
      FROM public.profiles
      WHERE user_id = target_user_id
    ),
    true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_account_status()
RETURNS TABLE (is_account_active boolean, status_reason text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(p.is_account_active, true) AS is_account_active,
    p.account_status_reason AS status_reason
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  UNION ALL
  SELECT true, NULL::text
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
  )
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.write_admin_audit_log(
  action_name text,
  entity_name text,
  entity_uuid uuid,
  before_state jsonb,
  after_state jsonb,
  action_reason text DEFAULT NULL,
  affected_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    target_user_id,
    action,
    entity_type,
    entity_id,
    before_json,
    after_json,
    reason
  )
  VALUES (
    auth.uid(),
    affected_user_id,
    action_name,
    entity_name,
    entity_uuid,
    before_state,
    after_state,
    action_reason
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_actions jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', logs.id,
        'action', logs.action,
        'entity_type', logs.entity_type,
        'entity_id', logs.entity_id,
        'reason', logs.reason,
        'created_at', logs.created_at,
        'admin_name', COALESCE(admin_profile.full_name, admin_user.email, 'Admin'),
        'target_user_name', COALESCE(target_profile.full_name, target_user.email, 'Unknown user')
      )
      ORDER BY logs.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO recent_actions
  FROM (
    SELECT *
    FROM public.admin_audit_logs
    ORDER BY created_at DESC
    LIMIT 10
  ) logs
  LEFT JOIN public.profiles admin_profile ON admin_profile.user_id = logs.admin_user_id
  LEFT JOIN auth.users admin_user ON admin_user.id = logs.admin_user_id
  LEFT JOIN public.profiles target_profile ON target_profile.user_id = logs.target_user_id
  LEFT JOIN auth.users target_user ON target_user.id = logs.target_user_id;

  RETURN jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users', (SELECT COUNT(*) FROM public.profiles WHERE is_account_active = true),
    'hidden_predictions', (SELECT COUNT(*) FROM public.predictions WHERE is_hidden = true),
    'active_reminders', (SELECT COUNT(*) FROM public.medication_reminders WHERE is_active = true),
    'admin_count', (SELECT COUNT(*) FROM public.admin_users WHERE is_active = true),
    'recent_actions', recent_actions
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_users(
  search_term text DEFAULT NULL,
  status_filter text DEFAULT 'all'
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  phone_number text,
  created_at timestamptz,
  is_account_active boolean,
  admin_role text,
  predictions_count bigint,
  active_reminders_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    profile.user_id,
    profile.full_name,
    auth_user.email::text,
    profile.phone_number,
    profile.created_at,
    profile.is_account_active,
    admin_role.role,
    COALESCE(prediction_counts.total_predictions, 0) AS predictions_count,
    COALESCE(reminder_counts.active_reminders, 0) AS active_reminders_count
  FROM public.profiles profile
  LEFT JOIN auth.users auth_user ON auth_user.id = profile.user_id
  LEFT JOIN public.admin_users admin_role ON admin_role.user_id = profile.user_id AND admin_role.is_active = true
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS total_predictions
    FROM public.predictions
    GROUP BY user_id
  ) prediction_counts ON prediction_counts.user_id = profile.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS active_reminders
    FROM public.medication_reminders
    WHERE is_active = true
    GROUP BY user_id
  ) reminder_counts ON reminder_counts.user_id = profile.user_id
  WHERE (
    search_term IS NULL
    OR search_term = ''
    OR COALESCE(profile.full_name, '') ILIKE '%' || search_term || '%'
    OR COALESCE(auth_user.email, '') ILIKE '%' || search_term || '%'
    OR COALESCE(profile.phone_number, '') ILIKE '%' || search_term || '%'
  )
  AND (
    status_filter = 'all'
    OR (status_filter = 'active' AND profile.is_account_active = true)
    OR (status_filter = 'inactive' AND profile.is_account_active = false)
  )
  ORDER BY profile.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user_detail(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record jsonb;
  predictions_payload jsonb;
  reminders_payload jsonb;
  logs_payload jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT jsonb_build_object(
    'user_id', profile.user_id,
    'email', auth_user.email,
    'created_at', profile.created_at,
    'last_sign_in_at', auth_user.last_sign_in_at,
    'full_name', profile.full_name,
    'phone_number', profile.phone_number,
    'is_account_active', profile.is_account_active,
    'account_status_reason', profile.account_status_reason,
    'date_of_birth', profile.date_of_birth,
    'gender', profile.gender,
    'blood_type', profile.blood_type,
    'medical_conditions', profile.medical_conditions,
    'allergies', profile.allergies,
    'height_cm', profile.height_cm,
    'weight_kg', profile.weight_kg
  )
  INTO user_record
  FROM public.profiles profile
  LEFT JOIN auth.users auth_user ON auth_user.id = profile.user_id
  WHERE profile.user_id = target_user_id;

  IF user_record IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', prediction.id,
        'prediction_type', prediction.prediction_type,
        'summary', prediction.summary,
        'created_at', prediction.created_at,
        'is_hidden', prediction.is_hidden,
        'hidden_reason', prediction.hidden_reason
      )
      ORDER BY prediction.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO predictions_payload
  FROM (
    SELECT *
    FROM public.predictions
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 20
  ) prediction;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', reminder.id,
        'medication_name', reminder.medication_name,
        'dosage', reminder.dosage,
        'frequency', reminder.frequency,
        'reminder_times', reminder.reminder_times,
        'is_active', reminder.is_active,
        'status_reason', reminder.status_reason,
        'start_date', reminder.start_date,
        'end_date', reminder.end_date,
        'created_at', reminder.created_at
      )
      ORDER BY reminder.created_at DESC
    ),
    '[]'::jsonb
  )
  INTO reminders_payload
  FROM (
    SELECT *
    FROM public.medication_reminders
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 20
  ) reminder;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', log.id,
        'reminder_id', log.reminder_id,
        'scheduled_time', log.scheduled_time,
        'taken_at', log.taken_at,
        'skipped', log.skipped,
        'notes', log.notes
      )
      ORDER BY log.taken_at DESC
    ),
    '[]'::jsonb
  )
  INTO logs_payload
  FROM (
    SELECT *
    FROM public.medication_logs
    WHERE user_id = target_user_id
    ORDER BY taken_at DESC
    LIMIT 20
  ) log;

  RETURN jsonb_build_object(
    'user', user_record,
    'predictions', predictions_payload,
    'medication_reminders', reminders_payload,
    'medication_logs', logs_payload
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  target_user_id uuid,
  next_is_active boolean,
  reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_state jsonb;
  after_state jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF target_user_id = auth.uid() AND next_is_active = false THEN
    RAISE EXCEPTION 'Admins cannot deactivate their own account';
  END IF;

  IF next_is_active = false AND COALESCE(btrim(reason), '') = '' THEN
    RAISE EXCEPTION 'A reason is required when deactivating a user';
  END IF;

  SELECT to_jsonb(profile.*)
  INTO before_state
  FROM public.profiles profile
  WHERE profile.user_id = target_user_id;

  IF before_state IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE public.profiles
  SET
    is_account_active = next_is_active,
    account_status_reason = CASE WHEN next_is_active THEN NULL ELSE reason END,
    account_status_changed_at = now(),
    account_status_changed_by = auth.uid()
  WHERE user_id = target_user_id
  RETURNING to_jsonb(public.profiles.*) INTO after_state;

  PERFORM public.write_admin_audit_log(
    CASE WHEN next_is_active THEN 'reactivate_user' ELSE 'deactivate_user' END,
    'profile',
    target_user_id,
    before_state,
    after_state,
    reason,
    target_user_id
  );

  RETURN after_state;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_prediction_visibility(
  target_prediction_id uuid,
  next_is_hidden boolean,
  reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_state jsonb;
  after_state jsonb;
  affected_user_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF next_is_hidden = true AND COALESCE(btrim(reason), '') = '' THEN
    RAISE EXCEPTION 'A reason is required when hiding a prediction';
  END IF;

  SELECT user_id, to_jsonb(prediction.*)
  INTO affected_user_id, before_state
  FROM public.predictions prediction
  WHERE prediction.id = target_prediction_id;

  IF before_state IS NULL THEN
    RAISE EXCEPTION 'Prediction not found';
  END IF;

  UPDATE public.predictions
  SET
    is_hidden = next_is_hidden,
    hidden_reason = CASE WHEN next_is_hidden THEN reason ELSE NULL END,
    hidden_at = CASE WHEN next_is_hidden THEN now() ELSE NULL END,
    hidden_by = CASE WHEN next_is_hidden THEN auth.uid() ELSE NULL END
  WHERE id = target_prediction_id
  RETURNING to_jsonb(public.predictions.*) INTO after_state;

  PERFORM public.write_admin_audit_log(
    CASE WHEN next_is_hidden THEN 'hide_prediction' ELSE 'unhide_prediction' END,
    'prediction',
    target_prediction_id,
    before_state,
    after_state,
    reason,
    affected_user_id
  );

  RETURN after_state;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_medication_reminder_status(
  target_reminder_id uuid,
  next_is_active boolean,
  reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_state jsonb;
  after_state jsonb;
  affected_user_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF next_is_active = false AND COALESCE(btrim(reason), '') = '' THEN
    RAISE EXCEPTION 'A reason is required when deactivating a medication reminder';
  END IF;

  SELECT user_id, to_jsonb(reminder.*)
  INTO affected_user_id, before_state
  FROM public.medication_reminders reminder
  WHERE reminder.id = target_reminder_id;

  IF before_state IS NULL THEN
    RAISE EXCEPTION 'Medication reminder not found';
  END IF;

  UPDATE public.medication_reminders
  SET
    is_active = next_is_active,
    status_reason = CASE WHEN next_is_active THEN NULL ELSE reason END,
    status_changed_at = now(),
    status_changed_by = auth.uid()
  WHERE id = target_reminder_id
  RETURNING to_jsonb(public.medication_reminders.*) INTO after_state;

  PERFORM public.write_admin_audit_log(
    CASE WHEN next_is_active THEN 'reactivate_medication_reminder' ELSE 'deactivate_medication_reminder' END,
    'medication_reminder',
    target_reminder_id,
    before_state,
    after_state,
    reason,
    affected_user_id
  );

  RETURN after_state;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_audit_logs(
  action_filter text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  admin_user_id uuid,
  admin_name text,
  action text,
  entity_type text,
  entity_id uuid,
  target_user_id uuid,
  target_user_name text,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    logs.id,
    logs.created_at,
    logs.admin_user_id,
    COALESCE(admin_profile.full_name, admin_user.email::text, 'Admin') AS admin_name,
    logs.action,
    logs.entity_type,
    logs.entity_id,
    logs.target_user_id,
    COALESCE(target_profile.full_name, target_user.email::text, 'Unknown user') AS target_user_name,
    logs.reason
  FROM public.admin_audit_logs logs
  LEFT JOIN public.profiles admin_profile ON admin_profile.user_id = logs.admin_user_id
  LEFT JOIN auth.users admin_user ON admin_user.id = logs.admin_user_id
  LEFT JOIN public.profiles target_profile ON target_profile.user_id = logs.target_user_id
  LEFT JOIN auth.users target_user ON target_user.id = logs.target_user_id
  WHERE action_filter IS NULL OR action_filter = '' OR logs.action = action_filter
  ORDER BY logs.created_at DESC
  LIMIT GREATEST(limit_count, 1)
  OFFSET GREATEST(offset_count, 0);
END;
$$;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

DROP POLICY IF EXISTS "Users can view own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can delete own predictions" ON public.predictions;

CREATE POLICY "Users can view own predictions"
ON public.predictions FOR SELECT
USING (
  auth.uid() = user_id
  AND public.is_user_account_active(auth.uid())
  AND is_hidden = false
);

CREATE POLICY "Users can insert own predictions"
ON public.predictions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND public.is_user_account_active(auth.uid())
  AND is_hidden = false
);

CREATE POLICY "Users can delete own predictions"
ON public.predictions FOR DELETE
USING (
  auth.uid() = user_id
  AND public.is_user_account_active(auth.uid())
  AND is_hidden = false
);

DROP POLICY IF EXISTS "Users can view own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can insert own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can update own chat history" ON public.chat_history;
DROP POLICY IF EXISTS "Users can delete own chat history" ON public.chat_history;

CREATE POLICY "Users can view own chat history"
ON public.chat_history FOR SELECT
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can insert own chat history"
ON public.chat_history FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can update own chat history"
ON public.chat_history FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can delete own chat history"
ON public.chat_history FOR DELETE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

DROP POLICY IF EXISTS "Users can view own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can insert own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can update own health metrics" ON public.health_metrics;
DROP POLICY IF EXISTS "Users can delete own health metrics" ON public.health_metrics;

CREATE POLICY "Users can view own health metrics"
ON public.health_metrics FOR SELECT
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can insert own health metrics"
ON public.health_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can update own health metrics"
ON public.health_metrics FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can delete own health metrics"
ON public.health_metrics FOR DELETE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

DROP POLICY IF EXISTS "Users can view own medication reminders" ON public.medication_reminders;
DROP POLICY IF EXISTS "Users can insert own medication reminders" ON public.medication_reminders;
DROP POLICY IF EXISTS "Users can update own medication reminders" ON public.medication_reminders;
DROP POLICY IF EXISTS "Users can delete own medication reminders" ON public.medication_reminders;

CREATE POLICY "Users can view own medication reminders"
ON public.medication_reminders FOR SELECT
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can insert own medication reminders"
ON public.medication_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can update own medication reminders"
ON public.medication_reminders FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can delete own medication reminders"
ON public.medication_reminders FOR DELETE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

DROP POLICY IF EXISTS "Users can view own medication logs" ON public.medication_logs;
DROP POLICY IF EXISTS "Users can insert own medication logs" ON public.medication_logs;
DROP POLICY IF EXISTS "Users can delete own medication logs" ON public.medication_logs;

CREATE POLICY "Users can view own medication logs"
ON public.medication_logs FOR SELECT
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can insert own medication logs"
ON public.medication_logs FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

CREATE POLICY "Users can delete own medication logs"
ON public.medication_logs FOR DELETE
USING (auth.uid() = user_id AND public.is_user_account_active(auth.uid()));

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;

CREATE POLICY "Admins can view admin users"
ON public.admin_users FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_account_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_account_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_prediction_visibility(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_medication_reminder_status(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_audit_logs(text, integer, integer) TO authenticated;
