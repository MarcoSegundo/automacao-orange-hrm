import {
  DashboardPage,
  EmployeeListPage,
  AddEmployeePage,
  EditEmployeePage,
} from '../../../src/pages';
import { LoginPage } from '../../../src/modules/auth/pages';
import { getPage, getSeededEmployee } from '../context/scenario-context';
import { ScenarioWorld } from '../context/world';

/**
 * Fábricas de Page Objects.
 *
 * Fornece um ponto único para construir Page Objects usando o `ScenarioWorld`.
 * Mantém os steps enxutos e aplica injeção de dependência em vez de instanciar `new Page()` nos steps.
 */
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
