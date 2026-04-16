import { APIRequestContext, APIResponse, BrowserContext, request } from "@playwright/test";
import { env } from "../../../../support/env";
import { TestMessages } from "../../../../support/messages";

const PIM_EMPLOYEES_PATH = "/web/index.php/api/v2/pim/employees";
const ADMIN_USERS_PATH = "/web/index.php/api/v2/admin/users";

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

export class PimApiClient {
  private apiContext?: APIRequestContext;

  constructor(private readonly browserContext: BrowserContext) {}

  async createEmployeeWithUser(firstName: string, lastName: string, username: string, password: string, userRoleId = 2): Promise<{ empNumber: string; username: string; userId: string }> {
    const empJson = await this.postJson<PimEmployeeApiResponse>(PIM_EMPLOYEES_PATH, { firstName, lastName });

    const empNumber = this.extractEmployeeId(empJson);

    const userPayload = { username, password, status: true, userRoleId, empNumber: Number(empNumber) };

    const userJson = await this.postJson<AdminUserApiResponse>(ADMIN_USERS_PATH, userPayload);

    const createdUserId = userJson?.data?.id || userJson?.data?.userId || userJson?.data?.userID;
    const createdUsername = userJson?.data?.userName || userJson?.data?.username;

    if (!createdUserId || !createdUsername) {
      throw new Error(TestMessages.apiCreateMissingId(userJson));
    }

    return { empNumber: String(empNumber), username: createdUsername, userId: String(createdUserId) };
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    const json = await this.deleteJson<PimDeleteApiResponse>(PIM_EMPLOYEES_PATH, { ids: [employeeId] });

    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(TestMessages.apiDeleteUnexpectedBody(json));
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const json = await this.deleteJson<PimDeleteApiResponse>(ADMIN_USERS_PATH, { ids: [userId] });

    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(TestMessages.apiDeleteUnexpectedBody(json));
    }
  }

  async dispose(): Promise<void> {
    await this.apiContext?.dispose();
  }

  private async getApiContext(): Promise<APIRequestContext> {
    if (!this.apiContext) {
      const storageState = await this.browserContext.storageState();
      this.apiContext = await request.newContext({ baseURL: env.baseUrl, extraHTTPHeaders: { "Content-Type": "application/json" }, storageState });
    }

    return this.apiContext;
  }

  /** Envia um POST com retries e backoff exponencial. */
  private async postJson<T>(url: string, data: unknown): Promise<T> {
    const maxRetries = 2;
    const timeoutMs = 60000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await (await this.getApiContext()).post(url, { data, timeout: timeoutMs });
        return this.parseJson<T>(response);
      } catch (err) {
        if (attempt === maxRetries) throw err;
        const backoff = 250 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    throw new Error(TestMessages.apiRequestFailed(0, "unreachable"));
  }

  /** Envia um DELETE com retries e backoff exponencial. */
  private async deleteJson<T>(url: string, data: unknown): Promise<T> {
    const maxRetries = 2;
    const timeoutMs = 60000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await (await this.getApiContext()).delete(url, { data, timeout: timeoutMs });
        return this.parseJson<T>(response);
      } catch (err) {
        if (attempt === maxRetries) throw err;
        const backoff = 250 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }

    throw new Error(TestMessages.apiRequestFailed(0, "unreachable"));
  }

  private async parseJson<T>(response: APIResponse): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(TestMessages.apiRequestFailed(response.status(), body));
    }

    return response.json() as Promise<T>;
  }

  private extractEmployeeId(json: PimEmployeeApiResponse): string {
    const id = json?.data?.empNumber || json?.data?.employeeId || json?.data?.id;
    if (!id) {
      throw new Error(TestMessages.apiCreateMissingId(json));
    }

    return String(id);
  }
}
