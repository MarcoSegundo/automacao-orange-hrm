import { DashboardPage, EmployeeListPage, AddEmployeePage, EditEmployeePage } from "../../../src/pages";
import { LoginPage } from "../../../src/auth/pages";
import { getPage, getSeededEmployee } from "../context/scenario-context";
import { ScenarioWorld } from "../context/world";

// Ponto único de construção de Page Objects para manter os steps enxutos e consistentes.
// Referência técnica: Dependency Injection (injeção de dependência) via ScenarioWorld.
// Em vez de criar `new Page()` em cada step, usamos a dependência já preparada no contexto.
export function loginPage(world: ScenarioWorld): LoginPage {
  return new LoginPage(getPage(world));
}

export function dashboardPage(world: ScenarioWorld): DashboardPage {
  return new DashboardPage(getPage(world));
}

export function employeeListPage(world: ScenarioWorld): EmployeeListPage {
  return new EmployeeListPage(getPage(world));
}

export function addEmployeePage(world: ScenarioWorld): AddEmployeePage {
  return new AddEmployeePage(getPage(world));
}

export function editEmployeePage(world: ScenarioWorld): EditEmployeePage {
  return new EditEmployeePage(getPage(world));
}

export function requireSeededEmployeeFirstName(world: ScenarioWorld): string {
  return getSeededEmployee(world).firstName;
}