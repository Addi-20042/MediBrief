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
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_users', (
      SELECT COUNT(*)
      FROM auth.users auth_user
      LEFT JOIN public.profiles profile ON profile.user_id = auth_user.id
      WHERE COALESCE(profile.is_account_active, true) = true
    ),
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
    auth_user.id AS user_id,
    profile.full_name,
    auth_user.email::text,
    profile.phone_number,
    COALESCE(profile.created_at, auth_user.created_at) AS created_at,
    COALESCE(profile.is_account_active, true) AS is_account_active,
    admin_role.role,
    COALESCE(prediction_counts.total_predictions, 0) AS predictions_count,
    COALESCE(reminder_counts.active_reminders, 0) AS active_reminders_count
  FROM auth.users auth_user
  LEFT JOIN public.profiles profile ON profile.user_id = auth_user.id
  LEFT JOIN public.admin_users admin_role ON admin_role.user_id = auth_user.id AND admin_role.is_active = true
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS total_predictions
    FROM public.predictions
    GROUP BY user_id
  ) prediction_counts ON prediction_counts.user_id = auth_user.id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS active_reminders
    FROM public.medication_reminders
    WHERE is_active = true
    GROUP BY user_id
  ) reminder_counts ON reminder_counts.user_id = auth_user.id
  WHERE (
    search_term IS NULL
    OR search_term = ''
    OR COALESCE(profile.full_name, '') ILIKE '%' || search_term || '%'
    OR COALESCE(auth_user.email, '') ILIKE '%' || search_term || '%'
    OR COALESCE(profile.phone_number, '') ILIKE '%' || search_term || '%'
  )
  AND (
    status_filter = 'all'
    OR (status_filter = 'active' AND COALESCE(profile.is_account_active, true) = true)
    OR (status_filter = 'inactive' AND COALESCE(profile.is_account_active, true) = false)
  )
  ORDER BY COALESCE(profile.created_at, auth_user.created_at) DESC;
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
    'user_id', auth_user.id,
    'email', auth_user.email,
    'created_at', COALESCE(profile.created_at, auth_user.created_at),
    'last_sign_in_at', auth_user.last_sign_in_at,
    'full_name', profile.full_name,
    'phone_number', profile.phone_number,
    'is_account_active', COALESCE(profile.is_account_active, true),
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
  FROM auth.users auth_user
  LEFT JOIN public.profiles profile ON profile.user_id = auth_user.id
  WHERE auth_user.id = target_user_id;

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
    IF NOT EXISTS (
      SELECT 1
      FROM auth.users auth_user
      WHERE auth_user.id = target_user_id
    ) THEN
      RAISE EXCEPTION 'User not found';
    END IF;

    INSERT INTO public.profiles (user_id, full_name)
    SELECT auth_user.id, auth_user.raw_user_meta_data->>'full_name'
    FROM auth.users auth_user
    WHERE auth_user.id = target_user_id
    ON CONFLICT (user_id) DO NOTHING;
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
