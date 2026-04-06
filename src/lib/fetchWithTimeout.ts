/**
 * Wraps `supabase.functions.invoke` results with a client-side timeout and retry.
 * Prevents the UI from hanging indefinitely when an edge function is slow.
 */

import { supabase } from "@/integrations/supabase/client";

export class RequestTimeoutError extends Error {
  constructor(fnName: string, ms: number) {
    super(`Request to "${fnName}" timed out after ${ms / 1000}s. Please try again.`);
    this.name = "RequestTimeoutError";
  }
}

function normalizeFunctionErrorMessage(message: string, fallback: string): string {
  const cleaned = message.trim();
  const lower = cleaned.toLowerCase();

  if (!cleaned) return fallback;

  if (lower.includes("quota exceeded") || lower.includes("rate limited")) {
    if (lower.includes("limit: 0")) {
      return "AI analysis is temporarily unavailable because this Gemini project has zero generation quota available. Enable billing for the Google project behind this key or use a different Gemini key from a project with active quota.";
    }

    return "AI analysis is temporarily unavailable because the Gemini API key has no available quota. Add billing or use a different Gemini key, then try again.";
  }

  if (lower.includes("not configured") || lower.includes("google_gemini_api_key")) {
    return "AI analysis is not configured yet. Add a working GOOGLE_GEMINI_API_KEY in Supabase project secrets.";
  }

  return cleaned;
}

async function readResponseErrorMessage(response: Response): Promise<string | null> {
  const clone = response.clone();

  try {
    const data = await clone.json();
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.message === "string") return data.message;
  } catch {
    // Fall back to plain text below.
  }

  try {
    const text = await response.clone().text();
    return text.trim() || null;
  } catch {
    return null;
  }
}

export async function getFunctionErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof RequestTimeoutError) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const maybeContext = "context" in error ? (error as { context?: unknown }).context : undefined;
    if (typeof Response !== "undefined" && maybeContext instanceof Response) {
      const contextMessage = await readResponseErrorMessage(maybeContext);
      return normalizeFunctionErrorMessage(contextMessage ?? fallback, fallback);
    }
  }

  if (error instanceof Error) {
    return normalizeFunctionErrorMessage(error.message, fallback);
  }

  return fallback;
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

/**
 * Retry a function up to `maxRetries` times with exponential backoff.
 * Only retries on transient errors (timeouts, 5xx, network errors).
 * Does NOT retry on 4xx (bad request, rate limit, auth errors).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1,
  label = "Request",
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry client errors or rate limits
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (msg.includes("rate limit") || msg.includes("401") || msg.includes("403") || msg.includes("400")) {
          throw err;
        }
      }
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * 2 ** attempt, 5000);
        console.warn(`[${label}] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Combined: invoke with timeout + automatic retry for transient failures.
 * Usage:
 *   const resp = await invokeWithRetry(
 *     () => withTimeout(supabase.functions.invoke("analyze-symptoms", { body }), 45000, "analyze-symptoms"),
 *     1, "analyze-symptoms"
 *   );
 */
export { supabase };
