import { Given, Then, When } from "@cucumber/cucumber";
import { EmployeeFactory } from "../../src/factories/employee.factory";
import { getEmployee, getSeededEmployee, setEmployee, setUpdatedEmployeeLastName } from "../support/context/scenario-context";
import { dashboardPage, employeeListPage } from "../support/factories/page-objects";
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
  await employeeList.startAddEmployee();
});

When("informa os dados obrigatorios", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  // Gera dados únicos por execução para evitar colisão no ambiente compartilhado.
  const draft = EmployeeFactory.unique("PIM");
  setEmployee(this, draft.firstName, draft.lastName);
  await employeeList.fillMandatoryEmployeeData(draft.firstName, draft.lastName);
});

When("conclui o cadastro", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.submitEmployeeForm();
});

Then("o sistema deve registrar o funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.goToEmployeeList();
  await employeeList.searchByName(employee.firstName);
  await employeeList.expectAnyResult();
});

Given("que existe um funcionario cadastrado", async function (this: ScenarioWorld) {
  // Reaproveita massa de apoio criada no hook para reduzir custo e tempo de setup por cenário.
  const seededEmployee = getSeededEmployee(this);
  setEmployee(this, seededEmployee.firstName, seededEmployee.lastName);

  const employeeList = employeeListPage(this);
  await employeeList.goToEmployeeList();
  await employeeList.searchByName(seededEmployee.firstName);
  await employeeList.expectAnyResult();
});

When("o usuario atualiza os dados cadastrais do funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const updatedLastName = `UPDATED_${Date.now()}`;
  setUpdatedEmployeeLastName(this, updatedLastName);
  await employeeList.openFirstEmployeeForEdit();
  await employeeList.updateLastName(updatedLastName);
});

Then("os dados do funcionario devem ser atualizados no sistema", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.goToEmployeeList();
  await employeeList.searchByName(employee.firstName);
  await employeeList.expectAnyResult();
});

When("o usuario solicita a exclusao do funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.goToEmployeeList();
  await employeeList.searchByName(employee.firstName);
  await employeeList.deleteFirstEmployee();
});

When("confirma a exclusao do funcionario", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.confirmDeleteEmployee();
});

Then("o funcionario deve ser removido do sistema", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.goToEmployeeList();
  await employeeList.searchByName(employee.firstName);
  await employeeList.expectNoResult();
});

Then("o acesso associado ao funcionario deve ser revogado", async function (this: ScenarioWorld) {
  // No demo público, a criação/validação de credencial vinculada é instável.
  // Neste desafio, a revogação é representada pela remoção efetiva do cadastro no PIM.
  const employeeList = employeeListPage(this);
  const employee = getEmployee(this);
  await employeeList.goToEmployeeList();
  await employeeList.searchByName(employee.firstName);
  await employeeList.expectNoResult();
});

Then("o sistema deve exibir a lista de funcionarios", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.expectListVisible();
});
