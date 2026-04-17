import { logDebug } from './logger';
import { DebugMessages } from './messages';

/**
 * Utilitário genérico de retry com backoff exponencial.
 *
 * Recebe uma função assíncrona `fn` e tenta executá-la até `attempts` vezes.
 * Em cada falha chama `onAttempt` (se fornecido) e espera um backoff exponencial.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts = 3,
  baseDelayMs = 250,
  onAttempt?: (attempt: number, err: unknown) => void,
  onBeforeAttempt?: (attempt: number) => void,
): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      try {
        onBeforeAttempt?.(attempt);
      } catch (callbackError) {
        logDebug(DebugMessages.retryOnBeforeAttemptCallbackFailed(attempt, String(callbackError)));
      }

      return await fn();
    } catch (err) {
      lastErr = err;
      try {
        onAttempt?.(attempt, err);
      } catch (callbackError) {
        logDebug(DebugMessages.retryOnAttemptCallbackFailed(attempt, String(callbackError)));
      }

      if (attempt === attempts) break;
      const backoff = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  throw lastErr;
}
