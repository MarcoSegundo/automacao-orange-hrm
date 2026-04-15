import { Given, Then, When } from "@cucumber/cucumber";
import { AuthFactory } from "../../src/factories/auth.factory";
import { ROUTES, ROUTE_PATTERNS } from "../../src/support/routes";
import { getCredentials, getPage, setCredentials } from "../support/context/scenario-context";
import { dashboardPage, loginPage } from "../support/factories/page-objects";
import { ScenarioWorld } from "../support/context/world";

Given("que o usuario esta na tela de login", async function (this: ScenarioWorld) {
  const login = loginPage(this);
  await login.open();
});

Given("que o usuario possui credenciais validas", async function (this: ScenarioWorld) {
  // Guarda credenciais no contexto para usar no passo de autenticação.
  setCredentials(this, AuthFactory.validAdmin());
});

Given("que o usuario possui credenciais invalidas", async function (this: ScenarioWorld) {
  // Mesmo fluxo de login, mas com dados inválidos para validar o comportamento de erro.
  setCredentials(this, AuthFactory.invalidCredentials());
});

When("solicita autenticacao", async function (this: ScenarioWorld) {
  const login = loginPage(this);
  const credentials = getCredentials(this);
  await login.login(credentials.user, credentials.pass);
});

Then("o sistema deve conceder acesso ao painel principal", async function (this: ScenarioWorld) {
  const login = loginPage(this);
  const dashboard = dashboardPage(this);
  await login.expectLoginSuccess();
  await dashboard.expectLoaded();
});

Then("o sistema deve permanecer na tela de login", async function (this: ScenarioWorld) {
  await getPage(this).waitForURL(ROUTE_PATTERNS.authLogin);
});

Then("deve sinalizar credenciais invalidas", async function (this: ScenarioWorld) {
  const login = loginPage(this);
  await login.expectLoginError();
});

Given("que o usuario esta autenticado", async function (this: ScenarioWorld) {
  const login = loginPage(this);
  const dashboard = dashboardPage(this);
  const credentials = AuthFactory.validAdmin();

  await login.open();

  if (ROUTE_PATTERNS.authLogin.test(getPage(this).url())) {
    // Executa o login e aguarda a página do painel carregar ao mesmo tempo.
    // Esta abordagem evita uma condição de corrida simples: se esperássemos
    // apenas a navegação, o comando de login poderia completar depois.
    await Promise.all([
      getPage(this).waitForURL(ROUTE_PATTERNS.dashboard),
      login.login(credentials.user, credentials.pass)
    ]);
  }

  await dashboard.expectLoaded();
});

Given("que o usuario nao possui sessao autenticada", async function (this: ScenarioWorld) {
  // Remove cookies para garantir que o teste realmente está sem sessão autenticada.
  await getPage(this).context().clearCookies();
  await getPage(this).goto(ROUTES.authLogin);
});

When("tenta acessar uma area protegida", async function (this: ScenarioWorld) {
  await getPage(this).goto(ROUTES.pimEmployeeList);
});

Then("o sistema deve negar acesso a area protegida", async function (this: ScenarioWorld) {
  await getPage(this).waitForURL(ROUTE_PATTERNS.authLogin);
});
