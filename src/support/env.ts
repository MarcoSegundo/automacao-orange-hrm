import dotenv from 'dotenv';
import { TestMessages } from './messages';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(TestMessages.envVarNotInitialized(name));
  }

  return value;
}

function getIntEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const parsed = parseInt(v, 10);
  if (Number.isNaN(parsed)) throw new Error(TestMessages.envVarNotANumber(name, v));
  return parsed;
}

/**
 * Configuração de ambiente (valores lidos de `process.env`).
 *
 * Variáveis:
 * - `BASE_URL` (opcional) — URL base da aplicação (default: https://opensource-demo.orangehrmlive.com)
 * - `ADMIN_USER`, `ADMIN_PASS` (obrigatórias) — credenciais administrativas para fixtures
 * - `HEADLESS` (opcional) — se 'false' abre navegador para debug
 * - `INPUT_TIMEOUT_MS`, `CLICK_RETRY_TIMEOUT_MS`, `CLICK_RETRY_ATTEMPTS`, `CLICK_WAIT_BETWEEN_MS` — timeouts e tentativas configuráveis
 */
export const env = {
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  adminUser: getRequiredEnv('ADMIN_USER'),
  adminPass: getRequiredEnv('ADMIN_PASS'),
  headless: process.env.HEADLESS !== 'false',
  inputTimeoutMs: getIntEnv('INPUT_TIMEOUT_MS', 500),
  clickRetryTimeoutMs: getIntEnv('CLICK_RETRY_TIMEOUT_MS', 5000),
  clickRetryAttempts: getIntEnv('CLICK_RETRY_ATTEMPTS', 3),
  clickWaitBetweenMs: getIntEnv('CLICK_WAIT_BETWEEN_MS', 150),
};
