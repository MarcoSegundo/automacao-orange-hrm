import { Given, Then, When } from '@cucumber/cucumber';
import { AuthFactory } from '../../src/modules/auth';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { ROUTES, ROUTE_PATTERNS } from '../../src/support/routes';
import { getCredentials, getPage, setCredentials } from '../support/context/scenario-context';
import { dashboardPage, loginPage } from '../support/factories/page-objects';
import { ScenarioWorld } from '../support/context/world';

Given('que o usuario esta na tela de login', async function (this: ScenarioWorld) {
  const login = loginPage(this);
  await login.open();
});

Given('que o usuario possui credenciais validas', async function (this: ScenarioWorld) {
  setCredentials(this, AuthFactory.validAdmin());
});

Given('que o usuario possui credenciais invalidas', async function (this: ScenarioWorld) {
  setCredentials(this, AuthFactory.invalidCredentials());
});

When('solicita autenticacao', async function (this: ScenarioWorld) {
  const login = loginPage(this);
  const credentials = getCredentials(this);
  await login.login(credentials.user, credentials.pass);
});

Then('o sistema deve conceder acesso ao painel principal', async function (this: ScenarioWorld) {
  const credentials = getCredentials(this);
  await new AuthService(getPage(this)).signIn(credentials.user, credentials.pass);
});

Then('o sistema deve permanecer na tela de login', async function (this: ScenarioWorld) {
  await getPage(this).waitForURL(ROUTE_PATTERNS.authLogin);
});

Then('deve sinalizar credenciais invalidas', async function (this: ScenarioWorld) {
  const login = loginPage(this);
  await login.expectLoginError();
});

Given('que o usuario esta autenticado', async function (this: ScenarioWorld) {
  const login = loginPage(this);
  const dashboard = dashboardPage(this);
  const credentials = AuthFactory.validAdmin();

  await login.open();

  if (ROUTE_PATTERNS.authLogin.test(getPage(this).url())) {
    /**
     * Executa o login e aguarda a página do painel carregar simultaneamente.
     * Evita condição de corrida onde o comando de login poderia completar depois da navegação.
     */
    await Promise.all([
      getPage(this).waitForURL(ROUTE_PATTERNS.dashboard),
      login.login(credentials.user, credentials.pass),
    ]);
  }

  await dashboard.expectLoaded();
});

Given('que o usuario nao possui sessao autenticada', async function (this: ScenarioWorld) {
  // Nota: remove cookies para garantir que o teste esteja sem sessão autenticada.
  await getPage(this).context().clearCookies();
  await getPage(this).goto(ROUTES.authLogin);
});

When('tenta acessar uma area protegida', async function (this: ScenarioWorld) {
  await getPage(this).goto(ROUTES.pimEmployeeList);
});

Then('o sistema deve negar acesso a area protegida', async function (this: ScenarioWorld) {
  await getPage(this).waitForURL(ROUTE_PATTERNS.authLogin);
});
