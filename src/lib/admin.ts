import { supabase } from "@/integrations/supabase/client";

export interface AdminAuditLog {
  id: string;
  created_at: string;
  admin_user_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  target_user_id: string | null;
  target_user_name: string;
  reason: string | null;
}

export interface AdminOverview {
  total_users: number;
  active_users: number;
  hidden_predictions: number;
  active_reminders: number;
  admin_count: number;
  recent_actions: AdminAuditLog[];
}

export interface AdminUserRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  created_at: string;
  is_account_active: boolean;
  admin_role: string | null;
  predictions_count: number;
  active_reminders_count: number;
}

export interface AdminPrediction {
  id: string;
  prediction_type: string;
  summary: string | null;
  created_at: string;
  is_hidden: boolean;
  hidden_reason: string | null;
}

export interface AdminMedicationReminder {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  reminder_times: string[];
  is_active: boolean;
  status_reason: string | null;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface AdminMedicationLog {
  id: string;
  reminder_id: string | null;
  scheduled_time: string | null;
  taken_at: string;
  skipped: boolean;
  notes: string | null;
}

export interface AdminUserProfile {
  user_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  phone_number: string | null;
  is_account_active: boolean;
  account_status_reason: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  height_cm: number | null;
  weight_kg: number | null;
}

export interface AdminUserDetail {
  user: AdminUserProfile;
  predictions: AdminPrediction[];
  medication_reminders: AdminMedicationReminder[];
  medication_logs: AdminMedicationLog[];
}

const parseJsonResult = <T>(value: unknown): T => value as T;

export const getAdminOverview = async () => {
  const { data, error } = await supabase.rpc("admin_get_overview");
  if (error) throw error;
  return parseJsonResult<AdminOverview>(data);
};

export const listAdminUsers = async (searchTerm: string, statusFilter: string) => {
  const { data, error } = await supabase.rpc("admin_list_users", {
    search_term: searchTerm || null,
    status_filter: statusFilter,
  });
  if (error) throw error;
  return (data || []) as AdminUserRow[];
};

export const getAdminUserDetail = async (userId: string) => {
  const { data, error } = await supabase.rpc("admin_get_user_detail", {
    target_user_id: userId,
  });
  if (error) throw error;
  return parseJsonResult<AdminUserDetail>(data);
};

export const setAdminUserStatus = async (
  userId: string,
  nextIsActive: boolean,
  reason?: string,
) => {
  const { data, error } = await supabase.rpc("admin_set_user_status", {
    target_user_id: userId,
    next_is_active: nextIsActive,
    reason: reason || null,
  });
  if (error) throw error;
  return data;
};

export const setPredictionVisibility = async (
  predictionId: string,
  nextIsHidden: boolean,
  reason?: string,
) => {
  const { data, error } = await supabase.rpc("admin_set_prediction_visibility", {
    target_prediction_id: predictionId,
    next_is_hidden: nextIsHidden,
    reason: reason || null,
  });
  if (error) throw error;
  return data;
};

export const setMedicationReminderStatus = async (
  reminderId: string,
  nextIsActive: boolean,
  reason?: string,
) => {
  const { data, error } = await supabase.rpc("admin_set_medication_reminder_status", {
    target_reminder_id: reminderId,
    next_is_active: nextIsActive,
    reason: reason || null,
  });
  if (error) throw error;
  return data;
};

export const listAdminAuditLogs = async (actionFilter: string) => {
  const { data, error } = await supabase.rpc("admin_list_audit_logs", {
    action_filter: actionFilter || null,
    limit_count: 100,
    offset_count: 0,
  });
  if (error) throw error;
  return (data || []) as AdminAuditLog[];
};
