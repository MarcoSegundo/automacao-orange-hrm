import { expect, Page } from '@playwright/test';
import { BasePage } from '../../../pages/base.page';
import {
  EMPLOYEE_FORM_REDIRECT_PATTERN,
  EMPLOYEE_FORM_REDIRECT_TIMEOUT,
} from '../config/constants';
import { Selectors } from '../../../support/selectors';
import { UiText } from '../../../support/ui-text';

/**
 * Page Object para criação de funcionário.
 * Encapsula preenchimento e submissão do formulário de employee.
 */
export class AddEmployeePage extends BasePage {
  private readonly firstNameInput = this.page.locator('input[name="firstName"]');
  private readonly lastNameInput = this.page.locator('input[name="lastName"]');
  private readonly loginDetailsSection = this.page
    .locator('.oxd-form-row')
    .filter({ has: this.page.getByText(UiText.labels.createLoginDetails) });
  private readonly createLoginDetailsSwitch = this.page.locator('.oxd-switch-input').first();
  private readonly loginUsernameInput = this.page
    .locator(Selectors.oxdInputGroup)
    .filter({ hasText: UiText.labels.username })
    .locator('input')
    .first();
  private readonly loginEnabledRadio = this.page.locator('input[type="radio"][value="1"]').first();
  private readonly loginPasswordInput = this.page
    .locator(Selectors.oxdInputGroup)
    .filter({ hasText: UiText.labels.password })
    .locator('input[type="password"]')
    .first();
  private readonly loginConfirmPasswordInput = this.page
    .locator(Selectors.oxdInputGroup)
    .filter({ hasText: UiText.labels.confirmPassword })
    .locator('input[type="password"]')
    .first();
  private readonly saveButton = this.page.getByRole('button', { name: 'Save' });

  constructor(page: Page) {
    super(page);
  }

  async expectFormVisible(): Promise<void> {
    const first = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.firstName),
      this.firstNameInput,
    ]);
    await expect(first).toBeVisible();
  }

  async fillMandatoryData(firstName: string, lastName: string): Promise<void> {
    const first = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.firstName),
      this.firstNameInput,
    ]);
    const last = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.lastName),
      this.lastNameInput,
    ]);

    await first.fill(firstName);
    await last.fill(lastName);
  }

  async fillLoginDetails(username: string, password: string): Promise<void> {
    await this.enableLoginDetails();
    const usernameInput = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.username),
      this.loginUsernameInput,
    ]);
    const passwordInput = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.password),
      this.loginPasswordInput,
    ]);

    await usernameInput.fill(username);
    await this.loginEnabledRadio.check({ force: true });
    await passwordInput.fill(password);
    await this.loginConfirmPasswordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForURL(EMPLOYEE_FORM_REDIRECT_PATTERN, {
      timeout: EMPLOYEE_FORM_REDIRECT_TIMEOUT,
    });
  }

  async createEmployee(
    firstName: string,
    lastName: string,
  ): Promise<{ id: string; firstName: string; lastName: string }> {
    await this.fillMandatoryData(firstName, lastName);
    await this.submit();
    const createdId = this.extractEmployeeIdFromCurrentUrl();

    return {
      id: createdId,
      firstName,
      lastName,
    };
  }

  /** Retorna o id do employee presente na URL atual (usado após submit) */
  getCreatedEmployeeId(): string {
    return this.extractEmployeeIdFromCurrentUrl();
  }

  /**
   * Extrai o id do funcionário presente na URL atual; usa timestamp como fallback.
   */
  private extractEmployeeIdFromCurrentUrl(): string {
    const pathname = new URL(this.page.url()).pathname;
    const match = pathname.match(/(?:empNumber|id|employeeId)\/([^/?#]+)/i);

    if (match?.[1]) {
      return match[1];
    }

    return `${Date.now()}`;
  }

  private async enableLoginDetails(): Promise<void> {
    if (await this.loginUsernameInput.isVisible()) {
      return;
    }

    await this.loginDetailsSection.scrollIntoViewIfNeeded();
    await this.createLoginDetailsSwitch.click();
    if (await this.loginUsernameInput.isVisible().catch(() => false)) {
      return;
    }

    // Nota: em alguns builds do demo, o primeiro clique não propaga no switch customizado.
    await this.createLoginDetailsSwitch.click();
    await expect(this.loginUsernameInput).toBeVisible({ timeout: 10000 });
    await expect(this.loginPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(this.loginConfirmPasswordInput).toBeVisible({ timeout: 10000 });
  }
}
