import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../../../pages/dashboard.page";
import { TestMessages } from "../../../support/messages";
import { logInfo, logError } from "../../../support/logger";

export class AuthService {
  constructor(private readonly page: Page) {}

  /**
   * Realiza login e valida que o dashboard foi carregado.
   * Faz retries com backoff em caso de falhas temporárias.
   */
  async signIn(user: string, pass: string, attempts = 3, backoffMs = 1500): Promise<void> {
    const loginPage = new LoginPage(this.page);
    const dashboard = new DashboardPage(this.page);

    let lastErr: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        logInfo(TestMessages.loginRetryAttempt(attempt, user));
        await this.page.context().clearCookies();
        await loginPage.open();
        await loginPage.login(user, pass);
        await dashboard.expectLoaded();
        logInfo(TestMessages.loginRetrySuccess(attempt, user));
        return;
      } catch (err) {
        lastErr = err;
        logError(TestMessages.loginRetryFailure(attempt, err));
        await this.page.waitForTimeout(backoffMs * attempt);
      }
    }

    throw lastErr;
  }
}
