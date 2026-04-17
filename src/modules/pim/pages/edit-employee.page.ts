import { expect, Page } from '@playwright/test';
import { BasePage } from '../../../pages/base.page';
import {
  EMPLOYEE_FORM_REDIRECT_PATTERN,
  EMPLOYEE_FORM_REDIRECT_TIMEOUT,
} from '../config/constants';
import { UiText } from '../../../support/ui-text';

/**
 * Page Object para edição de funcionário (campo de sobrenome).
 */
export class EditEmployeePage extends BasePage {
  private readonly lastNameInput = this.page.locator('input[name="lastName"]');
  private readonly saveButton = this.page.getByRole('button', { name: 'Save' });

  constructor(page: Page) {
    super(page);
  }

  async expectFormVisible(): Promise<void> {
    const last = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.lastName),
      this.lastNameInput,
    ]);
    await expect(last).toBeVisible();
  }

  async updateLastName(lastName: string): Promise<void> {
    const last = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.lastName),
      this.lastNameInput,
    ]);
    await last.fill(lastName);
    await this.submit();
  }

  async submit(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForURL(EMPLOYEE_FORM_REDIRECT_PATTERN, {
      timeout: EMPLOYEE_FORM_REDIRECT_TIMEOUT,
    });
  }
}
