import type { Database, Json } from "@/integrations/supabase/types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type PredictionRow = Database["public"]["Tables"]["predictions"]["Row"];

export interface PredictionDisease {
  name?: string;
  probability?: number | string;
  likelihood?: number | string;
  urgency?: string;
}

const isPredictionDisease = (value: Json): value is PredictionDisease => (
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value)
);

export const getPredictionDiseaseName = (disease: PredictionDisease | string) => (
  typeof disease === "string" ? disease : disease.name || "Unknown condition"
);

export const toPredictionDiseases = (value: Json | null): Array<PredictionDisease | string> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is PredictionDisease | string => (
    typeof item === "string" || isPredictionDisease(item)
  ));
};

export const getAgeFromDateOfBirth = (dateOfBirth: string | null) => {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  return Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
};

export const getHealthProfileFacts = (profile: ProfileRow | null) => {
  if (!profile) {
    return [];
  }

  const facts: string[] = [];
  const age = getAgeFromDateOfBirth(profile.date_of_birth);

  if (age !== null) facts.push(`Age: ${age}`);
  if (profile.gender) facts.push(`Gender: ${profile.gender}`);
  if (profile.blood_type) facts.push(`Blood Type: ${profile.blood_type}`);
  if (profile.height_cm) facts.push(`Height: ${profile.height_cm}cm`);
  if (profile.weight_kg) facts.push(`Weight: ${profile.weight_kg}kg`);
  if (profile.allergies) facts.push(`Known Allergies: ${profile.allergies}`);
  if (profile.medical_conditions) facts.push(`Existing Conditions: ${profile.medical_conditions}`);

  return facts;
};

export const buildHealthProfilePrompt = (
  profile: ProfileRow | null,
  options?: {
    prefix?: string;
    multiline?: boolean;
  },
) => {
  const facts = getHealthProfileFacts(profile);

  if (facts.length === 0) {
    return "";
  }

  const prefix = options?.prefix || "Patient Profile:";
  const multiline = options?.multiline ?? false;

  return multiline
    ? `${prefix}\n${facts.join("\n")}`
    : `${prefix}\n${facts.join(", ")}`;
};
