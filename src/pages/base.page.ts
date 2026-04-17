import { Page, Locator } from '@playwright/test';
import { logDebug } from '../support/logger';
import { env } from '../support/env';
import { TestMessages, DebugMessages } from '../support/messages';
import { retryWithBackoff } from '../support/retry';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Retorna o localizador mais resiliente entre os candidatos fornecidos.
   * Procura pelo primeiro que esteja visível e o retorna. Usar para evitar
   * duplicação de lógica de fallback entre Page Objects.
   */
  protected async waitUntilVisible(
    locator: Locator,
    timeout = env.inputTimeoutMs,
    pollInterval = 100,
  ): Promise<boolean> {
    const end = Date.now() + timeout;

    while (Date.now() < end) {
      try {
        if (await locator.isVisible()) return true;
      } catch (err) {
        logDebug(DebugMessages.waitUntilVisibleError(String(locator), String(err)));
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    return false;
  }

  protected async getBestInput(
    locators: Locator[],
    timeout = env.inputTimeoutMs,
  ): Promise<Locator> {
    for (const candidate of locators) {
      const candidateLocator = candidate.first();
      const visible = await this.waitUntilVisible(candidateLocator, timeout);
      if (visible) return candidateLocator;

      logDebug(DebugMessages.getBestInputCandidateNotVisible(String(candidateLocator)));
    }

    return locators[locators.length - 1].first();
  }

  /**
   * Tenta clicar no `locator` com tentativas e espera entre tentativas.
   * Usa `waitUntilVisible` para evitar exceções de controle de fluxo.
   */
  protected async clickWithRetries(
    locator: Locator,
    opts?: { attempts?: number; visibleTimeout?: number; waitBetweenMs?: number },
  ): Promise<void> {
    const attempts = opts?.attempts ?? env.clickRetryAttempts;
    const visibleTimeout = opts?.visibleTimeout ?? env.clickRetryTimeoutMs;
    const waitBetweenMs = opts?.waitBetweenMs ?? env.clickWaitBetweenMs;

    await retryWithBackoff(
      async () => {
        const visible = await this.waitUntilVisible(locator, visibleTimeout);
        if (!visible) {
          throw new Error(TestMessages.elementNotVisibleForClick(visibleTimeout));
        }
        await locator.click();
      },
      attempts,
      waitBetweenMs,
      (attempt, err) => {
        logDebug(DebugMessages.clickAttemptFailed(attempt, String(locator), String(err)));
      },
    );
  }
}
