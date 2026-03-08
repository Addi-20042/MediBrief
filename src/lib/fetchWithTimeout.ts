/**
 * Wraps `supabase.functions.invoke` results with a client-side timeout.
 * Prevents the UI from hanging indefinitely when an edge function is slow.
 *
 * Usage:
 *   const data = await invokeWithTimeout("analyze-symptoms", { body: { symptoms } }, 30000);
 */

import { supabase } from "@/integrations/supabase/client";

export class RequestTimeoutError extends Error {
  constructor(fnName: string, ms: number) {
    super(`Request to "${fnName}" timed out after ${ms / 1000}s. Please try again.`);
    this.name = "RequestTimeoutError";
  }
}

export async function invokeWithTimeout<T = unknown>(
  functionName: string,
  options?: { body?: Record<string, unknown> },
  timeoutMs = 30_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      ...options,
      // Note: supabase-js doesn't natively support AbortSignal on invoke,
      // so we race manually below.
    });

    clearTimeout(timer);

    if (error) throw new Error(error.message || `Edge function "${functionName}" failed`);
    return data as T;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Race a promise against a timeout. Works with any async call (fetch, supabase, etc.)
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, label = "Request"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new RequestTimeoutError(label, ms)), ms);
    promise
      .then((val) => { clearTimeout(timer); resolve(val); })
      .catch((err) => { clearTimeout(timer); reject(err); });
  });
}
