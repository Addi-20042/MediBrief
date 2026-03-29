export const APP_NAME = "MediBrief";

export const APP_TAGLINE = "AI Health Assistant";

export const APP_DESCRIPTION =
  "AI-powered health support for symptom analysis, report understanding, first-aid guidance, and personal health tracking.";

export const MEDICAL_DISCLAIMER =
  "MediBrief provides educational health information and AI-generated assistance. It is not a substitute for emergency care, diagnosis, treatment, or advice from a licensed healthcare professional.";

export const getSupportEmail = () => import.meta.env.VITE_SUPPORT_EMAIL || "";

export const getSiteUrl = () => {
  const configuredUrl = import.meta.env.VITE_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};
