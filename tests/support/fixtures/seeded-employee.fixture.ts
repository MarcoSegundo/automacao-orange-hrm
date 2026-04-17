import { EmployeeFactory } from '../../../src/modules/pim';
import { TestMessages } from '../../../src/support/messages';
import { ScenarioWorld } from '../context/world';
import { ServiceFactory } from '../../../src/services/service-factory';

/** Tags que indicam que o cenário precisa de uma massa de apoio no PIM. */
const SEEDED_EMPLOYEE_REQUIRED_TAGS = ['@search', '@seeded-employee', '@delete-employee'] as const;
const DELETE_EMPLOYEE_TAG = '@delete-employee';

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
 *
 * Fluxo:
 * 1. Autentica via UI para compartilhar sessão (necessário para o client API).
 * 2. Tenta criar o employee + usuário via API (mais rápido).
 * 3. Se a API falhar, realiza criação via UI como fallback.
 * 4. Salva o seed no `world` para uso nos passos do cenário.
 *
 * @param world - contexto da cena (contém `page` e `browserContext`)
 * @param tagNames - tags do cenário (usado para decidir se a fixture se aplica)
 */
export async function setupSeededEmployeeFixture(
  world: ScenarioWorld,
  tagNames: string[] = [],
): Promise<void> {
  if (!world.page || !world.browserContext) {
    throw new Error(TestMessages.browserSessionNotInitialized);
  }

  const serviceFactory = new ServiceFactory(world.page, world.browserContext);
  const hybridService = serviceFactory.getHybridPimService();
  await hybridService.authenticateUi();

  const seeded = EmployeeFactory.unique('SEED');

  const { seed, credentials } = await hybridService.createSeedEmployeeWithUser(
    seeded.firstName,
    seeded.lastName,
  );
  world.seededEmployee = seed;
  if (tagNames.includes(DELETE_EMPLOYEE_TAG)) {
    world.employeeLoginCredentials = credentials;
  }

  await hybridService.dispose();
}

/** Remove a massa de apoio ao final do cenário para preservar idempotência. */
export async function cleanupSeededEmployeeFixture(world: ScenarioWorld): Promise<void> {
  if (!world.page || !world.browserContext || !world.seededEmployee) {
    return;
  }

  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const serviceFactory = new ServiceFactory(world.page, world.browserContext);
    const cleanupService = serviceFactory.getHybridPimService();
    try {
      await cleanupService.deleteSeedEmployee(world.seededEmployee);
      await cleanupService.dispose();
      return;
    } catch (err) {
      lastError = err;
      await cleanupService.dispose();
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }

  /**
   * Nota: se todas as tentativas falharem, relança o último erro para que o hook
   * de After/Cleanup falhe e permita coleta de evidências no CI/local.
   */
  throw lastError;
}
