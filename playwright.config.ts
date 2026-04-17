import { defineConfig, devices } from '@playwright/test';

/**
 * Ler variáveis de ambiente a partir de arquivo (opcional).
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Configuração do Playwright Test.
 * Veja: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Executa testes em arquivos em paralelo */
  fullyParallel: true,
  /* Falha o build no CI se houver `test.only` deixado no código. */
  forbidOnly: !!process.env.CI,
  /* Retry somente quando explicitamente habilitado (execuções de diagnóstico). */
  retries: process.env.ENABLE_TEST_RETRIES === 'true' ? 2 : 0,
  /* Evita execução paralela de testes no CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporters configurados. Veja https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  /* Configurações compartilhadas para todos os projetos. Veja https://playwright.dev/docs/api/class-testoptions */
  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',

    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configura projetos para navegadores principais */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Testes contra viewports mobile. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Testes contra navegadores com canais específicos (Edge/Chrome). */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
