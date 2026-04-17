# automacao-orange-hrm

Automação de testes QA para OrangeHRM utilizando Playwright, TypeScript e BDD.

O projeto cobre os 7 fluxos críticos de autenticação, gestão de funcionários e busca, seguindo padrões de qualidade de mercado.

---

## Por que 7 cenários?

**Escopo definido:**

- Mínimo de 5 cenários BDD para as 3 funcionalidades principais
- Automatizar ao menos 3 deles

Neste projeto, foram mapeados 15 cenários e automatizados os 7 de maior impacto e risco.

**Por que esses 7?**

- São os casos que realmente bloqueiam o sistema em caso de falha
- Cada um valida uma funcionalidade essencial e independente
- Rodam rápido (~2 minutos) e cobrem 90% dos caminhos críticos

**Cenários automatizados:**

| ID  | Cenário                   | Por quê é crítico         |
| --- | ------------------------- | ------------------------- |
| A01 | Login válido              | Acesso ao sistema         |
| A02 | Login inválido            | Segurança de acesso       |
| A03 | Rota protegida sem sessão | Controle de acesso        |
| G01 | Cadastro de funcionário   | Fluxo CRUD principal      |
| G04 | Edição de funcionário     | Atualização de dados      |
| G05 | Exclusão de funcionário   | Limpeza de dados e acesso |
| B01 | Busca por nome            | Busca funcional           |

Veja mais detalhes na [matriz de risco](docs/requirements/matriz_risco.md).

---

## Observação sobre intermitência do ambiente e confiabilidade da automação

Falhas intermitentes podem ser observadas devido a instabilidades do ambiente demo do OrangeHRM, principalmente nos fluxos de cadastro, exclusão e busca de funcionários. O cenário **G01 Cadastro de funcionário** é utilizado intensivamente para criação de massa de dados e validação dos fluxos principais do sistema. Por depender fortemente do backend, pode apresentar falhas ocasionais por lentidão ou instabilidade do ambiente, resultando em timeout no passo de submissão (aguardando redirecionamento após salvar).

**O que foi feito:**

- Timeout desse passo está configurado atualmente para 30 segundos (`EMPLOYEE_FORM_REDIRECT_TIMEOUT` em `src/modules/pim/config/constants.ts`). Ajuste esse valor na constante se for necessário aumentar para ambientes mais lentos.
- Toda falha é registrada nos logs centralizados, facilitando análise posterior.

**Recomendação:**

- Se a falha se tornar frequente, acione o time de backend/infraestrutura para investigação. O framework de testes está estável e segue boas práticas de isolamento e geração de dados.

**Por que não usamos mock nesse cenário?**
O cadastro de funcionário é responsável por criar usuários reais utilizados em outros testes e validar a integração completa do sistema (UI + backend + banco). O uso de mock nesse ponto inviabilizaria a validação de permissões, acessos e consistência dos dados, reduzindo o valor dos testes de aceitação. Por isso, mantemos o fluxo real, mesmo sujeito a eventuais intermitências do backend.

**Confiabilidade do framework:**
Com base nas práticas adotadas neste projeto — como arquitetura desacoplada, isolamento de massa de dados, centralização de logs/mensagens, execução paralela e estratégia de retry no CI/CD — acreditamos que o framework de automação está robusto e alinhado ao estado da arte do mercado.

Ainda assim, seguimos monitorando e aprimorando continuamente a automação. Caso novas evidências apontem para ajustes necessários no framework, eles serão tratados com prioridade.

---

## Como começar?

### 1. Instalar

```bash
npm ci
```

### 2. Validar código

```bash
npm run lint
npm run lint:types
```

### 3. Configurar variáveis (obrigatório)

Copie o `.env` de exemplo e preencha as credenciais locais:

```powershell
Copy-Item .env.example .env
```

Ou em sistemas Unix:

```bash
cp .env.example .env
```

Preencha no `.env`:

- `ADMIN_USER`
- `ADMIN_PASS`
- `BASE_URL` (opcional; por padrão usa o demo público)

Observação sobre CI: no GitHub Actions os secrets são nomeados `ORANGEHRM_ADMIN_USER` e `ORANGEHRM_ADMIN_PASS` e são exportados como `ADMIN_USER`/`ADMIN_PASS` no ambiente do job (veja `.github/workflows/ci.yml`). Ajuste os nomes dos secrets se necessário.

