import { BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../auth/pages";
import { AddEmployeePage } from "../pages/add-employee.page";
import { EmployeeListPage } from "../pages/employee-list.page";
import { env } from "../support/env";
import { TestMessages } from "../support/messages";
import { logError, logInfo } from "../support/logger";
import { PimApiClient } from "./pim-api.client";

export type HybridSeed = {
  id: string;
  firstName: string;
  lastName: string;
};

/**
 * Serviço de apoio para preparar e limpar dados do PIM.
 * Tenta API primeiro (mais rápido) e, se falhar, usa UI para o teste continuar estável.
 */
export class HybridPimService {
  private readonly apiClient: PimApiClient;

  constructor(private readonly page: Page, private readonly browserContext: BrowserContext) {
    this.apiClient = new PimApiClient(browserContext);
  }

  async authenticateUi(): Promise<void> {
    logInfo("HybridPimService: UI authentication step executed");
    const loginPage = new LoginPage(this.page);
    await loginPage.open();
    await loginPage.login(env.adminUser, env.adminPass);
    await loginPage.expectLoginSuccess();
  }

  async createSeedEmployee(firstName: string, lastName: string): Promise<HybridSeed> {
    logInfo(`HybridPimService: createSeedEmployee requested (${firstName} ${lastName})`);

    try {
      return await this.apiClient.createEmployee(firstName, lastName);
    } catch (error) {
      // Se a API falhar, cria pela UI para manter o cenário executável.
      logError(TestMessages.hybridApiSeedUnavailable(String(error)));
      return await this.createSeedEmployeeViaUi(firstName, lastName);
    }
  }

  async deleteSeedEmployee(seed: HybridSeed): Promise<void> {
    logInfo(`HybridPimService: deleteSeedEmployee requested (${seed.id})`);

    try {
      await this.apiClient.deleteEmployee(seed.id);
      return;
    } catch (error) {
      // Se a API falhar, remove pela UI para não deixar massa residual.
      logError(TestMessages.hybridApiCleanupUnavailable(String(error)));
      await this.deleteSeedEmployeeViaUi(seed.firstName);
    }
  }

  async dispose(): Promise<void> {
    await this.apiClient.dispose();
  }

  private async createSeedEmployeeViaUi(firstName: string, lastName: string): Promise<HybridSeed> {
    const employeeList = new EmployeeListPage(this.page);
    const addEmployee = new AddEmployeePage(this.page);

    await employeeList.goToEmployeeList();
    await employeeList.clickAddButton();

    return await addEmployee.createEmployee(firstName, lastName);
  }

  private async deleteSeedEmployeeViaUi(firstName: string): Promise<void> {
    const employeeList = new EmployeeListPage(this.page);

    await employeeList.deleteEmployeeByName(firstName);
  }

}
