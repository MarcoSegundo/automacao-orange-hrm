Contribuindo — convenções de automação

Guia rápido para manter padrões de qualidade no projeto de automação.

Seletores

- Prefira seletores acessíveis: `getByRole`, `getByLabel`, `getByPlaceholder` e `data-testid`.
- Evite dependência exclusiva de textos visíveis ou placeholders que podem mudar.
- Centralize textos reutilizados em `src/support/ui-text.ts` (`UiText`) para labels/placeholders visíveis e em `src/support/messages.ts` para mensagens de sistema/teste.

Page Objects

- Page Objects devem encapsular seletores, esperas e ações; evite lógica de negócios nos steps.
- Use o helper `getBestInput` presente em `src/pages/base.page.ts` para centralizar fallbacks.

Fixtures e massa de dados

- Prefira criar/limpar massa via API quando possível; use fallback UI apenas quando necessário.
- Garanta idempotência e limpeza em `After` hooks; implemente retries/backoff nas operações de cleanup.

Execução local

- Instale dependências: `npm ci`
- Formatação: `npm run format`
- Check formatting: `npm run format:check`
- Lint: `npm run lint`
- Rodar BDD (Cucumber): `npm run test:smoke` (smoke) ou `npm run test:bdd` (todas)
- Rodar Playwright Test: `npm run test:playwright`

Nota: após `npm ci` instale os navegadores do Playwright quando necessário:

```bash
npx playwright install --with-deps chromium
```

CI

- Pipeline valida formatação, lint, tipos e executa os testes. Artefatos (relatórios, traces, screenshots)
  são publicados como artefatos do workflow.

Comportamento esperado para PRs

- Rodar `npm run format` e `npm run lint` antes de abrir PR.
- Incluir descrição do impacto em dependências e flakiness quando adicionar novos testes que usam fixtures.

Recomendação de ambiente local:

- Node.js LTS (recomendado: 20.x para compatibilidade com CI).
- Execute `npx playwright install --with-deps chromium` em hosts novos.
