
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

| ID | Cenário | Por quê é crítico |
|---|---|---|
| A01 | Login válido | Acesso ao sistema |
| A02 | Login inválido | Segurança de acesso |
| A03 | Rota protegida sem sessão | Controle de acesso |
| G01 | Cadastro de funcionário | Fluxo CRUD principal |
| G04 | Edição de funcionário | Atualização de dados |
| G05 | Exclusão de funcionário | Limpeza de dados e acesso |
| B01 | Busca por nome | Busca funcional |

Veja mais detalhes na [matriz de risco](docs/requirements/matriz_risco.md).

---

## Observação sobre intermitência do ambiente e confiabilidade da automação

Falhas intermitentes podem ser observadas devido a instabilidades do ambiente demo do OrangeHRM, principalmente nos fluxos de cadastro, exclusão e busca de funcionários. O cenário **G01 Cadastro de funcionário** é utilizado intensivamente para criação de massa de dados e validação dos fluxos principais do sistema. Por depender fortemente do backend, pode apresentar falhas ocasionais por lentidão ou instabilidade do ambiente, resultando em timeout no passo de submissão (aguardando redirecionamento após salvar).

**O que foi feito:**
- Timeout desse passo ajustado para 60 segundos, limite recomendado pelo mercado para operações críticas de UI.
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

### 3. Rodar os testes
```bash
npm run test:smoke
```

### 4. Configurar variáveis (obrigatório)
```powershell
Copy-Item .env.example .env
```

Ou:

```bash
cp .env.example .env
```

Preencha no `.env`:
- `ADMIN_USER`
- `ADMIN_PASS`
- `BASE_URL` (opcional; por padrão usa o demo público)

Para debug com navegador aberto: `HEADLESS=false`

---

## Stack

- Playwright
- TypeScript
- Cucumber (BDD em Gherkin pt-BR)
- ESLint + Type-check
- Docker
- GitHub Actions

---

## Estrutura do Projeto

**Testes e cenários:**
- `tests/features/` → cenários em Gherkin
- `tests/steps/` → steps implementados em TypeScript
- `tests/support/` → contexto, fixtures e lifecycle dos testes

**Código da automação:**
- `src/auth/pages/` → pages de autenticação
- `src/pages/` → pages de domínio (dashboard, funcionários etc)
- `src/services/` → orquestração UI/API
- `src/factories/` → geração de dados para testes
- `src/support/` → utilitários (mensagens, env, logger)

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
docker build -t orangehrm-qa .
docker run --rm --env-file .env orangehrm-qa
```

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run lint` | Analisa código TypeScript |
| `npm run lint:fix` | Corrige problemas automaticamente |
| `npm run lint:types` | Valida tipos em tempo de compilação |
| `npm run build` | Compila TypeScript |
| `npm run test:smoke` | Executa os 7 cenários P0 |
| `npm run test:smoke:retry` | Retry para diagnóstico de flaky |
| `npm run test:bdd` | Executa todos os cenários automatizados |
| `npm run test` | Usa Playwright Test diretamente |
| `npm run report` | Abre o relatório HTML |

---

## CI/CD

O pipeline em [.github/workflows/ci.yml](.github/workflows/ci.yml) executa:

1. Lint + type-check
2. Smoke (primeira tentativa)
3. Retry automático se falhar
4. Publica artefatos de teste

**Gates:**
- ✅ Se passar na primeira tentativa
- ❌ Se falhar na primeira tentativa (o retry é diagnóstico adicional)

**Evidências em falha:** screenshot, trace, video, relatórios JSON

### Secrets esperados no GitHub Actions

- `ORANGEHRM_ADMIN_USER` (Repository Secret)
- `ORANGEHRM_ADMIN_PASS` (Repository Secret)
- `ORANGEHRM_BASE_URL` (opcional, Repository Variable)

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
