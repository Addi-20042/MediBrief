export const MEDICATION_FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily", timesCount: 1 },
  { value: "twice_daily", label: "Twice daily", timesCount: 2 },
  { value: "thrice_daily", label: "Three times daily", timesCount: 3 },
  { value: "weekly", label: "Weekly", timesCount: 1 },
  { value: "as_needed", label: "As needed", timesCount: 1 },
] as const;

export type MedicationFrequency = (typeof MEDICATION_FREQUENCY_OPTIONS)[number]["value"];

const DEFAULT_REMINDER_TIMES: Record<MedicationFrequency, string[]> = {
  once_daily: ["09:00"],
  twice_daily: ["09:00", "21:00"],
  thrice_daily: ["08:00", "14:00", "20:00"],
  weekly: ["09:00"],
  as_needed: ["09:00"],
};

export const getFrequencyLabel = (frequency: string) =>
  MEDICATION_FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.label ?? frequency;

export const getReminderTimesCount = (frequency: MedicationFrequency) =>
  MEDICATION_FREQUENCY_OPTIONS.find((option) => option.value === frequency)?.timesCount ?? 1;

export const getDefaultReminderTimes = (frequency: MedicationFrequency) => [
  ...DEFAULT_REMINDER_TIMES[frequency],
];

export const syncReminderTimesWithFrequency = (
  frequency: MedicationFrequency,
  currentTimes: string[],
) => {
  const defaults = getDefaultReminderTimes(frequency);
  const desiredCount = getReminderTimesCount(frequency);

  return Array.from({ length: desiredCount }, (_, index) => currentTimes[index] || defaults[index]);
};

export const formatReminderTimes = (reminderTimes: string[]) =>
  reminderTimes.filter(Boolean).join(", ");
