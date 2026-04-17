import { expect, Page } from '@playwright/test';
import { BasePage } from '../../../pages/base.page';
import { ROUTES, ROUTE_PATTERNS } from '../../../support/routes';
import { SystemMessages } from '../../../support/messages';
import { UiText } from '../../../support/ui-text';

/**
 * Page Object de autenticação.
 * Encapsula ações e validações de login para reutilização nos steps e serviços.
 */
export class LoginPage extends BasePage {
  private readonly username = this.page.locator('input[name="username"]');
  private readonly password = this.page.locator('input[name="password"]');
  private readonly submit = this.page.locator('button[type="submit"]');
  private readonly alert = this.page
    .locator('.oxd-alert-content-text, .oxd-alert-content .oxd-text')
    .first();

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.authLogin);
    if (ROUTE_PATTERNS.authLogin.test(this.page.url())) {
      const usernameInput = await this.getBestInput([
        this.page.getByPlaceholder(UiText.placeholders.username),
        this.username,
      ]);
      await expect(usernameInput).toBeVisible({ timeout: 10000 });
    }
  }

  async login(user: string, pass: string): Promise<void> {
    // Nota: o wait de redirecionamento é responsabilidade de quem chama (step/serviço).
    const usernameInput = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.username),
      this.username,
    ]);
    const passwordInput = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.password),
      this.password,
    ]);

    await usernameInput.fill(user);
    await passwordInput.fill(pass);
    await this.submit.click();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.alert).toContainText(SystemMessages.invalidCredentials, { timeout: 10000 });
  }
}
