import type { Disease } from "@/lib/diseases";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  Activity,
  FileText,
  HeartPulse,
  MessageCircle,
  Shield,
  Siren,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type CustomDiseaseEntry = Tables<"custom_diseases">;
export type CustomFirstAidGuideEntry = Tables<"custom_first_aid_guides">;
export type CustomEmergencyContactEntry = Tables<"custom_emergency_contacts">;
export type AppFeatureCardEntry = Tables<"app_feature_cards">;

export type CustomDiseaseInsert = TablesInsert<"custom_diseases">;
export type CustomFirstAidGuideInsert = TablesInsert<"custom_first_aid_guides">;
export type CustomEmergencyContactInsert = TablesInsert<"custom_emergency_contacts">;
export type AppFeatureCardInsert = TablesInsert<"app_feature_cards">;

export type CustomDiseaseUpdate = TablesUpdate<"custom_diseases">;
export type CustomFirstAidGuideUpdate = TablesUpdate<"custom_first_aid_guides">;
export type CustomEmergencyContactUpdate = TablesUpdate<"custom_emergency_contacts">;
export type AppFeatureCardUpdate = TablesUpdate<"app_feature_cards">;

export type AppFeatureIconName =
  | "activity"
  | "stethoscope"
  | "file-text"
  | "message-circle"
  | "shield"
  | "heart-pulse"
  | "siren";

export const appFeatureIconOptions: Array<{ value: AppFeatureIconName; label: string }> = [
  { value: "activity", label: "Activity" },
  { value: "stethoscope", label: "Stethoscope" },
  { value: "file-text", label: "File Text" },
  { value: "message-circle", label: "Message Circle" },
  { value: "shield", label: "Shield" },
  { value: "heart-pulse", label: "Heart Pulse" },
  { value: "siren", label: "Siren" },
];

const appFeatureIconMap: Record<AppFeatureIconName, LucideIcon> = {
  activity: Activity,
  stethoscope: Stethoscope,
  "file-text": FileText,
  "message-circle": MessageCircle,
  shield: Shield,
  "heart-pulse": HeartPulse,
  siren: Siren,
};

export const getAppFeatureIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) {
    return Activity;
  }

  return appFeatureIconMap[(iconName as AppFeatureIconName) ?? "activity"] ?? Activity;
};

export const mapCustomDiseaseToDisease = (entry: CustomDiseaseEntry): Disease => ({
  id: `custom-disease-${entry.id}`,
  name: entry.name,
  category: entry.category,
  description: entry.description,
  symptoms: entry.symptoms,
  causes: entry.causes,
  prevention: entry.prevention,
  treatment: entry.treatment,
  riskFactors: entry.risk_factors,
  whenToSeeDoctor: entry.when_to_see_doctor,
});

export const listPublishedCustomDiseases = async () => {
  const { data, error } = await supabase
    .from("custom_diseases")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CustomDiseaseEntry[];
};

export const listAdminCustomDiseases = async () => {
  const { data, error } = await supabase
    .from("custom_diseases")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CustomDiseaseEntry[];
};

export const createCustomDisease = async (values: CustomDiseaseInsert) => {
  const { data, error } = await supabase.from("custom_diseases").insert(values).select().single();
  if (error) throw error;
  return data as CustomDiseaseEntry;
};

export const updateCustomDisease = async (id: string, values: CustomDiseaseUpdate) => {
  const { data, error } = await supabase.from("custom_diseases").update(values).eq("id", id).select().single();
  if (error) throw error;
  return data as CustomDiseaseEntry;
};

export const deleteCustomDisease = async (id: string) => {
  const { error } = await supabase.from("custom_diseases").delete().eq("id", id);
  if (error) throw error;
};

export const listPublishedCustomFirstAidGuides = async () => {
  const { data, error } = await supabase
    .from("custom_first_aid_guides")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CustomFirstAidGuideEntry[];
};

export const listAdminCustomFirstAidGuides = async () => {
  const { data, error } = await supabase
    .from("custom_first_aid_guides")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CustomFirstAidGuideEntry[];
};

export const createCustomFirstAidGuide = async (values: CustomFirstAidGuideInsert) => {
  const { data, error } = await supabase.from("custom_first_aid_guides").insert(values).select().single();
  if (error) throw error;
  return data as CustomFirstAidGuideEntry;
};

export const updateCustomFirstAidGuide = async (id: string, values: CustomFirstAidGuideUpdate) => {
  const { data, error } = await supabase
    .from("custom_first_aid_guides")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CustomFirstAidGuideEntry;
};

export const deleteCustomFirstAidGuide = async (id: string) => {
  const { error } = await supabase.from("custom_first_aid_guides").delete().eq("id", id);
  if (error) throw error;
};

export const listPublishedCustomEmergencyContacts = async () => {
  const { data, error } = await supabase
    .from("custom_emergency_contacts")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CustomEmergencyContactEntry[];
};

export const listAdminCustomEmergencyContacts = async () => {
  const { data, error } = await supabase
    .from("custom_emergency_contacts")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CustomEmergencyContactEntry[];
};

export const createCustomEmergencyContact = async (values: CustomEmergencyContactInsert) => {
  const { data, error } = await supabase.from("custom_emergency_contacts").insert(values).select().single();
  if (error) throw error;
  return data as CustomEmergencyContactEntry;
};

export const updateCustomEmergencyContact = async (id: string, values: CustomEmergencyContactUpdate) => {
  const { data, error } = await supabase
    .from("custom_emergency_contacts")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CustomEmergencyContactEntry;
};

export const deleteCustomEmergencyContact = async (id: string) => {
  const { error } = await supabase.from("custom_emergency_contacts").delete().eq("id", id);
  if (error) throw error;
};

export const listPublishedAppFeatureCards = async () => {
  const { data, error } = await supabase
    .from("app_feature_cards")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AppFeatureCardEntry[];
};

export const listAdminAppFeatureCards = async () => {
  const { data, error } = await supabase
    .from("app_feature_cards")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AppFeatureCardEntry[];
};

export const createAppFeatureCard = async (values: AppFeatureCardInsert) => {
  const { data, error } = await supabase.from("app_feature_cards").insert(values).select().single();
  if (error) throw error;
  return data as AppFeatureCardEntry;
};

export const updateAppFeatureCard = async (id: string, values: AppFeatureCardUpdate) => {
  const { data, error } = await supabase.from("app_feature_cards").update(values).eq("id", id).select().single();
  if (error) throw error;
  return data as AppFeatureCardEntry;
};

export const deleteAppFeatureCard = async (id: string) => {
  const { error } = await supabase.from("app_feature_cards").delete().eq("id", id);
  if (error) throw error;
};
