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
  FROM auth.users AS auth_user
  LEFT JOIN public.profiles AS profile ON profile.user_id = auth_user.id
  LEFT JOIN public.admin_users AS admin_role
    ON admin_role.user_id = auth_user.id
   AND admin_role.is_active = true
  LEFT JOIN (
    SELECT predictions.user_id, COUNT(*) AS total_predictions
    FROM public.predictions AS predictions
    GROUP BY predictions.user_id
  ) AS prediction_counts ON prediction_counts.user_id = auth_user.id
  LEFT JOIN (
    SELECT reminders.user_id, COUNT(*) AS active_reminders
    FROM public.medication_reminders AS reminders
    WHERE reminders.is_active = true
    GROUP BY reminders.user_id
  ) AS reminder_counts ON reminder_counts.user_id = auth_user.id
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
