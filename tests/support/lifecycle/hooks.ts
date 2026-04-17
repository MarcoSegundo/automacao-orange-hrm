import { After, Before, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';
import { TestMessages, DebugMessages } from '../../../src/support/messages';
import { logError, logDebug } from '../../../src/support/logger';
import { resetStepContext } from '../context/scenario-context';
import {
  cleanupSeededEmployeeFixture,
  setupBrowserSessionFixture,
  setupSeededEmployeeFixture,
  shouldApplySeededEmployeeFixture,
  shouldSkipSeededEmployeeCleanup,
} from '../fixtures';
import { ScenarioWorld } from '../context/world';

setDefaultTimeout(60 * 1000);

/**
 * Inicializa a infraestrutura base do cenário:
 * - browser, context, page
 * - tracing para coleta de evidências
 */
Before(async function (this: ScenarioWorld) {
  await setupBrowserSessionFixture(this);
  logDebug(DebugMessages.browserSessionInitialized);
});

/**
 * Prepara massa de apoio (seed) para cenários que dependem do PIM.
 */
Before(async function (this: ScenarioWorld, hook: ITestCaseHookParameter) {
  const tagNames = hook.pickle.tags.map((tag) => tag.name);
  const needsHybridPimFlow = shouldApplySeededEmployeeFixture(tagNames);

  if (!needsHybridPimFlow || !this.page || !this.browserContext) {
    return;
  }

  await setupSeededEmployeeFixture(this, tagNames);
});

/**
 * Finaliza cenário: captura evidências em falha e realiza limpeza para manter independência entre execuções.
 */
After(async function (this: ScenarioWorld, hook: ITestCaseHookParameter) {
  if (!this.page || !this.browserContext || !this.browser) {
    return;
  }

  const tagNames = hook.pickle.tags.map((tag) => tag.name);
  // Nota: em cenários de exclusão, a limpeza extra é pulada porque o próprio teste já remove os dados.
  const skipCleanup = shouldSkipSeededEmployeeCleanup(tagNames);

  if (hook.result?.status === 'FAILED') {
    // Nota: coleta screenshot e tracing para diagnóstico em falhas (local e CI).
    await this.page.screenshot({ path: `test-results/${Date.now()}-failed.png`, fullPage: true });
    await this.browserContext.tracing.stop({ path: `test-results/${Date.now()}-trace.zip` });
    logError(TestMessages.scenarioFailed(hook.pickle.name));
  } else {
    await this.browserContext.tracing.stop();
  }

  if (this.seededEmployee && !skipCleanup) {
    await cleanupSeededEmployeeFixture(this);
  }

  await this.page.close();
  await this.browserContext.close();
  await this.browser.close();

  this.page = undefined;
  this.browserContext = undefined;
  this.browser = undefined;
  this.seededEmployee = undefined;
  resetStepContext(this);
});
