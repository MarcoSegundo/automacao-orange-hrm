import { Given, Then, When } from "@cucumber/cucumber";
import { employeeListPage, requireSeededEmployeeFirstName } from "../support/factories/page-objects";
import { ScenarioWorld } from "../support/context/world";

Given("que existe um funcionario correspondente na base", async function (this: ScenarioWorld) {
  // Falha cedo se a massa de apoio não foi preparada no hook.
  requireSeededEmployeeFirstName(this);
});

When("o usuario busca por nome", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  // Busca pelo nome da massa de apoio para validar o comportamento funcional da listagem.
  await employeeList.searchByName(requireSeededEmployeeFirstName(this));
});

Then("o sistema deve retornar um resultado correspondente", async function (this: ScenarioWorld) {
  const employeeList = employeeListPage(this);
  await employeeList.expectAnyResult();
});
