import { expect, Page } from "@playwright/test";
import { BasePage } from "../../../pages/base.page";
import { ROUTES } from "../../../support/routes";
import { SystemMessages, TestMessages } from "../../../support/messages";
import { EMPLOYEE_LIST_READY_TIMEOUT } from "../config/constants";
import { logError } from "../../../support/logger";

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
    await this.waitForTableOrEmptyState();
  }

  async searchByName(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
    // Após buscar, espera a listagem estabilizar para evitar leitura parcial da tabela.
    await this.waitForTableOrEmptyState();
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
    await this.waitForTableOrEmptyState();
  }

  async openAndSearchByName(name: string): Promise<void> {
    await this.goToEmployeeList();
    await this.searchByName(name);
  }

  async expectEmployeeFoundByName(name: string): Promise<void> {
    await this.openAndSearchByName(name);
    await this.expectAnyResult();
  }

  async deleteEmployeeFromFirstRow(): Promise<void> {
    const deleteButton = this.getDeleteButtonFromFirstRow();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible();
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click();
  }

  async openEmployeeForEditFromFirstRow(): Promise<void> {
    const editButton = this.getEditButtonFromFirstRow();
    await expect(editButton).toBeVisible();
    await editButton.click();
  }

  async deleteEmployeeFromFirstRowByName(firstName: string): Promise<void> {
    await this.goToEmployeeList();
    await this.searchByName(firstName);

    const rowCount = await this.getRowCount();
    if (rowCount === 0) {
      throw new Error(TestMessages.employeeNotFoundForDelete(firstName));
    }

    await this.deleteEmployeeFromFirstRow();
    await this.confirmDeleteEmployee();
    await this.searchByName(firstName);
    await this.expectNoResult();
  }

  async confirmDeleteEmployee(): Promise<void> {
    await this.confirmDeleteButton.click();
    await this.waitForTableOrEmptyState();
  }

  private async waitForTableOrEmptyState(): Promise<void> {
    // Aguarda tabela com dados OU mensagem "sem registros"
    try {
      await Promise.any([
        this.tableRows.first().waitFor({ state: "visible", timeout: EMPLOYEE_LIST_READY_TIMEOUT }),
        this.noRecords.waitFor({ state: "visible", timeout: EMPLOYEE_LIST_READY_TIMEOUT })
      ]);
    } catch (err) {
      // Se ambas falharam, log de erro com mensagem padrão e relança para falhar o teste
      logError(TestMessages.employeeListReadyTimeout(EMPLOYEE_LIST_READY_TIMEOUT));
      throw err;
    }
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
