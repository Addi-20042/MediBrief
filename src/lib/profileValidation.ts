import { z } from "zod";

const patientNameRegex = /^[A-Za-z][A-Za-z\s'-]*$/;

export const patientNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name is too long")
  .regex(patientNameRegex, "Patient name can only contain letters, spaces, apostrophes, and hyphens");

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    try {
      normalizePhoneNumber(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: (error as Error).message,
      });
    }
  });

export const requiredPhoneSchema = phoneSchema.superRefine((value, ctx) => {
  try {
    normalizePhoneNumber(value);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: (error as Error).message,
    });
  }
});

export const normalizePatientName = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, " ");

export const normalizePhoneNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Phone number is required");
  }

  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+")) {
    if (digits.length < 10 || digits.length > 15) {
      throw new Error("Phone number must be a valid international number");
    }

    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  throw new Error("Enter a valid phone number, for example +91 9876543210");
};
