import { expect, Page, Locator } from '@playwright/test';
import { BasePage } from '../../../pages/base.page';
import { ROUTES } from '../../../support/routes';
import { SystemMessages, TestMessages } from '../../../support/messages';
import { Selectors } from '../../../support/selectors';
import { UiText } from '../../../support/ui-text';
import { EMPLOYEE_LIST_READY_TIMEOUT } from '../config/constants';
import { logError } from '../../../support/logger';

/**
 * Page Object para listagem de funcionários no módulo PIM.
 *
 * Encapsula ações de pesquisa, navegação e exclusão na listagem.
 */
export class EmployeeListPage extends BasePage {
  private readonly tableRows = this.page.locator('.oxd-table-body .oxd-table-row');
  private readonly noRecords = this.page
    .locator('.oxd-text--span')
    .filter({ hasText: SystemMessages.noRecordsFound });
  private readonly addButton = this.page.getByRole('button', { name: UiText.labels.addButton });
  private readonly confirmDeleteButton = this.page.getByRole('button', {
    name: UiText.labels.confirmDelete,
  });
  private readonly searchButton = this.page.getByRole('button', {
    name: UiText.labels.searchButton,
  });

  constructor(page: Page) {
    super(page);
  }

  async expectListVisible(): Promise<void> {
    await this.waitForTableOrEmptyState();
  }

  async searchByName(name: string): Promise<void> {
    const input = await this.getEmployeeNameInput();
    await input.fill(name);
    await this.searchButton.click();
    // Nota: espera a listagem estabilizar para evitar leitura parcial da tabela.
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
    // Nota: o OrangeHRM pode mostrar "sem resultado" como tabela vazia ou texto "No Records Found"; validar ambos evita falsos negativos.
    if (rowCount === 0) {
      return;
    }

    await expect(this.noRecords).toBeVisible({ timeout: EMPLOYEE_LIST_READY_TIMEOUT });
  }

  async goToEmployeeList(): Promise<void> {
    await this.goto(ROUTES.pimEmployeeList);
    // Nota: garante que a listagem e o estado de "sem registros" estejam prontos antes de prosseguir com ações que dependem da tabela.
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
    const deleteButton = await this.getDeleteButtonFromFirstRow();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await expect(this.confirmDeleteButton).toBeVisible();
  }

  async clickAddButton(): Promise<void> {
    await this.addButton.click();
  }

  async openEmployeeForEditFromFirstRow(): Promise<void> {
    const editButton = await this.getEditButtonFromFirstRow();
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
    // Nota: aguarda tabela com dados OU mensagem "sem registros"
    try {
      await Promise.any([
        this.tableRows.first().waitFor({ state: 'visible', timeout: EMPLOYEE_LIST_READY_TIMEOUT }),
        this.noRecords.waitFor({ state: 'visible', timeout: EMPLOYEE_LIST_READY_TIMEOUT }),
      ]);
    } catch (err) {
      // Nota: se ambas falharam, registra erro e relança para falhar o teste
      logError(TestMessages.employeeListReadyTimeout(EMPLOYEE_LIST_READY_TIMEOUT));
      throw err;
    }
  }

  private getFirstResultRow() {
    return this.tableRows.first();
  }

  private getActionButtonFromFirstRow(roleNames: string[], fallbackIndex: number) {
    const row = this.getFirstResultRow();
    const locators: Locator[] = roleNames.map((roleName) =>
      row.getByRole('button', { name: roleName }),
    );
    locators.push(row.locator('button').nth(fallbackIndex));
    return this.getBestInput(locators);
  }

  private getEditButtonFromFirstRow() {
    return this.getActionButtonFromFirstRow([UiText.labels.editButton, 'Edit'], 0);
  }

  private getDeleteButtonFromFirstRow() {
    return this.getActionButtonFromFirstRow([UiText.labels.deleteButton, 'Delete'], 1);
  }

  /**
   * Retorna o `Locator` mais apropriado para o campo de busca 'Employee Name'.
   *
   * Prioriza seletores de acessibilidade (role/label), depois placeholder
   * e, como último recurso, o input localizado pelo grupo DOM cujo rótulo
   * contém `Employee Name`.
   *
   * @returns Locator do campo de busca por nome do funcionário.
   */
  private async getEmployeeNameInput(): Promise<Locator> {
    const locators: Locator[] = [
      // Nota: role com nome igual ao rótulo (mais resiliente/semântico)
      this.page.getByRole('textbox', { name: UiText.labels.employeeNameLabel }),
      // Nota: placeholder específico 'Type for hints...'
      this.page.getByPlaceholder(UiText.placeholders.employeeSearch),
      // Nota: input dentro do grupo cujo rótulo contém 'Employee Name' (DOM fallback para desambiguação)
      this.page
        .locator(Selectors.oxdInputGroup, { hasText: UiText.labels.employeeNameLabel })
        .locator(Selectors.inputByPlaceholder(UiText.placeholders.employeeSearch)),
      // Nota: fallback genérico para qualquer textbox
      this.page.getByRole('textbox'),
    ];

    return this.getBestInput(locators);
  }
}
