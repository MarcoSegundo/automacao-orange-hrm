import { BrowserContext, Page } from '@playwright/test';
import { AuthService, IAuthService } from '../../auth/services/auth.service';
import { AuthFactory } from '../../auth';
import { AddEmployeePage, EmployeeListPage } from '../pages';
import { env } from '../../../support/env';
import { TestMessages, DebugMessages } from '../../../support/messages';
import { logError, logInfo, logDebug } from '../../../support/logger';
import { PimApiClient, IPimApiClient } from '../infra/clients/pim-api.client';
import { retryWithBackoff } from '../../../support/retry';

export type HybridSeed = {
  id: string;
  firstName: string;
  lastName: string;
  userId?: string;
};

export interface IHybridPimService {
  authenticateUi(authService?: IAuthService): Promise<void>;
  createSeedEmployeeWithUser(
    firstName: string,
    lastName: string,
  ): Promise<{ seed: HybridSeed; credentials: { user: string; pass: string } }>;
  deleteSeedEmployee(seed: HybridSeed): Promise<void>;
  createSeedEmployeeViaUi(
    firstName: string,
    lastName: string,
    loginCredentials?: { user: string; pass: string },
  ): Promise<HybridSeed>;
  dispose(): Promise<void>;
}

/**
 * Serviço de apoio para preparar e limpar dados do PIM.
 * Tenta API primeiro (mais rápido) e, se falhar, usa UI para o teste continuar estável.
 */
export class HybridPimService implements IHybridPimService {
  private readonly apiClient: IPimApiClient;

  constructor(
    private readonly page: Page,
    private readonly browserContext: BrowserContext,
    apiClient?: IPimApiClient,
  ) {
    this.apiClient = apiClient ?? new PimApiClient(browserContext);
  }

  /**
   * Autentica via UI usando `AuthService`.
   *
   * Método auxiliar usado pelos fluxos de seed/cleanup que precisam de sessão
   * autenticada compartilhada entre UI e chamadas API.
   *
   * @throws {Error} caso a autenticação via UI falhe
   */
  async authenticateUi(authService?: IAuthService): Promise<void> {
    const auth = authService ?? new AuthService(this.page);
    await auth.signIn(env.adminUser, env.adminPass);
    logInfo(TestMessages.hybridAuthUiSuccess);
  }

  /**
   * Tenta criar um employee + usuário associado via API; caso a API falhe,
   * realiza o mesmo fluxo via UI como fallback.
   *
   * @param firstName - primeiro nome do funcionário
   * @param lastName - sobrenome do funcionário
   * @returns objeto com `seed` (identificador e nomes) e `credentials` (user/pass)
   */
  async createSeedEmployeeWithUser(
    firstName: string,
    lastName: string,
  ): Promise<{ seed: HybridSeed; credentials: { user: string; pass: string } }> {
    logDebug(DebugMessages.hybridSeedCreationRequested(firstName, lastName));

    const creds = AuthFactory.employeeLogin(firstName, lastName);

    try {
      const res = await this.apiClient.createEmployeeWithUser(
        firstName,
        lastName,
        creds.user,
        creds.pass,
      );
      const seed: HybridSeed = { id: res.empNumber, firstName, lastName, userId: res.userId };
      return {
        seed,
        credentials: { user: creds.user, pass: creds.pass },
      };
    } catch (error) {
      logError(TestMessages.hybridApiSeedUnavailable(String(error)));
      const seed = await this.createSeedEmployeeViaUi(firstName, lastName, creds);
      return { seed, credentials: creds };
    }
  }

  /**
   * Remove um seed (employee + usuário) tentando via API com retries/backoff.
   * Caso a API permaneça indisponível, usa o fallback via UI. Lança erro se
   * todas as estratégias falharem.
   *
   * @param seed - objeto `HybridSeed` contendo identificadores do recurso
   * @throws {unknown} último erro ocorrido quando todas as estratégias falham
   */
  async deleteSeedEmployee(seed: HybridSeed): Promise<void> {
    logDebug(DebugMessages.hybridSeedDeletionRequested(seed.id));

    const maxAttempts = 3;

    try {
      await retryWithBackoff(
        async () => {
          const userId = seed.userId;
          if (userId) {
            await this.apiClient.deleteUser(userId);
          }

          await this.apiClient.deleteEmployee(seed.id);
        },
        maxAttempts,
        500,
        (attempt, err) => {
          logError(TestMessages.hybridApiCleanupUnavailable(String(err)));
          logDebug(DebugMessages.hybridApiAttemptFailure(attempt, String(err)));
        },
      );

      logInfo(TestMessages.hybridSeedDeletedViaApi(seed.id));
      return;
    } catch (err) {
      // tentativa via API falhou após retries — fallback UI
      logDebug(DebugMessages.hybridApiAttemptFailure(maxAttempts, String(err)));
    }

    try {
      await this.deleteSeedEmployeeViaUi(seed.firstName);
      logInfo(TestMessages.hybridSeedDeletedViaUi(seed.firstName));
      return;
    } catch (uiErr) {
      logError(TestMessages.hybridFallbackUiFailed(String(uiErr)));
      logDebug(DebugMessages.hybridApiAttemptFailure(maxAttempts + 1, String(uiErr)));
      throw uiErr;
    }
  }

  /**
   * Fecha recursos do serviço (ex.: client API) para liberar conexões.
   */
  async dispose(): Promise<void> {
    await this.apiClient.dispose();
  }

  /**
   * Cria um employee via fluxo de UI (usado como fallback quando a API falha).
   * Retorna o `HybridSeed` criado.
   *
   * @param firstName - primeiro nome
   * @param lastName - sobrenome
   * @param loginCredentials - credenciais opcionais para criar usuário
   */
  async createSeedEmployeeViaUi(
    firstName: string,
    lastName: string,
    loginCredentials?: { user: string; pass: string },
  ): Promise<HybridSeed> {
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
        lastName,
      };
    } else {
      return await addEmployee.createEmployee(firstName, lastName);
    }
  }

  /**
   * Fallback UI: encontra e exclui o primeiro funcionário cujo nome contenha
   * `firstName`. Método privado usado apenas como último recurso.
   *
   * @param firstName - primeiro nome do funcionário a ser excluído
   * @private
   */
  private async deleteSeedEmployeeViaUi(firstName: string): Promise<void> {
    const employeeList = new EmployeeListPage(this.page);

    await employeeList.deleteEmployeeFromFirstRowByName(firstName);
  }
}
