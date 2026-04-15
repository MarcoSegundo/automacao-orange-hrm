/**
 * Mensagens que espelham textos visíveis da aplicação (UI).
 * Mantidas separadas para evitar misturar texto do sistema com logs/erros internos.
 */
export const SystemMessages = {
  invalidCredentials: "Invalid credentials",
  noRecordsFound: "No Records Found",
  addButton: "Add",
  confirmDelete: "Yes, Delete",
  logoutMenuItem: "Logout",
  employeeSearchPlaceholder: "Type for hints...",
  menuSearchPlaceholder: "Search"
} as const;

/**
 * Mensagens internas da automação (erros, fallback e diagnóstico).
 * Usadas por hooks, serviços e suporte de cenário.
 */
export const TestMessages = {
  pageNotInitialized: "Página não inicializada",
  credentialsNotInitialized: "Credenciais não inicializadas",
  employeeNotInitialized: "Funcionário não inicializado",
  seededEmployeeNotInitialized: "Massa de apoio não inicializada",
  apiDeleteUnexpectedBody: (payload: unknown) =>
    `A API de exclusão retornou corpo inesperado: ${JSON.stringify(payload)}`,
  apiRequestFailed: (status: number, body: string) =>
    `Requisição API falhou: ${status} ${body}`,
  apiCreateMissingId: (payload: unknown) =>
    `A API de criação retornou id ausente: ${JSON.stringify(payload)}`,
  scenarioFailed: (scenarioName: string) => `Cenário com falha: ${scenarioName}`,
  hybridApiSeedUnavailable: (reason: string) =>
    `API de seed indisponível, alternando para fallback via UI (${reason})`,
  hybridApiCleanupUnavailable: (reason: string) =>
    `API de limpeza indisponível, alternando para fallback via UI (${reason})`
} as const;
