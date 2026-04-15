import { EmployeeFactory } from "../../../src/factories/employee.factory";
import { HybridPimService } from "../../../src/services/hybrid-pim.service";
import { ScenarioWorld } from "../context/world";

const PIM_FLOW_TAGS = ["@pim", "@search"] as const;
const DELETE_EMPLOYEE_TAG = "@delete_employee";

/** Define em quais fluxos a massa de apoio deve ser preparada antes do cenário. */
export function shouldApplySeededEmployeeFixture(tagNames: string[]): boolean {
  return PIM_FLOW_TAGS.some((tag) => tagNames.includes(tag));
}

/** Evita limpeza dupla quando o cenário já valida a exclusão como resultado final. */
export function shouldSkipSeededEmployeeCleanup(tagNames: string[]): boolean {
  return tagNames.includes(DELETE_EMPLOYEE_TAG);
}

/**
 * Prepara massa de apoio para cenários de busca/edição/exclusão.
 * A autenticação UI antecede a criação para compartilhar sessão com o client API.
 */
export async function setupSeededEmployeeFixture(world: ScenarioWorld): Promise<void> {
  if (!world.page || !world.browserContext) {
    return;
  }

  const hybridService = new HybridPimService(world.page, world.browserContext);
  await hybridService.authenticateUi();

  const seeded = EmployeeFactory.unique("SEED");
  world.seededEmployee = await hybridService.createSeedEmployee(seeded.firstName, seeded.lastName);

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
