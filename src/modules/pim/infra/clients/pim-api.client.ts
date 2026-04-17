import { APIRequestContext, APIResponse, BrowserContext, request } from '@playwright/test';
import { env } from '../../../../support/env';
import { TestMessages } from '../../../../support/messages';
import { retryWithBackoff } from '../../../../support/retry';

const PIM_EMPLOYEES_PATH = '/web/index.php/api/v2/pim/employees';
const ADMIN_USERS_PATH = '/web/index.php/api/v2/admin/users';

type PimEmployeeApiResponse = {
  data?: {
    empNumber?: string;
    employeeId?: string;
    id?: string;
  };
};

type PimDeleteApiResponse = {
  data?: string[];
};

type AdminUserApiResponse = {
  data?: {
    id?: string;
    userId?: string;
    userID?: string;
    userName?: string;
    username?: string;
  };
};

export interface IPimApiClient {
  createEmployeeWithUser(
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    userRoleId?: number,
  ): Promise<{ empNumber: string; username: string; userId: string }>;
  deleteEmployee(employeeId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  dispose(): Promise<void>;
}

export class PimApiClient implements IPimApiClient {
  private apiContext?: APIRequestContext;

  constructor(private readonly browserContext: BrowserContext) {}
  /**
   * Cria um employee via API e um usuário administrativo associado.
   *
   * @param firstName - primeiro nome
   * @param lastName - sobrenome
   * @param username - nome do usuário a ser criado
   * @param password - senha do usuário
   * @param userRoleId - id do papel do usuário (padrão: 2)
   * @returns informações do employee e usuário criado
   * @throws {Error} quando a API retornar corpo inesperado ou faltar dados
   */
  async createEmployeeWithUser(
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    userRoleId = 2,
  ): Promise<{ empNumber: string; username: string; userId: string }> {
    const empJson = await this.postJson<PimEmployeeApiResponse>(PIM_EMPLOYEES_PATH, {
      firstName,
      lastName,
    });

    const empNumber = this.extractEmployeeId(empJson);

    const userPayload = {
      username,
      password,
      status: true,
      userRoleId,
      empNumber: Number(empNumber),
    };

    const userJson = await this.postJson<AdminUserApiResponse>(ADMIN_USERS_PATH, userPayload);

    const createdUserId = userJson?.data?.id || userJson?.data?.userId || userJson?.data?.userID;
    const createdUsername = userJson?.data?.userName || userJson?.data?.username;

    if (!createdUserId || !createdUsername) {
      throw new Error(TestMessages.apiCreateMissingId(userJson));
    }

    return {
      empNumber: String(empNumber),
      username: createdUsername,
      userId: String(createdUserId),
    };
  }

  /**
   * Exclui um employee via API.
   * @param employeeId - id do employee a ser excluído
   * @throws {Error} se a API retornar corpo inesperado
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    const json = await this.deleteJson<PimDeleteApiResponse>(PIM_EMPLOYEES_PATH, {
      ids: [employeeId],
    });

    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(TestMessages.apiDeleteUnexpectedBody(json));
    }
  }

  /**
   * Exclui um usuário administrativo via API.
   * @param userId - id do usuário a ser excluído
   * @throws {Error} se a API retornar corpo inesperado
   */
  async deleteUser(userId: string): Promise<void> {
    const json = await this.deleteJson<PimDeleteApiResponse>(ADMIN_USERS_PATH, { ids: [userId] });

    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(TestMessages.apiDeleteUnexpectedBody(json));
    }
  }

  /**
   * Dispose do contexto de requisição (fecha conexões internas).
   */
  async dispose(): Promise<void> {
    await this.apiContext?.dispose();
  }

  /**
   * Inicializa ou retorna o `APIRequestContext` vinculado ao `BrowserContext`.
   * @private
   */
  private async getApiContext(): Promise<APIRequestContext> {
    if (!this.apiContext) {
      const storageState = await this.browserContext.storageState();
      this.apiContext = await request.newContext({
        baseURL: env.baseUrl,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
        storageState,
      });
    }

    return this.apiContext;
  }

  /**
   * Envia um POST com retries e backoff exponencial.
   * @private
   */
  private async postJson<T>(url: string, data: unknown): Promise<T> {
    const maxRetries = 2;
    const timeoutMs = 60000;

    try {
      return await retryWithBackoff(
        async () => {
          const response = await (
            await this.getApiContext()
          ).post(url, { data, timeout: timeoutMs });
          return this.parseJson<T>(response);
        },
        maxRetries + 1,
        250,
      );
    } catch (err) {
      const wrappedError = new Error(TestMessages.apiRequestFailed(0, String(err)));
      (wrappedError as Error & { cause?: unknown }).cause = err;
      throw wrappedError;
    }
  }

  /**
   * Envia um DELETE com retries e backoff exponencial.
   * @private
   */
  private async deleteJson<T>(url: string, data: unknown): Promise<T> {
    const maxRetries = 2;
    const timeoutMs = 60000;

    try {
      return await retryWithBackoff(
        async () => {
          const response = await (
            await this.getApiContext()
          ).delete(url, { data, timeout: timeoutMs });
          return this.parseJson<T>(response);
        },
        maxRetries + 1,
        250,
      );
    } catch (err) {
      const wrappedError = new Error(TestMessages.apiRequestFailed(0, String(err)));
      (wrappedError as Error & { cause?: unknown }).cause = err;
      throw wrappedError;
    }
  }

  /**
   * Converte `APIResponse` para JSON e valida status HTTP.
   * @private
   */
  private async parseJson<T>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(TestMessages.apiRequestFailed(response.status(), body));
    }

    return response.json() as Promise<T>;
  }

  /**
   * Extrai o identificador do employee a partir do payload retornado pela API.
   * @private
   */
  private extractEmployeeId(json: PimEmployeeApiResponse): string {
    const id = json?.data?.empNumber || json?.data?.employeeId || json?.data?.id;
    if (!id) {
      throw new Error(TestMessages.apiCreateMissingId(json));
    }

    return String(id);
  }
}
