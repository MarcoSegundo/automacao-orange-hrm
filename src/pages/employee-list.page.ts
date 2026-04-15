import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "../support/routes";
import { SystemMessages } from "../support/messages";
import { EMPLOYEE_LIST_READY_TIMEOUT } from "./page-constants";

export class EmployeeListPage extends BasePage {
  private readonly employeeNameInput = this.page
    .locator(`input[placeholder="${SystemMessages.employeeSearchPlaceholder}"]`)
    .first();
  private readonly tableRows = this.page.locator(".oxd-table-body .oxd-table-row");
  private readonly noRecords = this.page
    .locator(".oxd-text--span")
    .filter({ hasText: SystemMessages.noRecordsFound });
  private readonly addButton = this.page.getByRole("button", { name: SystemMessages.addButton });
  private readonly confirmDeleteButton = this.page.getByRole("button", { name: SystemMessages.confirmDelete });
  private readonly searchButton = this.page.getByRole("button", { name: SystemMessages.searchButton });

  constructor(page: Page) {
    super(page);
  }

  async expectListVisible(): Promise<void> {
    await this.waitForListReady();
  }

  async searchByName(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
    // Após buscar, espera a listagem estabilizar para evitar leitura parcial da tabela.
    await this.waitForSearchToSettle();
  }

  async expectAnyResult(): Promise<void> {
    await expect(this.tableRows.first()).toBeVisible();
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async expectNoResult(): Promise<void> {
    const rowCount = await this.tableRows.count();
    // O OrangeHRM pode mostrar "sem resultado" de dois jeitos: tabela vazia ou
    // texto "No Records Found"; validar ambos evita falsos negativos.
    if (rowCount === 0) {
      return;
    }

    await expect(this.noRecords).toBeVisible({ timeout: EMPLOYEE_LIST_READY_TIMEOUT });
  }

  async goToEmployeeList(): Promise<void> {
    await this.goto(ROUTES.pimEmployeeList);
    // Garante que a listagem e o estado de "sem registros" estejam prontos
    // antes de prosseguir com ações que dependem da tabela.
    await this.waitForListReady();
  }

  async openAndSearchByName(name: string): Promise<void> {
    await this.goToEmployeeList();
    await this.searchByName(name);
  }

  async expectEmployeeFoundByName(name: string): Promise<void> {
    await this.openAndSearchByName(name);
    await this.expectAnyResult();
  }

  async deleteFirstEmployee(): Promise<void> {
    const deleteButton = this.getDeleteButtonFromFirstRow();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible();
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click();
  }

  async openFirstEmployeeForEdit(): Promise<void> {
    const editButton = this.getEditButtonFromFirstRow();
    await expect(editButton).toBeVisible();
    await editButton.click();
  }

  async deleteEmployeeByName(firstName: string): Promise<void> {
    await this.goToEmployeeList();
    await this.searchByName(firstName);

    const rowCount = await this.getRowCount();
    if (rowCount === 0) {
      return;
    }

    await this.deleteFirstEmployee();
    await this.confirmDeleteEmployee();
    await this.searchByName(firstName);
    await this.expectNoResult();
  }

  async confirmDeleteEmployee(): Promise<void> {
    await this.confirmDeleteButton.click();
    await this.waitForSearchToSettle();
  }

  private async waitForListReady(): Promise<void> {
    await this.waitForTableOrEmptyState();
  }

  private async waitForSearchToSettle(): Promise<void> {
    await this.waitForTableOrEmptyState();
  }

  private async waitForTableOrEmptyState(): Promise<void> {
    await this.page
      .waitForFunction(
        () => {
          const rows = document.querySelectorAll(".oxd-table-body .oxd-table-row");
          const emptyState = Array.from(document.querySelectorAll(".oxd-text--span")).some((element) =>
            element.textContent?.includes(SystemMessages.noRecordsFound)
          );

          return rows.length > 0 || emptyState;
        },
        { timeout: EMPLOYEE_LIST_READY_TIMEOUT }
      )
      .catch(() => undefined);
  }

  private getFirstResultRow() {
    return this.tableRows.first();
  }

  private getEditButtonFromFirstRow() {
    return this.getFirstResultRow().locator("button").nth(0);
  }

  private getDeleteButtonFromFirstRow() {
    return this.getFirstResultRow().locator("button").nth(1);
  }
}
