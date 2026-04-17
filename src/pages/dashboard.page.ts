import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { SystemMessages } from '../support/messages';
import { Selectors } from '../support/selectors';
import { UiText } from '../support/ui-text';

/**
 * Page Object do dashboard.
 * Centraliza ações de navegação de alto nível após login.
 */
export class DashboardPage extends BasePage {
  private readonly topBarHeader = this.page.locator('header .oxd-topbar-header-breadcrumb-module');
  private readonly userDropdown = this.page.locator('.oxd-userdropdown-name');
  private readonly logout = this.page.getByRole('menuitem', {
    name: UiText.labels.logoutMenuItem,
  });
  private readonly pimMenu = this.page.locator('a[href*="/pim/viewPimModule"]');
  // Nota: seletor do input de busca do menu
  private readonly menuSearchInput = this.page.locator(
    Selectors.inputByPlaceholder(UiText.placeholders.menuSearch),
  );
  private readonly menuItems = this.page.locator('.oxd-main-menu-item');
  private readonly noMenuRecords = this.page
    .locator('.oxd-text--span')
    .filter({ hasText: SystemMessages.noRecordsFound });

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.topBarHeader).toBeVisible();
  }

  async goToPim(): Promise<void> {
    await this.pimMenu.click();
  }

  async logoutNow(): Promise<void> {
    await this.userDropdown.click();
    await this.clickWithRetries(this.logout, { attempts: 3, visibleTimeout: 5000 });
  }

  async searchMenu(term: string): Promise<void> {
    const input = await this.getBestInput([
      this.page.getByPlaceholder(UiText.placeholders.menuSearch),
      this.menuSearchInput,
    ]);

    await input.fill(term);
  }

  async expectMenuHasResults(): Promise<void> {
    await expect(this.menuItems.first()).toBeVisible();
  }

  async expectMenuNoResults(): Promise<void> {
    await expect(this.noMenuRecords).toBeVisible();
  }
}
