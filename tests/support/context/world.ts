import { IWorldOptions, World, setWorldConstructor } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import type { HybridSeed } from "../../../src/modules/pim/services/hybrid-pim.service";

export type AuthCredentials = {
  user: string;
  pass: string;
};

export type ScenarioEmployee = {
  firstName: string;
  lastName: string;
  updatedLastName?: string;
};

/**
 * Container de dependências com escopo por cenário do Cucumber.
 * Centraliza estado transitório para evitar compartilhamento indevido entre testes.
 */
export class ScenarioWorld extends World {
  browser?: Browser;
  browserContext?: BrowserContext;
  page?: Page;
  credentials?: AuthCredentials;
  employeeLoginCredentials?: AuthCredentials;
  employee?: ScenarioEmployee;
  seededEmployee?: HybridSeed;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(ScenarioWorld);