import { TestMessages } from "../../../src/support/messages";
import { ScenarioWorld } from "./world";

export type AuthCredentials = ScenarioWorld["credentials"] extends infer T ? NonNullable<T> : never;

/** Persiste credenciais no contexto do cenário para reutilização entre steps. */
export function setCredentials(world: ScenarioWorld, credentials: AuthCredentials): void {
  world.credentials = credentials;
}

export function setEmployeeLoginCredentials(world: ScenarioWorld, credentials: AuthCredentials): void {
  world.employeeLoginCredentials = credentials;
}

/** Retorna a página ativa do cenário e falha cedo se o setup não foi executado. */
export function getPage(world: ScenarioWorld): NonNullable<ScenarioWorld["page"]> {
  if (!world.page) throw new Error(TestMessages.pageNotInitialized);
  return world.page;
}

/** Limpa apenas o estado transitório entre steps, mantendo recursos de browser no hook. */
export function resetStepContext(world: ScenarioWorld): void {
  world.credentials = undefined;
  world.employeeLoginCredentials = undefined;
  world.employee = undefined;
}

/** Garante credenciais previamente definidas por fixture/step de autenticação. */
export function getCredentials(world: ScenarioWorld): AuthCredentials {
  if (!world.credentials) {
    throw new Error(TestMessages.credentialsNotInitialized);
  }
  return world.credentials;
}

export function getEmployeeLoginCredentials(world: ScenarioWorld): AuthCredentials {
  if (!world.employeeLoginCredentials) {
    throw new Error(TestMessages.employeeLoginCredentialsNotInitialized);
  }
  return world.employeeLoginCredentials;
}

export function setEmployee(world: ScenarioWorld, firstName: string, lastName: string): void {
  world.employee = { firstName, lastName };
}

/** Atualiza o sobrenome esperado para validações pós-edição no mesmo cenário. */
export function setUpdatedEmployeeLastName(world: ScenarioWorld, lastName: string): void {
  if (!world.employee) {
    throw new Error(TestMessages.employeeNotInitialized);
  }
  world.employee.updatedLastName = lastName;
}

/** Lê o funcionário em contexto e evita steps dependentes de estado incompleto. */
export function getEmployee(world: ScenarioWorld): NonNullable<ScenarioWorld["employee"]> {
  if (!world.employee) {
    throw new Error(TestMessages.employeeNotInitialized);
  }
  return world.employee;
}

/** Lê a massa de apoio criada no hook para fluxos de busca/edição/exclusão. */
export function getSeededEmployee(world: ScenarioWorld): NonNullable<ScenarioWorld["seededEmployee"]> {
  if (!world.seededEmployee) {
    throw new Error(TestMessages.seededEmployeeNotInitialized);
  }
  return world.seededEmployee;
}