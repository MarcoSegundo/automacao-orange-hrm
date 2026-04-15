import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { SystemMessages } from "../support/messages";

/**
 * Page Object do dashboard.
 * Centraliza ações de navegação de alto nível após login.
 */
export class DashboardPage extends BasePage {
  private readonly topBarHeader = this.page.locator("header .oxd-topbar-header-breadcrumb-module");
  private readonly userDropdown = this.page.locator(".oxd-userdropdown-name");
  private readonly logout = this.page.locator(`a[role="menuitem"]:has-text("${SystemMessages.logoutMenuItem}")`);
  private readonly pimMenu = this.page.locator('a[href*="/pim/viewPimModule"]');
  private readonly menuSearchInput = this.page.locator(`input[placeholder="${SystemMessages.menuSearchPlaceholder}"]`);
  private readonly menuItems = this.page.locator('.oxd-main-menu-item');
  private readonly noMenuRecords = this.page.locator('.oxd-text--span').filter({ hasText: SystemMessages.noRecordsFound });

  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    // Valida que o módulo de dashboard foi carregado antes de seguir o fluxo.
    await expect(this.topBarHeader).toBeVisible();
  }

  async goToPim(): Promise<void> {
    await this.pimMenu.click();
  }

  async logoutNow(): Promise<void> {
    await this.userDropdown.click();
    await this.logout.click();
  }

  async searchMenu(term: string): Promise<void> {
    await this.menuSearchInput.fill(term);
  }

  async expectMenuHasResults(): Promise<void> {
    await expect(this.menuItems.first()).toBeVisible();
  }

  async expectMenuNoResults(): Promise<void> {
    await expect(this.noMenuRecords).toBeVisible();
  }
}
