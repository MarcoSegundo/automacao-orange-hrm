/**
 * Mensagens que espelham textos visíveis da aplicação (UI).
 * Mantidas separadas para evitar misturar texto do sistema com logs/erros internos.
 */
export const SystemMessages = {
  invalidCredentials: 'Invalid credentials',
  noRecordsFound: 'No Records Found',
} as const;

/**
 * Mensagens internas da automação (erros, fallback e diagnóstico).
 * Usadas por hooks, serviços e suporte de cenário.
 */
export const TestMessages = {
  pageNotInitialized: 'Página não inicializada',
  browserSessionNotInitialized: 'Sessão de browser não inicializada',
  credentialsNotInitialized: 'Credenciais não inicializadas',
  envVarNotInitialized: (name: string) =>
    `Variável de ambiente obrigatória não inicializada: ${name}`,
  envVarNotANumber: (name: string, val: string) =>
    `Variável de ambiente deve ser numérica: ${name}='${val}'`,
  employeeLoginCredentialsNotInitialized: 'Credenciais de login do funcionário não inicializadas',
  employeeNotInitialized: 'Funcionário não inicializado',
  seededEmployeeNotInitialized: 'Massa de apoio não inicializada',
  apiDeleteUnexpectedBody: (payload: unknown) =>
    `A API de exclusão retornou corpo inesperado: ${JSON.stringify(payload)}`,
  apiRequestFailed: (status: number, body: string) => `Requisição API falhou: ${status} ${body}`,
  apiCreateMissingId: (payload: unknown) =>
    `A API de criação retornou id ausente: ${JSON.stringify(payload)}`,
  scenarioFailed: (scenarioName: string) => `Cenário com falha: ${scenarioName}`,
  hybridApiSeedUnavailable: (reason: string) =>
    `API de seed indisponível, alternando para fallback via UI (${reason})`,
  hybridApiCleanupUnavailable: (reason: string) =>
    `API de limpeza indisponível, alternando para fallback via UI (${reason})`,
  hybridAuthUiSuccess: 'HybridPimService: autenticação via UI realizada',
  hybridSeedDeletedViaApi: (id: string) => `HybridPimService: seed excluído via API (${id})`,
  hybridSeedDeletedViaUi: (name: string) =>
    `HybridPimService: seed excluído via UI fallback (${name})`,
  hybridFallbackUiFailed: (err: string) => `HybridPimService: fallback UI falhou -> ${err}`,
  employeeListReadyTimeout: (timeout: number) =>
    `Tempo esgotado aguardando lista de funcionários: ${timeout}ms`,
  employeeNotFoundForDelete: (name: string) =>
    `Nenhum funcionário encontrado para exclusão com o nome: "${name}"`,
  loginRetryAttempt: (attempt: number, user: string) =>
    `loginWithRetry: tentativa ${attempt} para '${user}'`,
  loginRetrySuccess: (attempt: number, user: string) =>
    `loginWithRetry: sucesso na tentativa ${attempt} para '${user}'`,
  loginRetryFailure: (attempt: number, err: unknown) =>
    `loginWithRetry: falha tentativa ${attempt} -> ${String(err)}`,
  elementNotVisibleForClick: (timeout: number) =>
    `Elemento não ficou visível para clique após ${timeout}ms`,
} as const;

export const DebugMessages = {
  getBestInputCandidateNotVisible: (locator: string) =>
    `getBestInput: localizador não visível dentro do timeout (${locator})`,
  clickAttemptFailed: (attempt: number, locator: string, err?: string) =>
    `clickWithRetries: tentativa ${attempt} falhou para ${locator} -> ${err ?? ''}`,
  hybridApiAttemptFailure: (attempt: number, err: string) =>
    `HybridPimService: tentativa API ${attempt} falhou -> ${err}`,
  waitUntilVisibleError: (locator: string, err?: string) =>
    `waitUntilVisible: falha ao verificar visibilidade (${locator}) -> ${err ?? ''}`,
  browserSessionInitialized: 'BrowserSessionFixture: browser/context/page inicializado',
  hybridSeedCreationRequested: (firstName: string, lastName: string) =>
    `HybridPimService: solicitada criação de seed (${firstName} ${lastName})`,
  hybridSeedDeletionRequested: (id: string) =>
    `HybridPimService: solicitada exclusão de seed (${id})`,
  retryOnBeforeAttemptCallbackFailed: (attempt: number, err?: string) =>
    `retryWithBackoff: onBeforeAttempt callback falhou na tentativa ${attempt} -> ${err ?? ''}`,
  retryOnAttemptCallbackFailed: (attempt: number, err?: string) =>
    `retryWithBackoff: onAttempt callback falhou na tentativa ${attempt} -> ${err ?? ''}`,
} as const;