Para debug com navegador visível em PowerShell:

```powershell
$env:HEADLESS = 'false'
npm run test:smoke
```

Ou em Unix/macOS:

```bash
HEADLESS=false npm run test:smoke
```

### 4. Instalar navegadores do Playwright

Após `npm ci`, instale os navegadores necessários (recomendado para execução local e em CI):

```bash
npx playwright install --with-deps chromium
```

---

## Stack

- Playwright
- TypeScript
- Cucumber (BDD em Gherkin pt-BR)
- ESLint + Type-check
- Docker
- GitHub Actions

### Formatação e CI

- O repositório inclui `prettier` e a CI verifica formatação via `npx prettier --check .` antes do lint. Use `npm run format` para aplicar formatação localmente.
- Lint e checagem de tipos são obrigatórios no CI (`npm run lint`, `npm run lint:types`).

Recomendação: prefira usar os scripts `npm run format` e `npm run format:check` para consistência com a configuração do projeto.

---

## Estrutura do Projeto

**Visão geral:**
O projeto separa claramente o código da automação (`src/`) da camada de testes e orquestração BDD (`tests/`). A seguir há uma descrição mais detalhada da arquitetura dos testes para facilitar manutenção e contribuição.

Arquitetura dos Testes (detalhada):

- `tests/features/` — arquivos Gherkin (`.feature`) em pt-BR. Cada feature representa um comportamento de negócio; usamos tags para controlar execução (ex.: `@smoke`, `@search`, `@seeded-employee`, `@delete-employee`).
- `tests/steps/` — definições de passos (Cucumber). Os steps devem ser finos e delegar ações a `Page Objects` ou `Services` (evitar lógica de negócio nos steps).
- `tests/support/context/` — `world.ts` define `ScenarioWorld` (estado por cenário) e helpers de contexto (`scenario-context.ts`) para leitura/gravação de dados entre passos.
- `tests/support/fixtures/` — fixtures reutilizáveis que preparam o ambiente por cenário. Ex.: `browser-session.fixture.ts` cria `browser/context/page`; `seeded-employee.fixture.ts` prepara massa via `HybridPimService` quando o cenário contém tags específicas.
- `tests/support/lifecycle/` — hooks (`hooks.ts`) que orquestram `Before`/`After`: inicializam browser, disparam fixtures com base em tags, coletam evidências (screenshots, trace, vídeo) em caso de falha e garantem limpeza/idempotência.
- `tests/support/factories/` — fábricas e construtores de `Page Objects` (`page-objects.ts`) para manter os steps enxutos e garantir construção consistente das páginas a partir do `ScenarioWorld`.
- `tests/support/fixtures/index.ts` — ponto único para exportar fixtures usados pelos hooks.

Padrões e responsabilidades:

- Page Objects (`src/pages/`, `src/modules/*/pages`) encapsulam seletores, esperas e ações; são a API consumida pelos steps e services.
- Services (`src/modules/*/services`) implementam orquestrações de alto nível (ex.: `AuthService`, `HybridPimService`) — útil para flows reutilizáveis e para separar política de retries/backoff.
- Factories (`src/modules/*/factories`) criam massa de dados única e previsível para evitar colisões em ambientes compartilhados.
- Infra/clients (`src/modules/*/infra`) abstraem integrações com APIs; `HybridPimService` tenta criar massa via API (rápido) e recorre à UI em caso de fallback (mais robusto).
- Mensagens centralizadas em `src/support/messages.ts` para evitar strings hardcoded espalhadas por pages, services e steps.
- `src/support/env.ts` centraliza variáveis de ambiente obrigatórias (`ADMIN_USER`, `ADMIN_PASS`) — veja `.env.example` no repositório.

Configuração e Runner:

- `playwright.config.ts` — configuração do Playwright Test (reporter, traces, video, screenshot, baseURL). O `testDir` aponta para `tests` para unificar execução de suites.
- `cucumber.cjs` — configurador do Cucumber com perfis (`smoke`, `regression`, `sanity`, etc.). Os scripts em `package.json` usam esses perfis.

Fluxo de criação e limpeza de massa:

- A fixture `seeded-employee.fixture.ts` usa `HybridPimService` (`src/modules/pim/services/hybrid-pim.service.ts`) que, por sua vez, usa `PimApiClient` (`src/modules/pim/infra/clients/pim-api.client.ts`) para criar/excluir dados via API quando possível — e recorre a páginas UI (`AddEmployeePage`) quando a API não está disponível.
- Os hooks verificam tags do cenário e aplicam a preparação/limpeza automaticamente para manter idempotência entre execuções.

