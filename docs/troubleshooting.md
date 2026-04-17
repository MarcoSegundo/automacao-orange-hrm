# Troubleshooting — Passos rápidos

Este guia reúne passos rápidos para diagnosticar e resolver falhas comuns na suíte smoke.

1. Verifique variáveis de ambiente

- Copie `.env.example` → `.env` e preencha `ADMIN_USER`, `ADMIN_PASS`, `BASE_URL` (se necessário).

2. Instalar e validar

- `npm ci`
- `npm run lint`
- `npm run lint:types`

_Após instalar dependências, instale os navegadores do Playwright se ainda não estiverem presentes:_

```bash
npx playwright install --with-deps chromium
```

3. Rodar smoke local (modo debug)

- `HEADLESS=false npm run test:smoke`
- Se falhar, rode `npm run test:smoke:retry` para diagnóstico.

Nota PowerShell: em PowerShell defina a variável antes do comando:

```powershell
$env:HEADLESS = 'false'
npm run test:smoke
```

4. Timeouts na submissão (G01/G05)

- Defina `NETWORK_TRACE_ON_SUBMIT=true` e rode localmente com `HEADLESS=false`.
- Verifique `playwright-report/` e `test-results/` (screenshots, traces e JSON).

Para coletar traces e evidências adicionais, verifique a configuração em `playwright.config.ts` (traces, screenshots, vídeo) e use `playwright-report/` para inspecionar o HTML gerado.

5. Em container/Docker

- `docker build -t automacao-orange-hrm:local .`
- `docker run --rm -e ADMIN_USER=Admin -e ADMIN_PASS=admin123 -e HEADLESS=true automacao-orange-hrm:local`

6. Limpeza de massa e inconsistências

- Use o serviço de seed/cleanup via API (HybridPimService) ou execute fixtures de limpeza quando necessário.

7. CI falhando

- Baixe os artefatos do GitHub Actions (`playwright-report`) e verifique screenshots/traces.
- Em caso de dúvida, abra issue/PR anexando o `playwright-report` e descrevendo passos reproduzíveis.

Contato:

- Ao abrir issue/PR, anexe logs e artefatos e descreva o cenário, branch e commit.
