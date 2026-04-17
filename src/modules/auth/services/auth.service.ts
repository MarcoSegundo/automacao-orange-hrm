import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../../../pages/dashboard.page';
import { TestMessages } from '../../../support/messages';
import { logInfo, logError } from '../../../support/logger';
import { retryWithBackoff } from '../../../support/retry';

export interface IAuthService {
  signIn(user: string, pass: string, attempts?: number, backoffMs?: number): Promise<void>;
}

export class AuthService implements IAuthService {
  constructor(private readonly page: Page) {}
  /**
   * Realiza login e valida que o dashboard foi carregado.
   *
   * Tenta autenticar via UI, repetindo até `attempts` vezes com backoff
   * exponencial linear (multiplicador `backoffMs`). Em cada tentativa o
   * contexto de cookies é limpo para evitar estados conflitantes.
   *
   * @param user - nome de usuário
   * @param pass - senha
   * @param attempts - número máximo de tentativas (padrão: 3)
   * @param backoffMs - base de espera entre tentativas em ms (padrão: 1500)
   * @throws {unknown} lança o último erro caso todas as tentativas falhem
   * @returns Promise<void>
   */
  async signIn(user: string, pass: string, attempts = 3, backoffMs = 1500): Promise<void> {
    const loginPage = new LoginPage(this.page);
    const dashboard = new DashboardPage(this.page);

    let lastAttempt = 0;

    await retryWithBackoff(
      async () => {
        await this.page.context().clearCookies();
        await loginPage.open();
        await loginPage.login(user, pass);
        await dashboard.expectLoaded();
      },
      attempts,
      backoffMs,
      (attempt, err) => {
        logError(TestMessages.loginRetryFailure(attempt, err));
      },
      (attempt) => {
        lastAttempt = attempt;
        logInfo(TestMessages.loginRetryAttempt(attempt, user));
      },
    );

    logInfo(TestMessages.loginRetrySuccess(lastAttempt || 1, user));
    return;
  }
}
