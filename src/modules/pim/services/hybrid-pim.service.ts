import { BrowserContext, Page } from "@playwright/test";
import { AuthService } from "../../auth/services/auth.service";
import { AuthFactory } from "../../auth";
import { AddEmployeePage, EmployeeListPage } from "../pages";
import { env } from "../../../support/env";
import { TestMessages } from "../../../support/messages";
import { logError, logInfo } from "../../../support/logger";
import { PimApiClient } from "../infra/clients/pim-api.client";

export type HybridSeed = {
  id: string;
  firstName: string;
  lastName: string;
  userId?: string;
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
    // Usa AuthService para orquestrar login + validação do dashboard.
    const auth = new AuthService(this.page);
    await auth.signIn(env.adminUser, env.adminPass);
    logInfo("HybridPimService: autenticação via UI realizada");
  }

  /**
   * Cria employee via API e também cria um usuário associado com credenciais
   * geradas por `AuthFactory.employeeLogin`. Retorna o seed e as credenciais
   * para uso local no cenário.
   */
  async createSeedEmployeeWithUser(firstName: string, lastName: string): Promise<{ seed: HybridSeed; credentials: { user: string; pass: string } }> {
    logInfo(`HybridPimService: solicitada criação de seed (${firstName} ${lastName})`);

    const creds = AuthFactory.employeeLogin(firstName, lastName);

    // Tenta criar via API; em caso de erro, cria pela UI. Retorna seed e credenciais.
    try {
      const res = await this.apiClient.createEmployeeWithUser(firstName, lastName, creds.user, creds.pass);
      const seed: HybridSeed = { id: res.empNumber, firstName, lastName, userId: res.userId };
      return {
        seed,
        credentials: { user: creds.user, pass: creds.pass }
      };
    } catch (error) {
      // Loga o motivo para diagnóstico e tenta criar via fluxo de UI.
      logError(TestMessages.hybridApiSeedUnavailable(String(error)));
      const seed = await this.createSeedEmployeeViaUi(firstName, lastName, creds);
      return { seed, credentials: creds };
    }
  }

  async deleteSeedEmployee(seed: HybridSeed): Promise<void> {
    logInfo(`HybridPimService: solicitada exclusão de seed (${seed.id})`);

    // Ao limpar: tenta excluir o usuário (se houver) e depois o funcionário; se falhar, faz pelo UI.
    try {
      const userId = seed.userId;
      if (userId) {
        await this.apiClient.deleteUser(userId);
      }

      await this.apiClient.deleteEmployee(seed.id);
      return;
    } catch (error) {
      logError(TestMessages.hybridApiCleanupUnavailable(String(error)));
      await this.deleteSeedEmployeeViaUi(seed.firstName);
    }
  }

  async dispose(): Promise<void> {
    await this.apiClient.dispose();
  }

  async createSeedEmployeeViaUi(firstName: string, lastName: string, loginCredentials?: { user: string; pass: string }): Promise<HybridSeed> {
    const employeeList = new EmployeeListPage(this.page);
    const addEmployee = new AddEmployeePage(this.page);

    await employeeList.goToEmployeeList();
    await employeeList.clickAddButton();

    if (loginCredentials) {
      await addEmployee.fillMandatoryData(firstName, lastName);
      await addEmployee.fillLoginDetails(loginCredentials.user, loginCredentials.pass);
      await addEmployee.submit();
      return {
        id: addEmployee.getCreatedEmployeeId(),
        firstName,
        lastName
      };
    } else {
      return await addEmployee.createEmployee(firstName, lastName);
    }
  }

  private async deleteSeedEmployeeViaUi(firstName: string): Promise<void> {
    const employeeList = new EmployeeListPage(this.page);

    await employeeList.deleteEmployeeFromFirstRowByName(firstName);
  }

}
