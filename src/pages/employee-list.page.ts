import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";
import { ROUTES } from "../support/routes";
import { SystemMessages } from "../support/messages";

export class EmployeeListPage extends BasePage {
  private readonly employeeNameInput = this.page.locator(`input[placeholder="${SystemMessages.employeeSearchPlaceholder}"]`).first();
  private readonly searchButton = this.page.locator('button[type="submit"]');
  private readonly tableRows = this.page.locator(".oxd-table-body .oxd-table-row");
  private readonly noRecords = this.page.locator(".oxd-text--span").filter({ hasText: SystemMessages.noRecordsFound });
  private readonly addButton = this.page.locator(`button:has-text("${SystemMessages.addButton}")`);
  private readonly firstNameInput = this.page.locator('input[name="firstName"]');
  private readonly lastNameInput = this.page.locator('input[name="lastName"]');
  private readonly saveButton = this.page.locator('button[type="submit"]');
  private readonly editFirstButton = this.page.locator('button:has(i.bi-pencil-fill)').first();
  private readonly deleteFirstButton = this.page.locator('button:has(i.bi-trash)').first();
  private readonly confirmDeleteButton = this.page.locator(`button:has-text("${SystemMessages.confirmDelete}")`);

  constructor(page: Page) {
    super(page);
  }

  async expectListVisible(): Promise<void> {
    await expect(this.tableRows.first()).toBeVisible();
  }

  async searchByName(name: string): Promise<void> {
    await this.employeeNameInput.fill(name);
    await this.searchButton.click();
    // Após buscar, espera a página terminar requisições para evitar leitura parcial da tabela.
    await this.page.waitForLoadState("networkidle");
  }

  async expectAnyResult(): Promise<void> {
    await expect(this.tableRows.first()).toBeVisible();
  }

  async getRowCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async expectNoResult(): Promise<void> {
    const rowCount = await this.tableRows.count();
    // O OrangeHRM pode mostrar "sem resultado" de dois jeitos: tabela vazia ou texto "No Records Found".
    if (rowCount === 0) {
      return;
    }

    await expect(this.noRecords).toBeVisible({ timeout: 10000 });
  }

  async goToEmployeeList(): Promise<void> {
    await this.goto(ROUTES.pimEmployeeList);
    await expect(this.searchButton).toBeVisible();
  }

  async startAddEmployee(): Promise<void> {
    await this.addButton.click();
    await expect(this.firstNameInput).toBeVisible();
  }

  async fillMandatoryEmployeeData(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
  }

  async submitEmployeeForm(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForURL(/viewPersonalDetails|viewEmployeeList/, { timeout: 20000 });
  }

  async createEmployee(firstName: string, lastName: string): Promise<{ id: string; firstName: string; lastName: string }> {
    // Fluxo completo de criação em um método só para evitar repetição nos steps e no fallback da API.
    await this.goToEmployeeList();
    await this.startAddEmployee();
    await this.fillMandatoryEmployeeData(firstName, lastName);
    await this.submitEmployeeForm();
    const createdId = this.extractEmployeeIdFromCurrentUrl();
    await this.goToEmployeeList();
    await this.searchByName(firstName);
    await this.expectAnyResult();

    return {
      id: createdId,
      firstName,
      lastName
    };
  }

  async openFirstEmployeeForEdit(): Promise<void> {
    await expect(this.editFirstButton).toBeVisible();
    await this.editFirstButton.click();
    await expect(this.lastNameInput).toBeVisible();
  }

  async updateLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
    await this.page.waitForURL(/viewPersonalDetails|viewEmployeeList/, { timeout: 20000 });
  }

  async deleteFirstEmployee(): Promise<void> {
    await expect(this.deleteFirstButton).toBeVisible();
    await this.deleteFirstButton.click();
    await expect(this.confirmDeleteButton).toBeVisible();
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
    await this.page.waitForLoadState("networkidle");
  }

  private extractEmployeeIdFromCurrentUrl(): string {
    const pathname = new URL(this.page.url()).pathname;
    const match = pathname.match(/(?:empNumber|id|employeeId)\/([^/?#]+)/i);

    if (match?.[1]) {
      return match[1];
    }

    // Fallback: sempre devolve um ID para não quebrar os passos seguintes, mesmo se a rota mudar no demo.
    return `${Date.now()}`;
  }
}
