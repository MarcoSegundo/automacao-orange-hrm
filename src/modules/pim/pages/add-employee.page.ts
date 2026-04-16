import { expect, Page } from "@playwright/test";
import { BasePage } from "../../../pages/base.page";
import { EMPLOYEE_FORM_REDIRECT_PATTERN, EMPLOYEE_FORM_REDIRECT_TIMEOUT } from "../config/constants";

export class AddEmployeePage extends BasePage {
  private readonly firstNameInput = this.page.locator('input[name="firstName"]');
  private readonly lastNameInput = this.page.locator('input[name="lastName"]');
  private readonly loginDetailsSection = this.page.locator(".oxd-form-row").filter({
    has: this.page.getByText("Create Login Details")
  });
  private readonly createLoginDetailsSwitch = this.page.locator(".oxd-switch-input").first();
  private readonly loginUsernameInput = this.page
    .locator(".oxd-input-group")
    .filter({ hasText: "Username" })
    .locator("input")
    .first();
  private readonly loginEnabledRadio = this.page.locator('input[type="radio"][value="1"]').first();
  private readonly loginPasswordInput = this.page
    .locator(".oxd-input-group")
    .filter({ hasText: "Password" })
    .locator('input[type="password"]')
    .first();
  private readonly loginConfirmPasswordInput = this.page
    .locator(".oxd-input-group")
    .filter({ hasText: "Confirm Password" })
    .locator('input[type="password"]')
    .first();
  private readonly saveButton = this.page.getByRole("button", { name: "Save" });

  constructor(page: Page) {
    super(page);
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.firstNameInput).toBeVisible();
  }

  async fillMandatoryData(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
  }

  async fillLoginDetails(username: string, password: string): Promise<void> {
    await this.enableLoginDetails();
    await this.loginUsernameInput.fill(username);
    await this.loginEnabledRadio.check({ force: true });
    await this.loginPasswordInput.fill(password);
    await this.loginConfirmPasswordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
    // Aguarda o redirecionamento pós-submit para garantir que o cadastro
    // foi processado e a página de destino foi carregada.
    await this.page.waitForURL(EMPLOYEE_FORM_REDIRECT_PATTERN, { timeout: EMPLOYEE_FORM_REDIRECT_TIMEOUT });
  }

  async createEmployee(firstName: string, lastName: string): Promise<{ id: string; firstName: string; lastName: string }> {
    await this.fillMandatoryData(firstName, lastName);
    await this.submit();
    const createdId = this.extractEmployeeIdFromCurrentUrl();

    return {
      id: createdId,
      firstName,
      lastName
    };
  }

  /** Retorna o id do employee presente na URL atual (usado após submit) */
  getCreatedEmployeeId(): string {
    return this.extractEmployeeIdFromCurrentUrl();
  }

  // Tenta extrair o id do funcionário da URL; usa timestamp como fallback.
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

    // Em alguns builds do demo, o primeiro clique não propaga no switch customizado.
    await this.createLoginDetailsSwitch.click();
    await expect(this.loginUsernameInput).toBeVisible({ timeout: 10000 });
    await expect(this.loginPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(this.loginConfirmPasswordInput).toBeVisible({ timeout: 10000 });
  }
}
