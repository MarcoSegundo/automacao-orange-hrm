import { chromium } from "@playwright/test";
import { env } from "../../../src/support/env";
import { logInfo } from "../../../src/support/logger";
import { ScenarioWorld } from "../context/world";

/** Inicializa browser/context/page por cenário para isolamento de execução. */
export async function setupBrowserSessionFixture(world: ScenarioWorld): Promise<void> {
  const browser = await chromium.launch({
    headless: env.headless,
    args: ["--window-size=1920,1080"]
  });
  const browserContext = await browser.newContext({
    baseURL: env.baseUrl,
    viewport: { width: 1920, height: 1080 }
  });

  await browserContext.tracing.start({ screenshots: true, snapshots: true });
  const page = await browserContext.newPage();

  world.browser = browser;
  world.browserContext = browserContext;
  world.page = page;

  logInfo("BrowserSessionFixture: browser/context/page initialized");
}
