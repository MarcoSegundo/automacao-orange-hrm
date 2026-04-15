import { APIRequestContext, APIResponse, BrowserContext, request } from "@playwright/test";
import { env } from "../support/env";
import { TestMessages } from "../support/messages";

const PIM_EMPLOYEES_PATH = "/web/index.php/api/v2/pim/employees";

export type PimEmployeeSeed = {
  id: string;
  firstName: string;
  lastName: string;
};

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

export class PimApiClient {
  private apiContext?: APIRequestContext;

  constructor(private readonly browserContext: BrowserContext) {}

  async createEmployee(firstName: string, lastName: string): Promise<PimEmployeeSeed> {
    const json = await this.postJson<PimEmployeeApiResponse>(PIM_EMPLOYEES_PATH, {
      firstName,
      lastName
    });

    return {
      id: this.extractEmployeeId(json),
      firstName,
      lastName
    };
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    const json = await this.deleteJson<PimDeleteApiResponse>(PIM_EMPLOYEES_PATH, {
      ids: [employeeId]
    });

    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(TestMessages.apiDeleteUnexpectedBody(json));
    }
  }

  async dispose(): Promise<void> {
    await this.apiContext?.dispose();
  }

  private async getApiContext(): Promise<APIRequestContext> {
    if (!this.apiContext) {
      // Reaproveita a sessão autenticada da UI para a API agir como o mesmo usuário logado.
      const storageState = await this.browserContext.storageState();
      this.apiContext = await request.newContext({
        baseURL: env.baseUrl,
        extraHTTPHeaders: { "Content-Type": "application/json" },
        storageState
      });
    }

    return this.apiContext;
  }

  private async postJson<T>(url: string, data: unknown): Promise<T> {
    const response = await (await this.getApiContext()).post(url, { data });
    return this.parseJson<T>(response);
  }

  private async deleteJson<T>(url: string, data: unknown): Promise<T> {
    const response = await (await this.getApiContext()).delete(url, { data });
    return this.parseJson<T>(response);
  }

  private async parseJson<T>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(TestMessages.apiRequestFailed(response.status(), body));
    }

    return response.json() as Promise<T>;
  }

  private extractEmployeeId(json: PimEmployeeApiResponse): string {
    // O retorno do endpoint varia entre ambientes/versões; por isso tenta mais de uma chave.
    const id = json?.data?.empNumber || json?.data?.employeeId || json?.data?.id;
    if (!id) {
      throw new Error(TestMessages.apiCreateMissingId(json));
    }

    return String(id);
  }
}