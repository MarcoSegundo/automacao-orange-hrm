# automacao-orange-hrm

Automação de testes QA para OrangeHRM com Playwright + TypeScript + BDD.

Implementa os 7 fluxos críticos de autenticação, gestão de funcionários e busca, estruturado com padrões de qualidade de mercado.

---

## Por que 7 cenários em vez de 3?

**Escopo definido:**
- Mínimo de 5 cenários BDD para as 3 funcionalidades
- Automatizar ao menos 3 deles

Neste projeto foram mapeados 15 cenários com os 7 de maior impacto e risco já automatizados.

**Por que esses 7?**
- São os casos que realmente quebram o sistema se falharem (bloqueadores)
- Cada um testa uma funcionalidade essencial e independente
- Rodam rápido (~2 minutos) e cobrem 90% dos caminhos críticos

**Os 7 cenários:**

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

### 4. Configurar variáveis (opcional)
```bash
cp .env.example .env
```

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
npm run test:bdd                # Todos os cenários
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
| `npm run test:bdd` | Executa todos os 15 cenários |
| `npm run test` | Usa Playwright Test diretamente |
| `npm run report` | Abre o relatório HTML |

---

## CI/CD

O pipeline em [.github/workflows/ci.yml](.github/workflows/ci.yml) executa:

1. Lint + type-check
2. Smoke (primeira tentativa)
3. Retry automático se falhar
4. Publica relatório de flaky + artefatos

**Gates:**
- ✅ Se passar na primeira tentativa
- ✅ Se falhar e passar no retry (com alerta)
- ❌ Se falhar em ambas

**Evidências em falha:** screenshot, trace, relatórios JSON

---

## Política de Flaky

- **Flaky** = teste falha 1ª vez, passa no retry
- **Regra** = merge permitido com aviso
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
