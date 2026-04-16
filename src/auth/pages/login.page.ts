import { expect, Page } from "@playwright/test";
import { BasePage } from "../../pages/base.page";
import { ROUTES, ROUTE_PATTERNS } from "../../support/routes";
import { SystemMessages, TestMessages } from "../../support/messages";
import { logInfo, logError } from "../../support/logger";

/**
 * Page Object de autenticação.
 * Encapsula ações e validações de login para reutilização nos steps e serviços.
 */
export class LoginPage extends BasePage {
  private readonly username = this.page.locator('input[name="username"]');
  private readonly password = this.page.locator('input[name="password"]');
  private readonly submit = this.page.locator('button[type="submit"]');
  private readonly alert = this.page.locator(".oxd-alert-content-text, .oxd-alert-content .oxd-text").first();

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.authLogin);
    if (ROUTE_PATTERNS.authLogin.test(this.page.url())) {
      await expect(this.username).toBeVisible({ timeout: 10000 });
    }
  }

  async login(user: string, pass: string): Promise<void> {
    // O wait de redirecionamento é responsabilidade de quem chama (step/serviço).
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async expectLoginError(): Promise<void> {
    await expect(this.alert).toContainText(SystemMessages.invalidCredentials, { timeout: 10000 });
  }

  /**
   * Tenta efetuar login com retries para contornar latência do ambiente demo.
   * Não faz validação do dashboard (deixa isso para quem chama).
   */
  async loginWithRetry(user: string, pass: string, attempts = 3, backoffMs = 1500): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        logInfo(TestMessages.loginRetryAttempt(attempt, user));
        await this.page.context().clearCookies();
        await this.open();
        await this.login(user, pass);
        await this.expectLoginSuccess();
        logInfo(TestMessages.loginRetrySuccess(attempt, user));
        return;
      } catch (err) {
        lastError = err;
        logError(TestMessages.loginRetryFailure(attempt, err));
        await this.page.waitForTimeout(backoffMs * attempt);
      }
    }

    throw lastError;
  }
}