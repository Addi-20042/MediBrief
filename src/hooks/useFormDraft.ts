import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "medibrief_draft_";

/**
 * Persists a form field value to sessionStorage so it survives accidental navigation.
 * Automatically restores the value on mount and clears it when `clear()` is called.
 *
 * Usage:
 *   const [value, setValue, clearDraft] = useFormDraft("symptoms-input", "");
 */
export function useFormDraft(
  key: string,
  initialValue: string = "",
): [string, (val: string) => void, () => void] {
  const storageKey = STORAGE_PREFIX + key;

  const [value, setValueState] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored !== null ? stored : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Debounced write to sessionStorage
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const setValue = useCallback(
    (val: T) => {
      setValueState(val);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          if (val) {
            sessionStorage.setItem(storageKey, val);
          } else {
            sessionStorage.removeItem(storageKey);
          }
        } catch {
          // sessionStorage full or unavailable
        }
      }, 300);
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    setValueState(initialValue);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // no-op
    }
  }, [storageKey, initialValue]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return [value, setValue, clear];
}