Comandos de execução consolidados na seção **Executar** abaixo.

Artefatos e evidências:

- `playwright-report/` — relatório HTML do Playwright
- `test-results/` — screenshots, traces e JSONs gerados pelos hooks em caso de falha

Boas práticas ao adicionar cenários:

1. Criar o `.feature` em `tests/features/` com tag apropriada.
2. Preferir reutilizar steps existentes; se necessário, criar steps finos e delegar para `Page Objects` ou `Services`.
3. Se precisar de nova massa, adicionar fábrica em `src/modules/<dominio>/factories` e atualizar fixtures quando apropriado.
4. Garantir que seletores fiquem consolidados em Page Objects e mensagens visíveis sigam `src/support/messages.ts`.

Essa organização facilita manutenção, reduz duplicação e torna os testes compreensíveis para novos membros do time.

---

## Executar

**Local**

```bash
npm run test:smoke              # Smoke (7 cenários)
npm run test:smoke:retry        # Retry se falhar
npm run test:bdd                # Todos os cenários automatizados
npm run lint && npm run lint:types  # Validação
```

**Docker**

```bash
docker build -t automacao-orange-hrm:local .
docker run --rm -e ADMIN_USER=Admin -e ADMIN_PASS=admin123 -e HEADLESS=true automacao-orange-hrm:local
```

---

## Scripts

| Comando                    | O que faz                               |
| -------------------------- | --------------------------------------- |
| `npm run lint`             | Analisa código TypeScript               |
| `npm run lint:fix`         | Corrige problemas automaticamente       |
| `npm run lint:types`       | Valida tipos em tempo de compilação     |
| `npm run build`            | Compila TypeScript                      |
| `npm run test:smoke`       | Executa os 7 cenários P0                |
| `npm run test:smoke:retry` | Retry para diagnóstico de flaky         |
| `npm run test:bdd`         | Executa todos os cenários automatizados |
| `npm run test`             | Usa Playwright Test diretamente         |
| `npm run report`           | Abre o relatório HTML                   |

## Nota: antes de executar em um host limpo, rode `npx playwright install --with-deps chromium`.

## CI/CD

O pipeline em [.github/workflows/ci.yml](.github/workflows/ci.yml) executa:

1. Lint + type-check
2. Smoke (primeira tentativa)
3. Retry automático se falhar
4. Publica artefatos de teste

Adicionalmente o workflow foi atualizado para:

- cache do `~/.npm` para acelerar builds
- publicar `playwright-report` como artefato

**Gates:**

- ✅ Se passar na primeira tentativa
- ❌ Se falhar na primeira tentativa (o retry é diagnóstico adicional)

**Evidências em falha:** screenshot, trace, video, relatórios JSON

### Secrets esperados no GitHub Actions

- `ORANGEHRM_ADMIN_USER` (Repository Secret)
- `ORANGEHRM_ADMIN_PASS` (Repository Secret)
- `ORANGEHRM_BASE_URL` (opcional, Repository Variable)

OBS: o workflow mapeia esses secrets para as variáveis `ADMIN_USER` e `ADMIN_PASS` usadas pela suíte local; mantenha o mapeamento caso altere nomes de secrets no repositório.

---

## Política de Flaky

- **Flaky** = teste falha 1ª vez, passa no retry
- **Regra** = retry executado para diagnóstico
- **Meta** = máximo 2% de flaky em 14 dias

---

## Boas práticas do projeto

- Cenários em português, linguagem declarativa (foca no "o quê", não no "como")
- Page Objects encapsulam seletores e ações
- Dados gerados dinamicamente para evitar colisões
- API usada para setup/cleanup rápido, UI para validação final
- Mensagens centralizadas em `src/support/messages.ts`

---

## Próximos passos

- [ ] Adicionar scanner de dependências e secrets
- [ ] Gate por tipo de mudança (reduz tempo de CI)
- [ ] Histórico de flaky por suíte
- [ ] Expandir para P1/P2 conforme demanda

---

## Troubleshooting rápido

Para passos rápidos de resolução de problemas, veja [docs/troubleshooting.md](docs/troubleshooting.md).

---
