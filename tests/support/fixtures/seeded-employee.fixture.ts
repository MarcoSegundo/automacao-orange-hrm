import { EmployeeFactory } from "../../../src/factories/employee.factory";
import { HybridPimService } from "../../../src/services/hybrid-pim.service";
import { TestMessages } from "../../../src/support/messages";
import { ScenarioWorld } from "../context/world";

// Tags que indicam que o cenário precisa de uma massa de apoio no PIM.
const SEEDED_EMPLOYEE_REQUIRED_TAGS = ["@search", "@seeded-employee", "@delete-employee"] as const;
const DELETE_EMPLOYEE_TAG = "@delete-employee";

/** Define em quais fluxos a massa de apoio deve ser preparada antes do cenário. */
export function shouldApplySeededEmployeeFixture(tagNames: string[]): boolean {
  return SEEDED_EMPLOYEE_REQUIRED_TAGS.some((tag) => tagNames.includes(tag));
}

/** Evita limpeza dupla quando o cenário já valida a exclusão como resultado final. */
export function shouldSkipSeededEmployeeCleanup(tagNames: string[]): boolean {
  return tagNames.includes(DELETE_EMPLOYEE_TAG);
}

/**
 * Prepara massa de apoio para cenários de busca/edição/exclusão.
 * A autenticação UI antecede a criação para compartilhar sessão com o client API.
 */
export async function setupSeededEmployeeFixture(world: ScenarioWorld, tagNames: string[] = []): Promise<void> {
  if (!world.page || !world.browserContext) {
    throw new Error(TestMessages.browserSessionNotInitialized);
  }

  const hybridService = new HybridPimService(world.page, world.browserContext);
  await hybridService.authenticateUi();

  const seeded = EmployeeFactory.unique("SEED");

  // Se for cenário de exclusão, cria via UI e salva credenciais
  if (tagNames.includes(DELETE_EMPLOYEE_TAG)) {
    const loginCredentials = {
      user: `${seeded.firstName.toLowerCase().slice(0, 6)}.${seeded.lastName.toLowerCase().slice(0, 6)}.${Date.now().toString().slice(-6)}`,
      pass: `HrM!${Date.now().toString().slice(-6)}Aa`
    };
    // Cria via UI
    world.seededEmployee = await hybridService.createSeedEmployeeViaUi(seeded.firstName, seeded.lastName, loginCredentials);
    // Salva credenciais para step de revogação
    world.employeeLoginCredentials = loginCredentials;
  } else {
    world.seededEmployee = await hybridService.createSeedEmployee(seeded.firstName, seeded.lastName);
  }

  await hybridService.dispose();
}

/** Remove a massa de apoio ao final do cenário para preservar idempotência. */
export async function cleanupSeededEmployeeFixture(world: ScenarioWorld): Promise<void> {
  if (!world.page || !world.browserContext || !world.seededEmployee) {
    return;
  }

  const cleanupService = new HybridPimService(world.page, world.browserContext);
  await cleanupService.deleteSeedEmployee(world.seededEmployee);
  await cleanupService.dispose();
}
