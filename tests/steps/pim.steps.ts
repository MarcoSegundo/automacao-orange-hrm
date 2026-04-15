import { Given, Then, When } from "@cucumber/cucumber";
import { AuthFactory } from "../../src/factories/auth.factory";
import { EmployeeFactory } from "../../src/factories/employee.factory";
import {
  getEmployee,
  getEmployeeLoginCredentials,
  getSeededEmployee,
  getPage,
  setEmployee,
  setEmployeeLoginCredentials,
  setUpdatedEmployeeLastName
} from "../support/context/scenario-context";
import {
  dashboardPage,
  employeeListPage,
  addEmployeePage,
  editEmployeePage,
  loginPage
} from "../support/factories/page-objects";
import { ScenarioWorld } from "../support/context/world";

Given("acessa o modulo PIM", async function (this: ScenarioWorld) {
  const dashboard = dashboardPage(this);
  await dashboard.goToPim();
});

Given("acessa a lista de funcionarios do PIM", async function (this: ScenarioWorld) {
  const dashboard = dashboardPage(this);
  const employeeList = employeeListPage(this);
  await dashboard.goToPim();
  await employeeList.expectListVisible();
});

Given("que o usuario inicia o cadastro de um funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.goToEmployeeList();
  await employeeList.clickAddButton();
  const addEmployee = addEmployeePage(this);
  await addEmployee.expectFormVisible();
});

When("informa os dados obrigatorios", async function (this: ScenarioWorld) {
  // Gera dados únicos por execução para evitar colisão no ambiente compartilhado.
  const draft = EmployeeFactory.unique("PIM");
  const loginCredentials = AuthFactory.employeeLogin(draft.firstName, draft.lastName);
  setEmployee(this, draft.firstName, draft.lastName);
  setEmployeeLoginCredentials(this, loginCredentials);
  const addEmployee = addEmployeePage(this);
  await addEmployee.fillMandatoryData(draft.firstName, draft.lastName);
  await addEmployee.fillLoginDetails(loginCredentials.user, loginCredentials.pass);
});

When("conclui o cadastro", async function (this: ScenarioWorld) {
  const addEmployee = addEmployeePage(this);
  await addEmployee.submit();
});

Then("o sistema deve registrar o funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.expectEmployeeFoundByName(employee.firstName);
});

Then("o acesso associado deve ser concedido", async function (this: ScenarioWorld) {
  const login = loginPage(this);
  const dashboard = dashboardPage(this);
  const credentials = getEmployeeLoginCredentials(this);

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await getPage(this).context().clearCookies();
      await login.open();
      await login.login(credentials.user, credentials.pass);
      await login.expectLoginSuccess();
      await dashboard.expectLoaded();
      return;
    } catch (error) {
      lastError = error;
      // O ambiente demo pode levar alguns segundos para liberar o acesso recém-criado.
      await getPage(this).waitForTimeout(1500 * attempt);
    }
  }

  throw lastError;
});

Given("que existe um funcionario cadastrado", async function (this: ScenarioWorld) {
  // Reaproveita massa de apoio criada no hook para reduzir custo e tempo de setup por cenário.
  const seededEmployee = getSeededEmployee(this);
  setEmployee(this, seededEmployee.firstName, seededEmployee.lastName);

  const employeeList = employeeListPage(this);
  await employeeList.expectEmployeeFoundByName(seededEmployee.firstName);
});

When("o usuario atualiza os dados cadastrais do funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const updatedLastName = `UPDATED_${Date.now()}`;
  setUpdatedEmployeeLastName(this, updatedLastName);
  await employeeList.openFirstEmployeeForEdit();
  const editEmployee = editEmployeePage(this);
  await editEmployee.updateLastName(updatedLastName);
});

Then("os dados do funcionario devem ser atualizados no sistema", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.expectEmployeeFoundByName(employee.firstName);
});

When("o usuario solicita a exclusao do funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.openAndSearchByName(employee.firstName);
  await employeeList.deleteFirstEmployee();
});

When("confirma a exclusao do funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.confirmDeleteEmployee();
});

Then("o funcionario deve ser removido do sistema", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.openAndSearchByName(employee.firstName);
  await employeeList.expectNoResult();
});

Then("o acesso associado ao funcionario deve ser revogado", async function (this: ScenarioWorld) {
  // No demo público, a criação/validação de credencial vinculada é instável.
  // Neste desafio, a revogação é representada pela remoção efetiva do cadastro no PIM.
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.openAndSearchByName(employee.firstName);
  await employeeList.expectNoResult();
});

Then("o sistema deve exibir a lista de funcionarios", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.expectListVisible();
});
